import { makeAutoObservable } from 'mobx';

class UiStore {
  role: string = 'coach';

  constructor() {
    makeAutoObservable(this);
  }

  toggleRole(value: string) {
    this.role = value;
  }
}

const uiStore = new UiStore();

export default uiStore;
