import { Op } from 'sequelize';
import TimeSlot from '../models/TimeSlot.js';
import TimeSlotCoaches from '../models/TimeSlotCoaches.js';
import moment from 'moment-timezone';

// Add new time slot
const addTimeSlot = async (req, res) => {
  console.log('Request to add new time slot:', req.body);
  const { startTime, endTime, coachId, timeZone } = req.body;

  // Local time conversion and validation
  const startTimeLocal = moment.tz(startTime, timeZone);
  const endTimeLocal = moment.tz(endTime, timeZone);

  console.log('Local Time', [startTimeLocal.format(), endTimeLocal.format()]);

  if (startTimeLocal.isBefore(moment())) {
    return res
      .status(400)
      .json({ message: 'Start time must be today or in the future.' });
  }

  const businessStart = startTimeLocal.clone().set({ hour: 8, minute: 0 });
  const businessEnd = startTimeLocal.clone().set({ hour: 18, minute: 0 });

  console.log('Business hours', [businessStart, businessEnd]);

  if (
    startTimeLocal.isBefore(businessStart) ||
    startTimeLocal.isAfter(businessEnd)
  ) {
    return res.status(400).json({
      message:
        'Start time must be between 8:00 AM and 6:00 PM in your timezone.',
    });
  }

  // Convert to UTC
  const startTimeUtc = startTimeLocal.utc().toISOString();
  const endTimeUtc = endTimeLocal.utc().toISOString();
  console.log('UTC times:', { startTimeUtc, endTimeUtc });

  try {
    const existingTimeSlot = await TimeSlot.findOne({
      where: { start_time: startTimeUtc, end_time: endTimeUtc },
    });

    let timeSlotId;
    if (!existingTimeSlot) {
      const newTimeSlot = await TimeSlot.create({
        start_time: startTimeUtc,
        end_time: endTimeUtc,
      });
      console.log('New time slot created:', newTimeSlot);
      timeSlotId = newTimeSlot.id;
    } else {
      timeSlotId = existingTimeSlot.id;
      const duplicateSlotForCoach = await TimeSlotCoaches.findOne({
        where: { coach_id: coachId, time_slot_id: timeSlotId },
      });
      if (duplicateSlotForCoach) {
        return res.status(409).json({
          message:
            'A time slot already exists for this coach during the specified time.',
        });
      }
    }

    const createdLink = await TimeSlotCoaches.create({
      time_slot_id: timeSlotId,
      coach_id: coachId,
      status: 'available',
    });
    console.log('Time slot linked to the coach:', createdLink);
    res
      .status(201)
      .json({ message: 'Time slot added successfully', createdLink });
  } catch (error) {
    res
      .status(400)
      .json({ message: `The time slot couldn't be added: ${error.message}` });
  }
};

export { addTimeSlot };
