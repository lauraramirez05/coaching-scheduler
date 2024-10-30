import { makeAutoObservable } from 'mobx';
import { CoachResponse } from '../services/coachServices';

class CoachStore {
  coaches: CoachResponse[] = [];
  // newCoachName: string = '';
  // newCoachPhone: string = '';
  // coachTimeZone: string = '';
  currentCoach = {};

  constructor() {
    makeAutoObservable(this);
  }

  // setNewCoachName(value: string) {
  //   this.newCoachName = value;
  // }

  // setNewCoachPhone(value: string) {
  //   this.newCoachPhone = value;
  // }

  // setCoachTimeZone(value: string) {
  //   this.coachTimeZone = value;
  // }

  setCoaches(value: CoachResponse[]) {
    this.coaches = value;
  }

  addNewCoach(value) {
    this.coaches = [...this.coaches, value];
  }
}

const coachStore = new CoachStore();

export default coachStore;
