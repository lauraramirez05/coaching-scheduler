import { makeAutoObservable } from 'mobx';
import dayjs, { Dayjs } from 'dayjs';
import { TimeSlot } from '../services/timeSlotServices';

class TimeSlotStore {
  selectedDays: Dayjs[] = [];
  timeSlots: { [key: string]: TimeSlot } = {};
  // calendarEvents = [];

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedDays(day: Date | Dayjs) {
    this.selectedDays.push(day);
    console.log(this.selectedDays);

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
    console.log('removed date string', dateStr);
    this.selectedDays = this.selectedDays.filter(
      (day) => dayjs(day).format('YYYY-MM-DD') !== dateStr
    );

    console.log('Selected days', this.selectedDays);

    delete this.timeSlots[dateStr]; // Remove the slot associated with the removed day
    console.log('time slots', this.timeSlots);
  }

  updateTimeSlots(date: Dayjs, startTime: string, endTime: string) {
    console.log('day', startTime);
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const slot = this.timeSlots[dateStr];

    if (slot && startTime !== '') {
      slot.startTime = startTime;
      const time = dayjs(startTime);
      slot.endTime = time.add(2, 'hour').format('YYYY-MM-DDTHH:mm:ssZ'); // Format as needed
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

  resetSelectedDays() {
    this.selectedDays = [];
    this.timeSlots = {};
  }

  // setCalendarEvents(value: {}) {
  //   this.calendarEvents.push(value);
  // }
}

const timeSlotStore = new TimeSlotStore();

export default timeSlotStore;
