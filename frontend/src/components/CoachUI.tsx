import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import {
  CoachData,
  createCoach,
  getAllCoaches,
  CoachResponse,
} from '../services/coachServices';
import UserSelector from './UserSelector';
import { getUserTimeZone } from '../services/userTimeZone';

const CoachUI = observer(() => {
  // const [opened, { open, close }] = useDisclosure(false);
  const { coachStore } = useContext(StoreContext);
  const { userStore } = useContext(StoreContext);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const allCoaches: CoachResponse[] = (await getAllCoaches()) || [];
        coachStore.setCoaches(allCoaches);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchCoaches();
  }, []);

  const handleSubmit = async () => {
    const coachData: CoachData = {
      name: userStore.newUserName,
      phone: userStore.newUserPhone,
    };

    try {
      const createdCoach = await createCoach(coachData);
      coachStore.addNewCoach(createdCoach);
      userStore.setCurrentUser(createdCoach);
      userStore.setNewUserName('');
      userStore.setNewUserPhone('');
    } catch (error) {
      console.error(`Error creating coach`, error);
    }
  };

  return (
    <div>
      <div>
        <UserSelector data={coachStore.coaches} handleSubmit={handleSubmit} />
      </div>
      <div>
        <div>calendar</div>
        <div>time slots</div>
      </div>
    </div>
  );
});

export default CoachUI;
