import userStore from '../stores/userStore';

export const getUserTimeZone = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  userStore.setUserTimeZone(userTimeZone);
};
