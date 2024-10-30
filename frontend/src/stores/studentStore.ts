import { makeAutoObservable } from 'mobx';
import { StudentData, StudentResponse } from '../services/studentServices';

class StudentStore {
  // studentTimeZone: string = '';
  students: StudentData[] = [];
  // newUserName: string = '';
  // newUserPhone: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setStudents(value: StudentResponse[]) {
    this.students = value;
  }

  addNewStudent(value) {
    this.students = [...this.students, value];
  }

  // setStudentTimeZone(value: string) {
  //   this.studentTimeZone = value;
  // }

  // setNewUserName(value: string) {
  //   this.newUserName = value;
  // }

  // setNewUserPhone(value: string) {
  //   this.newUserPhone = value;
  // }
}

const studentStore = new StudentStore();

export default studentStore;
