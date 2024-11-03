import { observer } from 'mobx-react-lite';
import rootStore from './stores/rootStore';
import { StoreContext } from './stores/StoreContext';
import SwitchRoles from './components/SwitchRoles';
import { useContext } from 'react';
import StudentUI from './components/StudentUI';
import CoachUI from './components/CoachUI';
import { getUserTimeZone } from './services/userTimeZone';
import Calendar from './components/Calendar';

const App = observer(() => {
  // const { uiStore } = useContext(StoreContext);
  const { userStore } = useContext(StoreContext);

  getUserTimeZone();

  return (
    <StoreContext.Provider value={rootStore}>
      {/* <Calendar /> */}
      <div className='h-100vh'>
        <div className='flex flex-col font-sans'>
          <h1>Schedulink</h1>
          <SwitchRoles />
        </div>

        {userStore.currentRole === 'student' ? <StudentUI /> : <CoachUI />}
      </div>
    </StoreContext.Provider>
  );
});

export default App;
