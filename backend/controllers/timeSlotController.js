import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import TimeSlot from '../models/TimeSlot.js';
import TimeSlotCoaches from '../models/TimeSlotCoaches.js';
import Coach from '../models/Coach.js';
import moment from 'moment-timezone';

// Add new time slot
const addTimeSlot = async (req, res) => {
  const { timeSlots, coachId, timeZone } = req.body;

  // Validate that timeSlots is provided and is an object
  if (!timeSlots || typeof timeSlots !== 'object') {
    return res.status(400).json({ message: 'Invalid time slots data.' });
  }

  const errors = [];
  const createdLinks = [];

  // Process each time slot
  for (const date in timeSlots) {
    const { startTime, endTime } = timeSlots[date];

    // Local time conversion
    const startTimeLocal = moment.tz(startTime, timeZone);
    const endTimeLocal = moment.tz(endTime, timeZone);

    // Validate times
    if (startTimeLocal.isBefore(moment())) {
      errors.push(`Start time for ${date} must be today or in the future.`);
      continue; // Skip to the next time slot
    }

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

    // Convert to UTC
    const startTimeUtc = startTimeLocal.utc().toISOString();
    const endTimeUtc = endTimeLocal.utc().toISOString();

    try {
      //check for overlapping timeslot
      const overlappingTimeSlots = await sequelize.query(
        `
        SELECT *
        FROM time_slot_coaches AS tsc
        JOIN time_slots AS ts ON tsc.time_slot_id = ts.id
        WHERE tsc.coach_id = :coachId
        AND ts.start_time < :endTimeUtc
        AND ts.end_time > :startTimeUtc;
        `,
        {
          replacements: {
            coachId: coachId,
            endTimeUtc: endTimeUtc,
            startTimeUtc: startTimeUtc,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (overlappingTimeSlots.length > 0) {
        errors.push(
          `There is an overlapping time slot for this coach on ${moment(
            date
          ).format('dddd MMM D YYYY')} from ${moment(startTime).format(
            'HH:mm '
          )} to ${moment(endTime).format('HH:mm ')}`
        );
        continue;
      }

      const existingTimeSlot = await TimeSlot.findOne({
        where: { start_time: startTimeUtc, end_time: endTimeUtc },
      });

      let timeSlotId;
      if (!existingTimeSlot) {
        const newTimeSlot = await TimeSlot.create({
          start_time: startTimeUtc,
          end_time: endTimeUtc,
        });
        timeSlotId = newTimeSlot.id;
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
const getAllMeetingsForCoach = async (req, res) => {
  const { coachId, timezone } = req.params;

  try {
    const rawQuery = `
      SELECT
        tsc.id AS tsc_id,
        tsc.coach_id,
        tsc.status,
        ts.id AS time_slot_id,
        ts.start_time,
        ts.end_time,
        s.name AS student_name,
        s.phone AS student_phone
      FROM
        time_slot_coaches tsc
      JOIN
        time_slots ts ON tsc.time_slot_id = ts.id
      LEFT JOIN
        students s ON tsc.participants = s.id
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

const getPastMeetingsForCoach = async (req, res) => {
  const { coachId, timezone } = req.params;

  try {
    const rawQuery = `
    SELECT
        tsc.id AS tsc_id,
        tsc.coach_id,
        tsc.status,
        tsc.rating,
        tsc.notes,
        participants,
        ts.id AS time_slot_id,
        ts.start_time,
        ts.end_time,
        s.name AS student_name
      FROM
        time_slot_coaches tsc
      JOIN
        time_slots ts ON tsc.time_slot_id = ts.id
      LEFT JOIN
        students s ON tsc.participants = s.id
      WHERE
        tsc.coach_id = ? AND ts.start_time < NOW() AND tsc.participants IS NOT NULL
      ORDER BY
        ts.start_time ASC
    `;

    const pastMeetings = await sequelize.query(rawQuery, {
      replacements: [coachId],
      type: Sequelize.QueryTypes.SELECT,
    });

    for (const meeting of pastMeetings) {
      await sequelize.query(
        `UPDATE time_slot_coaches SET status = 'completed' WHERE id = ?`,
        {
          replacements: [meeting.tsc_id],
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }

    const updatedMeetings = await sequelize.query(rawQuery, {
      replacements: [coachId],
      type: Sequelize.QueryTypes.SELECT,
    });

    const alteredTimes = updatedMeetings.map((slot) => {
      const startTimeUTC = moment.utc(slot.start_time);
      const endTimeUTC = moment.utc(slot.end_time);

      return {
        ...slot,
        start_time: startTimeUTC.tz(timezone).format(),
        end_time: endTimeUTC.tz(timezone).format(),
      };
    });

    res.status(201).json(alteredTimes);
  } catch (error) {
    console.error('Error retrieving past meetings', error);
    res.status(400).json({ message: 'Error retrieving past meetings' });
  }
};

const submitReview = async (req, res) => {
  const { tsc_id, rating, notes } = req.body;

  try {
    const timeSlot = await TimeSlotCoaches.findOne({ where: { id: tsc_id } });

    if (timeSlot) {
      timeSlot.rating = rating;
      timeSlot.notes = notes;

      await timeSlot.save();

      res.status(201).json(timeSlot);
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: `Time Slot couldn't have been updated, try again` });
  }
};

//Available Meetings for students
const availableMeetingForStudents = async (req, res) => {
  const { coaches } = req.query;

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
    } else {
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

    res.status(201).json(mapMeetings);
  } catch (error) {
    console.error('Error to retrieve the available meetings', error);
  }
};

const getBookedMeetingsForStudent = async (req, res) => {
  const { userId, timezone } = req.params;

  try {
    const rawQuery = `
      SELECT
        tsc.id AS tsc_id,
        tsc.coach_id,
        tsc.participants,
        tsc.status,
        ts.id AS time_slot_id,
        ts.start_time,
        ts.end_time,
        c.name AS coach_name,
        c.phone AS coach_phone
      FROM
        time_slot_coaches tsc
      JOIN
        time_slots ts ON tsc.time_slot_id = ts.id
      LEFT JOIN
        students s ON tsc.participants = s.id
      LEFT JOIN
        coaches c ON tsc.coach_id = c.id
      WHERE
        tsc.participants = ? AND ts.start_time > NOW() AND tsc.status = 'booked'
      ORDER BY
        ts.start_time ASC
    `;

    const bookedMeetings = await sequelize.query(rawQuery, {
      replacements: [userId],
      type: Sequelize.QueryTypes.SELECT,
    });

    const alteredTimes = bookedMeetings.map((slot) => {
      const startTimeUTC = moment.utc(slot.start_time);
      const endTimeUTC = moment.utc(slot.end_time);

      return {
        ...slot,
        start_time: startTimeUTC.tz(timezone).format(),
        end_time: endTimeUTC.tz(timezone).format(),
      };
    });

    res.status(201).json(alteredTimes);
  } catch (error) {
    console.error('Error retrieving booked meetings for this student', error);
    res.status(400).json({ message: 'Error retrieving booked meetings' });
  }
};

const validateBookingData = async (req, res) => {
  const { time_slot_id, coach_id, student_id } = req.body;

  // const { time_slot_id, coach_id, student_id } = bookingDetails;

  try {
    const timeSlot = await sequelize.query(
      `
    SELECT 
      tsc.id AS time_slot_coaches_id,
      tsc.time_slot_id,
      ts.start_time,
      ts.end_time,
      tsc.coach_id,
      tsc.status,
      tsc.participants
    FROM 
      time_slot_coaches AS tsc
    JOIN 
      time_slots AS ts ON tsc.time_slot_id = ts.id
    WHERE 
      tsc.time_slot_id = :timeSlotId
    AND 
      tsc.coach_id = :coachId
    LIMIT 1;
    `,
      {
        replacements: {
          timeSlotId: time_slot_id,
          coachId: coach_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Check if the time slot exists and if it is already booked
    if (!timeSlot) {
      return res
        .status(404)
        .json({ message: 'Time slot not found, refresh and try again' });
    }
    if (timeSlot.status === 'booked') {
      return res
        .status(400)
        .json({ message: 'This time slot is already booked' });
    }

    const newStartTime = timeSlot[0].start_time;
    const newEndTime = timeSlot[0].end_time;

    //check for overlapping

    const overlappingBookings = await sequelize.query(
      `
    SELECT *
    FROM time_slot_coaches AS tsc
    JOIN time_slots AS ts ON tsc.time_slot_id = ts.id
    WHERE tsc.participants = :studentId
    AND (
      (ts.start_time < :newEndTime AND ts.end_time > :newStartTime)
    )
    `,
      {
        replacements: {
          studentId: student_id,
          newStartTime: newStartTime,
          newEndTime: newEndTime,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        message:
          'You have overlapping bookings, please choose a different time slot.',
      });
    }

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

    return res.status(200).json({
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
  getAllMeetingsForCoach,
  getPastMeetingsForCoach,
  submitReview,
  availableMeetingForStudents,
  getBookedMeetingsForStudent,
  validateBookingData,
};
