import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
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
import MeetingFilterModal from './MeetingFilterModal';
import ReviewModal from './ReviewModal';
import MeetingCard from './MeetingCard';

const CoachUI = observer(() => {
  const [
    isAddTimeSlotOpen,
    { open: openAddTimeSlot, close: closeAddTimeSlot },
  ] = useDisclosure(false);
  const [isReviewOpen, { open: openReview, close: closeReview }] =
    useDisclosure(false);

  const { coachStore, userStore, timeSlotStore } = useContext(StoreContext);

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
  const handleReviewClick = (meeting) => {
    openReview();
    timeSlotStore.setTimeSlotUnderReview(meeting);
  };

  return (
    <div>
      <div className='absolute right-0 mr-4 top-4 w-48'>
        <UserSelector data={coachStore.coaches} handleSubmit={handleSubmit} />
      </div>
      <div className='flex justify-around w-full gap-4'>
        <div>
          <Calendar meetings={coachStore.allCoachMeetings} />
        </div>
        <div>
          {userStore.currentUser && userStore.currentUser !== 'create-new' ? (
            <div className='w-full flex flex-col justify-start items-center'>
              <div className='mb-4 self-end'>
                <Button variant='light' onClick={openAddTimeSlot}>
                  Add Time Slot
                </Button>
              </div>
              <MeetingFilterModal />
              <div className=' items-center h-full'>
                {coachStore.displayedMeetings.length === 0 ? (
                  <p>There are no {timeSlotStore.meetingStatus} slots</p>
                ) : (
                  <div className=' flex flex-col gap-4 mt-4 w-full h-[calc(100vh-230px)] max-h-[470px] sm:max-h-[600px] overflow-y-auto'>
                    {coachStore.displayedMeetings.map((meeting) => (
                      <MeetingCard
                        meeting={meeting}
                        handleReview={handleReviewClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='text-center text-gray-600 flex items-center font-bold'>
              Sign in/Create Account to add time slots
            </div>
          )}
        </div>
      </div>
      <AddTimeSlotModal opened={isAddTimeSlotOpen} onClose={closeAddTimeSlot} />
      <ReviewModal opened={isReviewOpen} onClose={closeReview} />
    </div>
  );
});

export default CoachUI;
