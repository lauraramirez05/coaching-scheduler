import { Dayjs } from 'dayjs';

export interface TimeSlot {
  startTime: Dayjs | string;
  endTime: Dayjs | string;
  validSession: boolean;
}

export interface DailyAppointmentSlots {
  [date: string]: TimeSlot | string;
}

export interface CoachSchedule {
  timeSlots: DailyAppointmentSlots;
  coachId: string;
  timeZone: string;
}

export interface TimeSlotResponse {}

const url = 'http://localhost:5001';

export const createTimeSlots = async (schedule: CoachSchedule) => {
  console.log('SCHEDULE', schedule);
  try {
    const response = await fetch(`${url}/api/timeSlots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error('Failed to create time slots');
    }
    return await response.json();
  } catch (error) {
    console.error(`The Time Slots coudln't be created`);
    return undefined;
  }
};
