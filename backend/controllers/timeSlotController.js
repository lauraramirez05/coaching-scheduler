import { Op } from 'sequelize';
import TimeSlot from '../models/TimeSlot.js';
import TimeSlotCoaches from '../models/TimeSlotCoaches.js';
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
      const createdLink = await TimeSlotCoaches.create({
        time_slot_id: timeSlotId,
        coach_id: coachId,
        status: 'available',
      });
      createdLinks.push(createdLink);
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

export { addTimeSlot };
