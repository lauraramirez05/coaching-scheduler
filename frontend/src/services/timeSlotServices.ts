import { Dayjs } from 'dayjs';

export interface TimeSlot {
  startTime: Dayjs | string;
  endTime: Dayjs | string;
  validSession: boolean;
}

export interface TimeSlotResponse {
}

const url = 'http://localhost:5001';
