import { makeAutoObservable } from 'mobx-react-lite';

class CoachStore {
  students = [];

  constructor() {
    makeAutoObservable(this);
  }
}

const coachStore = new CoachStore();

export default coachStore;
