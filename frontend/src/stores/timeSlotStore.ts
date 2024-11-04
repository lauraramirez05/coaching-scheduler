import { makeAutoObservable } from 'mobx';
import dayjs, { Dayjs } from 'dayjs';
import { TimeSlot, TimeSlotCoach } from '../services/timeSlotServices';

class TimeSlotStore {
  selectedDays: Dayjs[] = [];
  timeSlots: { [key: string]: TimeSlot } = {};
  meetingStatus: string = 'available';
  timeSlotUnderReview: TimeSlotCoach = {
    tsc_id: '',
    time_slot_id: '',
    coach_id: '',
    status: 'completed',
    start_time: 'string',
    end_time: '',
  };

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedDays(day: Dayjs) {
    this.selectedDays.push(day);

    const dateStr = dayjs(day).format('YYYY-MM-DD');
    if (!this.timeSlots[dateStr]) {
      this.timeSlots[dateStr] = {
        startTime: dayjs(day).hour(8).minute(0),
        endTime: dayjs(day).hour(10).minute(0),
        validSession: true,
      };
    }
  }

  updateSelectedDays(removedDay: Date) {
    const dateStr = dayjs(removedDay).format('YYYY-MM-DD');
    this.selectedDays = this.selectedDays.filter(
      (day) => dayjs(day).format('YYYY-MM-DD') !== dateStr
    );

    delete this.timeSlots[dateStr];
  }

  updateTimeSlots(date: Dayjs, startTime: string, endTime: string) {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const slot = this.timeSlots[dateStr];

    if (slot && startTime !== '') {
      slot.startTime = startTime;
      const time = dayjs(startTime);
      slot.endTime = time.add(2, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
    } else if (slot && endTime !== '') {
      slot.endTime = endTime;
    }
  }

  isSessionValid(date: Dayjs) {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const slot = this.timeSlots[dateStr];
    if (slot) {
      const slotStartTime = dayjs(slot.startTime, 'HH:mm');
      const slotEndTime = dayjs(slot.endTime, 'HH:mm');

      const differenceInMinutes = slotEndTime.diff(slotStartTime, 'minute');
      slot.validSession = differenceInMinutes === 120; // Set validSession based on the duration
    }
  }

  setMeetingStatus(status: string) {
    this.meetingStatus = status;
  }

  setTimeSlotUnderReview(meeting: TimeSlotCoach) {
    this.timeSlotUnderReview = meeting;
  }

  updateRating(newRating: number) {
    this.timeSlotUnderReview.rating = newRating;
  }

  updateNotes(newNotes: string) {
    this.timeSlotUnderReview.notes = newNotes;
  }

  resetSelectedDays() {
    this.selectedDays = [];
    this.timeSlots = {};
  }

  resetTimeSlotUnderReview() {
    this.timeSlotUnderReview = {
      tsc_id: '',
      time_slot_id: '',
      coach_id: '',
      status: 'completed',
      start_time: 'string',
      end_time: '',
    };
  }
}

const timeSlotStore = new TimeSlotStore();

export default timeSlotStore;
