import studentStore from './studentStore';
import coachStore from './coachStore';
import timeSlotStore from './timeSlotStore';

class RootStore {
  isNightMode = false;

  constructor() {
    this.studentStore = studentStore;
    this.coachStore = coachStore;
    this.timeSlotStore = timeSlotStore;

    makeAutoObservable(this);
  }

  toggleNightMode() {
    this.isNightMode = !this.isNightMode;
  }
}

const rootStore = new RootStore();
export default rootStore;
