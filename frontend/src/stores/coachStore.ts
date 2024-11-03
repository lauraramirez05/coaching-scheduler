import { makeAutoObservable } from 'mobx';
import { CoachResponse } from '../services/coachServices';
import {
  TimeSlotCoach,
  UpcomingMeetingsResponse,
} from '../services/timeSlotServices';

class CoachStore {
  coaches: CoachResponse[] = [];
  currentCoach = {};
  upcomingMeetings: TimeSlotCoach[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCoaches(value: CoachResponse[]) {
    this.coaches = value;
  }

  addNewCoach(value) {
    this.coaches = [...this.coaches, value];
  }

  setUpcomingMeetings(value: TimeSlotCoach[]) {
    this.upcomingMeetings = value;
    console.log(this.upcomingMeetings);
  }

  refreshUpcomingMeetings(value) {
    this.upcomingMeetings.push(value);
    this.upcomingMeetings.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
  }
}

const coachStore = new CoachStore();

export default coachStore;
