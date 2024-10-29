import { makeAutoObservable } from 'mobx-react-lite';

class TimeSlotStore {
  students = [];

  constructor() {
    makeAutoObservable(this);
  }
}

const timeSlotStore = new TimeSlotStore();

export default timeSlotStore;
