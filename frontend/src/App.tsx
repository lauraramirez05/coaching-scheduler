import { observer } from 'mobx-react-lite';
import rootStore from './stores/rootStore';
import { StoreContext } from './stores/StoreContext';
import SwitchRoles from './components/SwitchRoles';
import { useContext } from 'react';
import StudentUI from './components/StudentUI';
import CoachUI from './components/CoachUI';
import TestModal from './components/TestModal';
import CreateUser from './components/CreateUser';

const App = observer(() => {
  const { uiStore } = useContext(StoreContext);
  return (
    <StoreContext.Provider value={rootStore}>
      <div>
        <div className='flex flex-col font-sans'>
          <h1>Schedulink</h1>
          <SwitchRoles />
        </div>

        {uiStore.role === 'student' ? <StudentUI /> : <CoachUI />}
      </div>
    </StoreContext.Provider>
  );
});

export default App;
