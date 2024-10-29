import { makeAutoObservable } from 'mobx-react-lite';

class StudentStore {
  students = [];

  constructor() {
    makeAutoObservable(this);
  }
}

const studentStore = new StudentStore();

export default studentStore;
