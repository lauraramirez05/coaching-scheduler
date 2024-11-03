import { makeAutoObservable } from 'mobx';
import { CoachResponse } from '../services/coachServices';

class UserStore {
  currentRole: string = 'coach';
  currentUser: CoachResponse | null | string = null;
  newUserName: string = '';
  newUserPhone: string = '';
  userTimeZone: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  toggleRole(value: string) {
    console.log(value);
    this.currentRole = value;
  }

  setCurrentUser(value: CoachResponse) {
    this.currentUser = value;
  }

  setNewUserName(value: string) {
    this.newUserName = value;
  }

  setNewUserPhone(value: string) {
    this.newUserPhone = value;
  }

  setUserTimeZone(value: string) {
    this.userTimeZone = value;
  }
}

const userStore = new UserStore();

export default userStore;
