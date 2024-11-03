import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import dayjs from 'dayjs';
import { Card } from 'antd';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AddTimeSlotModal from './AddTimeSlotModal';
import '@mantine/dates/styles.css';
import {
  CoachData,
  createCoach,
  getAllCoaches,
  CoachResponse,
} from '../services/coachServices';
import UserSelector from './UserSelector';
import Calendar from './Calendar';

const CoachUI = observer(() => {
  const [opened, { open, close }] = useDisclosure(false);
  const { coachStore, userStore } = useContext(StoreContext);

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
      <div className='flex justify-start w-full gap-4 p-1.5'>
        <div>
          <Calendar meetings={coachStore.upcomingMeetings} />
        </div>
        {userStore.currentUser && userStore.currentUser !== 'create-new' ? (
          <div className='w-full flex flex-col justify-start'>
            <div>
              <Button onClick={open}>Add Time Slot</Button>
            </div>
            <div>
              {coachStore.upcomingMeetings.map((meeting) => (
                <Card
                  key={meeting.tsc_id}
                  title='Meeting Info'
                  className='flex flex-col'
                >
                  <div>
                    <p>
                      <strong>Date:</strong>{' '}
                      {dayjs(meeting.start_time).format('dddd, MMMM D, YYYY')}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Start Time:</strong>{' '}
                      {dayjs(meeting.start_time)
                        .tz(userStore.userTimeZone)
                        .format('HH:mm')}
                    </p>
                    <p>
                      <strong>End Time:</strong>{' '}
                      {dayjs(meeting.end_time)
                        .tz(userStore.userTimeZone)
                        .format('HH:mm')}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {meeting.status
                        ? meeting.status
                        : meeting.dataValues.status}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-center text-gray-600 flex items-center font-bold'>
            Sign in/Create Account to add time slots
          </div>
        )}
      </div>
      <AddTimeSlotModal opened={opened} onClose={close} />
    </div>
  );
});

export default CoachUI;
