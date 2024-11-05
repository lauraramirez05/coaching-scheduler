import { observer } from 'mobx-react-lite';
import rootStore from './stores/rootStore';
import { StoreContext } from './stores/StoreContext';
import SwitchRoles from './components/SwitchRoles';
import { useContext } from 'react';
import StudentUI from './components/StudentUI';
import CoachUI from './components/CoachUI';
import { getUserTimeZone } from './services/userTimeZone';

const App = observer(() => {
  // const { uiStore } = useContext(StoreContext);
  const { userStore } = useContext(StoreContext);

  getUserTimeZone();

  return (
    <StoreContext.Provider value={rootStore}>
      <div className='h-full'>
        <div className='relative flex flex-col font-sans items-center border-b border-b-gray-300 shadow-md rounded-md pb-4 h-[100px]'>
          <h1>Schedulink</h1>
          <div>
            <SwitchRoles />
          </div>
        </div>
        <div className='p-4 '>
          {userStore.currentRole === 'student' ? <StudentUI /> : <CoachUI />}
        </div>
      </div>
    </StoreContext.Provider>
  );
});

export default App;
