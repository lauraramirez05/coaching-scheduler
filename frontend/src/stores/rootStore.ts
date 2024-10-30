import studentStore from './studentStore';
import coachStore from './coachStore';
import timeSlotStore from './timeSlotStore';
import { makeAutoObservable } from 'mobx';
import uiStore from './uiStore';

class RootStore {
  theme = 'light';

  studentStore: typeof studentStore;
  coachStore: typeof coachStore;
  timeSlotStore: typeof timeSlotStore;
  uiStore: typeof uiStore;

  constructor() {
    this.studentStore = studentStore;
    this.coachStore = coachStore;
    this.timeSlotStore = timeSlotStore;
    this.uiStore = uiStore;

    makeAutoObservable(this);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}

const rootStore = new RootStore();
export default rootStore;
