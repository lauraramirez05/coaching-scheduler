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

export interface TimeSlotCoach {
  tsc_id: string;
  time_slot_id: string;
  coach_id: string;
  status: 'available' | 'booked' | 'completed';
  start_time: string;
  end_time: string;
  participants?: string; // Optional
  rating?: number; // Optional
  notes?: string; // Optional
}

interface coaches {
  id: string;
  name: string;
}

export interface AvailableMeetingsStudents {
  time_slot_id: string;
  start_time: string;
  end_time: string;
  coaches: coaches[];
}

export interface SelectedBooking {
  coach_id: string;
  time_slot_id: string;
  user_id: string;
}

export type UpcomingMeetingsResponse = TimeSlotCoach[];

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
  }
};

export const getUpcomingMeetingsForCoach = async (
  coachId: string,
  timezone: string
): Promise<UpcomingMeetingsResponse | void> => {
  const encodedTimezone = encodeURIComponent(timezone);
  try {
    const response = await fetch(
      `${url}/api/timeSlots/${coachId}/${encodedTimezone}/upcoming`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve upcoming meetings');
    }

    return await response.json();
  } catch (error) {
    console.error('Failure to retrieve upcoming meetings');
  }
};

export const getAllAvailableMeetingsForStudents = async (
  coaches: string[] = []
): Promise<AvailableMeetingsStudents | void> => {
  try {
    const newUrl = new URL(`${url}/api/timeSlots/available`);
    if (coaches.length > 0) {
      coaches.forEach((coach) => newUrl.searchParams.append('coaches', coach));
    }

    console.log('URL', newUrl);
    const response = await fetch(newUrl);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching available meetings:', error);
  }
};

export const bookTimeSlot = async (bookingDetails: SelectedBooking) => {
  try {
    const response = await fetch(`${url}/api/timeSlots/book`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time_slot_id: bookingDetails.time_slot_id,
        coach_id: bookingDetails.coach_id,
        student_id: bookingDetails.user_id,
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: 'error',
        message: errorData.message || 'An error occurred while booking.',
      };
    }

    const data = await response.json();
    return {
      data,
      status: 'success',
      message: data.message || 'Booking successful!',
    };
  } catch (error) {
    console.error('Failure to confirm booking:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
};
