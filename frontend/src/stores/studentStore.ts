import { makeAutoObservable } from 'mobx';
import { StudentData, StudentResponse } from '../services/studentServices';
import {
  AvailableMeetingsStudents,
  SelectedBooking,
} from '../services/timeSlotServices';

interface SelectedCoachesType {
  [id: string]: boolean;
}

class StudentStore {
  students: StudentData[] = [];
  availableMeetings: AvailableMeetingsStudents[] = [];
  displayedMeetings: AvailableMeetingsStudents[] = [];
  filteredCoaches: SelectedCoachesType = {};
  selectedCoach: string | null = null;
  selectedBooking: SelectedBooking = {
    coach_id: '',
    time_slot_id: '',
    user_id: '',
  };
  confirmedBooking: {} | null = null;
  errorCard: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setStudents(value: StudentResponse[]) {
    this.students = value;
  }

  addNewStudent(value) {
    this.students = [...this.students, value];
  }

  setAvailableMeetings(meetings) {
    this.availableMeetings = meetings;
    this.setDisplayedMeetings(meetings);
  }

  setDisplayedMeetings(meetings) {
    this.displayedMeetings = meetings;
  }

  setSelectedCoach(coachId: string) {
    this.selectedCoach = coachId;
  }

  setSelectedBooking(coachId: string, timeSlotId: string, userId: string) {
    this.selectedBooking = {
      coach_id: coachId,
      time_slot_id: timeSlotId,
      user_id: userId,
    };

    console.log('booking', this.selectedBooking);
  }

  setFilteredCoaches(coachId: string) {
    this.filteredCoaches = {
      ...this.filteredCoaches,
      [coachId]: !this.filteredCoaches[coachId],
    };
  }

  resetAfterBooking() {
    this.filteredCoaches = {};
    this.selectedCoach = null;
    this.selectedBooking = { coach_id: '', time_slot_id: '', user_id: '' };
    this.confirmedBooking = null;
  }

  setErrorCard(timeSlotId: string) {
    this.errorCard = timeSlotId;
    console.log(this.errorCard);
  }
}

const studentStore = new StudentStore();

export default studentStore;
