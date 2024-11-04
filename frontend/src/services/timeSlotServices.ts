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
  notes?: string;
  student_name?: string;
  student_phone?: string;
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
  status?: string;
}

export interface SelectedBooking {
  coach_id: string;
  time_slot_id: string;
  user_id: string;
}

interface BookTimeSlotSuccess {
  data: {
    updatedTimeSlot: {
      id: number;
      status: string;
      participants: number[];
      // add other properties as necessary from `updatedTimeSlot`
    };
    coachPhone: string;
  };
  status: 'success';
  message: string;
}

interface BookTimeSlotError {
  status: 'error';
  message: string;
}

export type BookTimeSlotResponse = BookTimeSlotSuccess | BookTimeSlotError;

const url = 'http://localhost:5001';

export const createTimeSlots = async (schedule: CoachSchedule) => {
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

export const getAllMeetingsForCoach = async (
  coachId: string,
  timezone: string
): Promise<TimeSlotCoach[]> => {
  const encodedTimezone = encodeURIComponent(timezone);
  try {
    const response = await fetch(
      `${url}/api/timeSlots/${coachId}/${encodedTimezone}/allmeetings`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve upcoming meetings');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failure to retrieve upcoming meetings');
    return [];
  }
};

export const getPastMeetingsForCoach = async (
  coachId: string,
  timezone: string
): Promise<TimeSlotCoach[]> => {
  const encodedTimezone = encodeURIComponent(timezone);

  try {
    const response = await fetch(
      `${url}/api/timeSlots/${coachId}/${encodedTimezone}/pastmeetings`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve past meetings');
    }

    return await response.json();
  } catch (error) {
    console.error('Failure to retrieve past meetings');
    return [];
  }
};

export const submitReview = async (
  reviewDetails: TimeSlotCoach
): Promise<TimeSlotCoach | {}> => {
  try {
    const response = await fetch(`${url}/api/timeSlots/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tsc_id: reviewDetails.tsc_id,
        rating: reviewDetails.rating,
        notes: reviewDetails.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to submit review');
    return {};
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

    const response = await fetch(newUrl);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching available meetings:', error);
  }
};

export const getBookedMeetingsForStudent = async (
  userId: string,
  timezone: string
) => {
  const encodedTimezone = encodeURIComponent(timezone);

  try {
    const response = await fetch(
      `${url}/api/timeSlots/${userId}/${encodedTimezone}/upcoming`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve upcoming meetings for student');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failure to retrieve upcoming meetings for student');
    return [];
  }
};

export const bookTimeSlot = async (
  bookingDetails: SelectedBooking
): Promise<BookTimeSlotResponse> => {
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
