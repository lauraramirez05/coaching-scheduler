import userStore from '../stores/userStore';

export const getUserTimeZone = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  userStore.setUserTimeZone(userTimeZone);
  console.log('called the timezone function', [
    userTimeZone,
    userStore.userTimeZone,
  ]);
};
