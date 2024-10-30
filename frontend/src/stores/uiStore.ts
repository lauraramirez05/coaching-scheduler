import { makeAutoObservable } from 'mobx';

class UiStore {
  role: string = 'coach';

  constructor() {
    makeAutoObservable(this);
  }

  toggleRole(value: string) {
    console.log(value);
    this.role = value;
    console.log(this.role);
  }
}

const uiStore = new UiStore();

export default uiStore;
