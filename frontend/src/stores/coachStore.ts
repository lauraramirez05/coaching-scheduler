import { makeAutoObservable } from 'mobx';
import { CoachResponse } from '../services/coachServices';
import { TimeSlotCoach } from '../services/timeSlotServices';

class CoachStore {
  coaches: CoachResponse[] = [];
  currentCoach = {};
  allCoachMeetings: TimeSlotCoach[] = [];
  displayedMeetings: TimeSlotCoach[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCoaches(value: CoachResponse[]) {
    this.coaches = value;
  }

  addNewCoach(value) {
    this.coaches = [...this.coaches, value];
  }

  setAllCoachMeetings(value: TimeSlotCoach[]) {
    this.allCoachMeetings = value;
  }

  setDisplayedMeetings(value: TimeSlotCoach[]) {
    this.displayedMeetings = value;
  }

  refreshMeetings(value) {
    this.displayedMeetings.push(value);
    this.displayedMeetings.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    this.allCoachMeetings.push(value);
    this.allCoachMeetings.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
  }

  resetCoachUI() {
    this.currentCoach = {};
    this.allCoachMeetings = [];
    this.setDisplayedMeetings([]);
  }
}

const coachStore = new CoachStore();

export default coachStore;
