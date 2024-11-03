import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import TimeSlot from '../models/TimeSlot.js';
import TimeSlotCoaches from '../models/TimeSlotCoaches.js';
import Coach from '../models/Coach.js';
import moment from 'moment-timezone';

// Add new time slot
const addTimeSlot = async (req, res) => {
  const { timeSlots, coachId, timeZone } = req.body;

  console.log('TIME SLOTS', timeSlots);

  // Validate that timeSlots is provided and is an object
  if (!timeSlots || typeof timeSlots !== 'object') {
    return res.status(400).json({ message: 'Invalid time slots data.' });
  }

  const errors = [];
  const createdLinks = [];

  // Process each time slot
  for (const date in timeSlots) {
    console.log('inside loop');
    const { startTime, endTime } = timeSlots[date];
    console.log('TIMES', [startTime, endTime]);

    // Local time conversion
    const startTimeLocal = moment.tz(startTime, timeZone);
    const endTimeLocal = moment.tz(endTime, timeZone);

    // Validate times
    if (startTimeLocal.isBefore(moment())) {
      errors.push(`Start time for ${date} must be today or in the future.`);
      continue; // Skip to the next time slot
    }

    console.log('Validated that is not a past date');

    const businessStart = startTimeLocal.clone().set({ hour: 8, minute: 0 });
    const businessEnd = startTimeLocal.clone().set({ hour: 18, minute: 0 });

    if (
      startTimeLocal.isBefore(businessStart) ||
      startTimeLocal.isAfter(businessEnd)
    ) {
      errors.push(
        `Start time for ${date} must be between 8:00 AM and 6:00 PM in your timezone.`
      );
      continue; // Skip to the next time slot
    }

    console.log('Validate that is whithin business hours');

    // Convert to UTC
    const startTimeUtc = startTimeLocal.utc().toISOString();
    const endTimeUtc = endTimeLocal.utc().toISOString();

    console.log('Turn timo into UTC', [startTimeUtc, endTimeUtc]);

    try {
      const existingTimeSlot = await TimeSlot.findOne({
        where: { start_time: startTimeUtc, end_time: endTimeUtc },
      });

      let timeSlotId;
      if (!existingTimeSlot) {
        console.log(`This time slot doesn't exist`);
        const newTimeSlot = await TimeSlot.create({
          start_time: startTimeUtc,
          end_time: endTimeUtc,
        });
        timeSlotId = newTimeSlot.id;
        console.log('new time slot created', newTimeSlot);
      } else {
        timeSlotId = existingTimeSlot.id;
      }

      // Create link for this time slot to the coach
      const repeatedTimeSlotCoach = await TimeSlotCoaches.findOne({
        where: { coach_id: coachId, time_slot_id: timeSlotId },
      });
      if (repeatedTimeSlotCoach) {
        errors.push(
          `There is already a time slot assigned to this coach from ${startTime} to ${endTime}.`
        );
      } else {
        const createdLink = await TimeSlotCoaches.create({
          time_slot_id: timeSlotId,
          coach_id: coachId,
          status: 'available',
        });
        console.log('created a link with the coach', createdLink);
        createdLinks.push({
          ...createdLink,
          start_time: startTime,
          end_time: endTime,
        });
      }
    } catch (error) {
      errors.push(`Error creating time slot for ${date}: ${error.message}`);
    }
  }

  // Prepare response
  if (errors.length > 0) {
    res.status(207).json({
      message: 'Partial success: some time slots were not added.',
      errors,
      createdLinks,
    });
  } else {
    res.status(201).json({
      message: 'All valid time slots added successfully.',
      createdLinks,
    });
  }
};

//Upcoming Meetings
const getUpcomingMeetingsForCoach = async (req, res) => {
  const { coachId, timezone } = req.params;

  try {
    const rawQuery = `
      SELECT
        tsc.id AS tsc_id,
        tsc.coach_id,
        tsc.status,
        ts.id AS time_slot_id,
        ts.start_time,
        ts.end_time
      FROM
        time_slot_coaches tsc
      JOIN
        time_slots ts ON tsc.time_slot_id = ts.id
      WHERE
        tsc.coach_id = ? AND ts.start_time > NOW()
      ORDER BY
        ts.start_time ASC
    `;

    const results = await sequelize.query(rawQuery, {
      replacements: [coachId],
      type: Sequelize.QueryTypes.SELECT,
    });

    const alteredTimes = results.map((slot) => {
      const startTimeUTC = moment.utc(slot.start_time);
      const endTimeUTC = moment.utc(slot.end_time);

      console.log('Start time (UTC):', startTimeUTC.format());
      console.log('End time (UTC):', endTimeUTC.format());

      return {
        ...slot,
        start_time: startTimeUTC.tz(timezone).format(), // Convert to target timezone
        end_time: endTimeUTC.tz(timezone).format(), // Convert to target timezone
      };
    });

    res.status(201).json(alteredTimes);
  } catch (error) {
    console.error('Error retrieving upcoming meetings:', error);
    res.status(400).json({ message: 'Error retrieving upcoming meetings' });
  }
};

//Available Meetings for students
const availableMeetingForStudents = async (req, res) => {
  const { coaches } = req.query;
  console.log('REQ', req.query);
  console.log('coach id receiving query', coaches);

  const coachIdString = Array.isArray(coaches)
    ? coaches.map((coach) => `'${coach}'`).join(',')
    : `'${coaches}'`;
  try {
    const rawQueryAllCoaches = `
    SELECT
      ts.id AS time_slot_id,
      ts.start_time,
      ts.end_time,
      tsc.coach_id,
      c.name AS coach_name
    FROM
      time_slots ts
    LEFT JOIN
      time_slot_coaches tsc ON ts.id = tsc.time_slot_id
    JOIN
      coaches c ON tsc.coach_id = c.id
    WHERE
      tsc.status = 'available'
      AND ts.start_time >= NOW()
    ORDER BY
      ts.start_time ASC;`;

    const rawQuerySelectedCoaches = `
    SELECT 
      ts.id AS time_slot_id,
      ts.start_time,
      ts.end_time,
      tsc.coach_id,
      c.name AS coach_name
    FROM 
      time_slot_coaches tsc
    JOIN 
      time_slots ts ON tsc.time_slot_id = ts.id
    JOIN 
      coaches c ON tsc.coach_id = c.id
    WHERE 
      tsc.coach_id IN (${coachIdString})
      AND tsc.status = 'available'
      AND ts.start_time >= NOW()
    ORDER BY 
      ts.start_time ASC;

    `;

    let availableMeetings;

    if (coaches) {
      availableMeetings = await sequelize.query(rawQuerySelectedCoaches, {
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(availableMeetings);
    } else {
      console.log('here');
      availableMeetings = await sequelize.query(rawQueryAllCoaches, {
        type: Sequelize.QueryTypes.SELECT,
      });
    }

    const mapMeetings = {};

    availableMeetings.forEach((meeting) => {
      if (mapMeetings[meeting.time_slot_id]) {
        mapMeetings[meeting.time_slot_id].coaches.push({
          id: meeting.coach_id,
          name: meeting.coach_name,
        });
      } else {
        mapMeetings[meeting.time_slot_id] = {
          time_slot_id: meeting.time_slot_id,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          coaches: [{ id: meeting.coach_id, name: meeting.coach_name }],
        };
      }
    });

    console.log(mapMeetings);
    res.status(201).json(mapMeetings);
  } catch (error) {
    console.error('Error to retrieve the available meetings', error);
  }
};

const validateBookingData = async (req, res) => {
  console.log('REQ BODY', req.body);

  const { time_slot_id, coach_id, student_id } = req.body;
  console.log('Booking details', [time_slot_id, coach_id, student_id]);
  // const { time_slot_id, coach_id, student_id } = bookingDetails;

  try {
    const timeSlot = await TimeSlotCoaches.findOne({
      where: {
        time_slot_id,
        coach_id,
      },
    });

    // Check if the time slot exists and if it is already booked
    if (!timeSlot) {
      return res
        .status(404)
        .json({ message: 'Time slot not found, refresh and try again' });
    }
    console.log('Status', timeSlot.status);
    if (timeSlot.status === 'booked') {
      return res
        .status(400)
        .json({ message: 'This time slot is already booked' });
    }
    console.log('hello');
    // Update the time slot to mark it as booked
    const updatedTimeSlot = await timeSlot.update({
      status: 'booked',
      participants: student_id,
    });

    const coach = await Coach.findOne({
      where: {
        id: coach_id,
      },
      attributes: ['phone'],
    });

    console.log('PHONE COACH', coach);

    return res.status(200).json({
      message: 'Booking successful',
      updatedTimeSlot,
      coachPhone: coach.phone, // Send the coach's phone number
    });
  } catch (error) {
    console.error('Error during booking validation:', error);
    return res
      .status(500)
      .json({ message: `The time slot couldn't be booked, try again` });
  }
};

export {
  addTimeSlot,
  getUpcomingMeetingsForCoach,
  availableMeetingForStudents,
  validateBookingData,
};
