import { makeAutoObservable } from 'mobx';
import { StudentData } from '../services/studentServices';

class StudentStore {
  studentTimeZone: string = '';
  students: StudentData[] = [];
  newUserName: string = '';
  newUserPhone: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setStudentTimeZone(value: string) {
    this.studentTimeZone = value;
  }

  setNewUserName(value: string) {
    this.newUserName = value;
  }

  setNewUserPhone(value: string) {
    this.newUserPhone = value;
  }
}

const studentStore = new StudentStore();

export default studentStore;
