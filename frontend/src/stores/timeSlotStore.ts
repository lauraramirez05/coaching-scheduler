import { makeAutoObservable } from 'mobx';

class TimeSlotStore {
  students = [];

  constructor() {
    makeAutoObservable(this);
  }
}

const timeSlotStore = new TimeSlotStore();

export default timeSlotStore;
