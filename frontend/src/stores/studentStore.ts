import { makeAutoObservable, action } from 'mobx';
import { StudentData, StudentResponse } from '../services/studentServices';
import {
  AvailableMeetingsStudents,
  BookTimeSlotResponse,
  SelectedBooking,
} from '../services/timeSlotServices';
import dayjs from 'dayjs';
import { getAllAvailableMeetingsForStudents } from '../services/timeSlotServices';
import { getBookedMeetingsForStudent } from '../services/timeSlotServices';

interface SelectedCoachesType {
  [id: string]: boolean;
}

interface BookingResponse {
  status: string;
  message: any;
  data?: any;
}

class StudentStore {
  students: StudentData[] = [];
  availableMeetings: AvailableMeetingsStudents[] = [];
  bookedMeetings: AvailableMeetingsStudents[] = [];
  availableDates: AvailableMeetingsStudents[] = [];
  displayedMeetings: AvailableMeetingsStudents[] = [];
  filteredCoaches: SelectedCoachesType = {};
  selectedCoach: string | null = null;
  selectedBooking: SelectedBooking = {
    coach_id: '',
    time_slot_id: '',
    user_id: '',
  };
  confirmedBooking: BookTimeSlotResponse | null = null;
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
    this.setAvailableDates(meetings);
  }

  setBookedMeetings(booked: AvailableMeetingsStudents[]) {
    this.bookedMeetings = booked;
  }

  updateBookedMeeting(meeting) {
    this.bookedMeetings.push(meeting);
    console.log('BOOKED MEETINGS', this.bookedMeetings);
  }

  setAvailableDates(dates: AvailableMeetingsStudents[]) {
    const openDates = {};

    this.availableMeetings.forEach((dates) => {
      const day = dayjs(dates.start_time).format('YYYY-MM-DD');

      if (!openDates[day]) {
        openDates[day] = {
          date: day,
          meetings: [],
        };
      }
      openDates[day].meetings.push(dates);
    });

    this.availableDates = Object.values(openDates);
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
  }

  setFilteredCoaches(coachId: string) {
    this.filteredCoaches = {
      ...this.filteredCoaches,
      [coachId]: !this.filteredCoaches[coachId],
    };
  }

  resetStudentUI() {
    this.displayedMeetings = [];
    this.bookedMeetings = [];
    this.availableDates = [];
    this.filteredCoaches = {};
    this.selectedCoach = null;
    this.selectedBooking = { coach_id: '', time_slot_id: '', user_id: '' };
    this.confirmedBooking = null;
  }

  setErrorCard(timeSlotId: string) {
    this.errorCard = timeSlotId;
  }

  setConfirmedBooking(booking: BookTimeSlotResponse) {
    this.confirmedBooking = booking;
    console.log('confirmed booking', this.confirmedBooking);
  }
}

const studentStore = new StudentStore();

export default studentStore;
