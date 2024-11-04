import { makeAutoObservable } from 'mobx';
import { CoachResponse } from '../services/coachServices';
import { TimeSlotCoach } from '../services/timeSlotServices';

class CoachStore {
  coaches: CoachResponse[] = [];
  currentCoach = {};
  allCoachMeetings: TimeSlotCoach[] = [];
  displayedMeetings: TimeSlotCoach[] = [];
  notesDisplay: TimeSlotCoach | null = null;

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

  setNotesDisplay(value: TimeSlotCoach) {
    if (!this.notesDisplay) {
      this.notesDisplay = value;
    } else {
      this.notesDisplay = null;
    }
  }

  refreshMeetings(value) {
    console.log('incoming', value);
    this.displayedMeetings.push(value);
    this.displayedMeetings.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    this.allCoachMeetings.push(value);
    this.allCoachMeetings.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    console.log('displayed Meetings', this.displayedMeetings);
    console.log('all meetings', this.allCoachMeetings);
  }

  resetCoachUI() {
    this.currentCoach = {};
    this.allCoachMeetings = [];
    this.setDisplayedMeetings([]);
  }
}

const coachStore = new CoachStore();

export default coachStore;
