import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import dayjs from 'dayjs';
import { Card } from 'antd';
import { Button, Rating } from '@mantine/core';
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
import { formatPhoneNumber } from '../services/formatPhoneNumber';

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

  console.log(coachStore.allCoachMeetings);

  return (
    <div>
      <div>
        <UserSelector data={coachStore.coaches} handleSubmit={handleSubmit} />
      </div>
      <div className='flex justify-start w-full gap-4 p-1.5'>
        <div>
          <Calendar meetings={coachStore.allCoachMeetings} />
        </div>
        {userStore.currentUser && userStore.currentUser !== 'create-new' ? (
          <div className='w-full flex flex-col justify-start'>
            <div>
              <Button onClick={openAddTimeSlot}>Add Time Slot</Button>
            </div>
            <MeetingFilterModal />
            <div>
              {coachStore.displayedMeetings.length === 0 ? (
                <p>There are no {timeSlotStore.meetingStatus} slots</p>
              ) : (
                coachStore.displayedMeetings.map((meeting) => (
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
                        {dayjs(meeting.start_time).format('HH:mm')}
                      </p>
                      <p>
                        <strong>End Time:</strong>{' '}
                        {dayjs(meeting.end_time).format('HH:mm')}
                      </p>
                      {timeSlotStore.meetingStatus === 'completed' ? (
                        <div>
                          <p>
                            {meeting.student_name ? meeting.student_name : ''}
                          </p>
                          <Rating
                            defaultValue={meeting.rating ? meeting.rating : 0}
                            readOnly
                          />
                          <p>{meeting.notes ? meeting.notes : ''}</p>

                          <Button onClick={() => handleReviewClick(meeting)}>
                            Review
                          </Button>
                        </div>
                      ) : timeSlotStore.meetingStatus === 'booked' ? (
                        <div className='flex justify-between'>
                          <div>
                            {meeting.student_name ? meeting.student_name : ''}
                          </div>
                          <div>
                            {meeting.student_phone
                              ? formatPhoneNumber(meeting.student_phone)
                              : ''}
                          </div>
                        </div>
                      ) : (
                        <p>
                          <strong>Status:</strong>{' '}
                          {meeting.status
                            ? meeting.status
                            : meeting.dataValues.status}
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className='text-center text-gray-600 flex items-center font-bold'>
            Sign in/Create Account to add time slots
          </div>
        )}
      </div>
      <AddTimeSlotModal opened={isAddTimeSlotOpen} onClose={closeAddTimeSlot} />
      <ReviewModal opened={isReviewOpen} onClose={closeReview} />
    </div>
  );
});

export default CoachUI;
