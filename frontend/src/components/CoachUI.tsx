import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Avatar, Modal, InputBase, Button, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  CoachData,
  createCoach,
  getAllCoaches,
  CoachResponse,
} from '../services/coachServices';
import UserSelector from './UserSelector';

const CoachUI = observer(() => {
  const [opened, { open, close }] = useDisclosure(false);
  const { coachStore } = useContext(StoreContext);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  coachStore.setCoachTimeZone(userTimeZone);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const allCoaches: CoachResponse[] = (await getAllCoaches()) || [];
        coachStore.setCoaches(allCoaches);
        console.log(allCoaches);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchCoaches();
  }, []);

  const handleSubmit = async () => {
    const coachData: CoachData = {
      name: coachStore.newCoachName,
      phone: coachStore.newCoachPhone,
    };

    try {
      const createdCoach = await createCoach(coachData);
      console.log(`Coach created`, createdCoach);
      coachStore.setNewCoachName('');
      coachStore.setNewCoachPhone('');
      close();
    } catch (error) {
      console.error(`Error creating coach`, error);
    }
  };

  
  return (
    <div>
      <div>
        <UserSelector data={coachStore.coaches} />
        <Avatar
          className='cursor-pointer hover:scale-110 hover:shadow-lg'
          onClick={open}
        >
          <FontAwesomeIcon icon={faUserPlus} onClick={open} />
        </Avatar>
      </div>
      <Modal opened={opened} onClose={close} title='Add New Coach'>
        <InputBase
          label='Your Name'
          type='text'
          placeholder='Name'
          onChange={(event) =>
            coachStore.setNewCoachName(event.currentTarget.value)
          }
        ></InputBase>
        <InputBase
          label='Phone Number'
          placeholder='555-555-5555'
          onChange={(event) =>
            coachStore.setNewCoachPhone(event.currentTarget.value)
          }
        ></InputBase>
        <Button
          variant='filled'
          color='green'
          className='mt-6'
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Modal>
      <div>
        <div>calendar</div>
        <div>time slots</div>
      </div>
    </div>
  );
});

export default CoachUI;
