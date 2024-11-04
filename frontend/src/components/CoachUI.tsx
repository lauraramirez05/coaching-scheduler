import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import dayjs from 'dayjs';
import { Card } from 'antd';
import { Button, Rating, Tooltip, Modal } from '@mantine/core';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClock,
  faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';

const CoachUI = observer(() => {
  const [
    isAddTimeSlotOpen,
    { open: openAddTimeSlot, close: closeAddTimeSlot },
  ] = useDisclosure(false);
  const [isReviewOpen, { open: openReview, close: closeReview }] =
    useDisclosure(false);
  const [isNotesOpen, { open: openNotes, close: closeNotes }] =
    useDisclosure(false);
  const [seeNotes, setSeeNotes] = useState(false);

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
                  <div className=' flex flex-col gap-4 mt-4 w-full max-h-[470px] overflow-y-auto'>
                    {coachStore.displayedMeetings.map((meeting) => (
                      <Card
                        key={meeting.tsc_id}
                        // title='Meeting Info'
                        className={`flex flex-col w-80 ${
                          meeting.status === 'available'
                            ? 'border-2 border-blue-600'
                            : meeting.status === 'booked'
                            ? 'border-2 border-fuchsia-700'
                            : ''
                        } `}
                      >
                        <div className='flex gap-4'>
                          <FontAwesomeIcon
                            icon={faCalendarDays}
                            className='self-center'
                          />
                          <p className='font-bold'>
                            {/* <strong>Date:</strong>{' '} */}
                            {dayjs(meeting.start_time).format(
                              'dddd, MMMM D, YYYY'
                            )}
                          </p>
                        </div>
                        <div>
                          <div className='flex gap-16'>
                            <p>
                              <FontAwesomeIcon icon={faClock} />
                              {dayjs(meeting.start_time).format('HH:mm')}
                            </p>
                            <p>
                              <FontAwesomeIcon icon={faClock} />
                              {dayjs(meeting.end_time).format('HH:mm')}
                            </p>
                          </div>

                          {timeSlotStore.meetingStatus === 'completed' ? (
                            <div className='flex flex-col'>
                              <div className='flex justify-between'>
                                <p className='text-sky-700 font-bold'>
                                  {meeting.student_name
                                    ? meeting.student_name
                                    : ''}
                                </p>
                                <Rating
                                  defaultValue={
                                    meeting.rating ? meeting.rating : 0
                                  }
                                  readOnly
                                />
                                <div className='transform transition-transform duration-200 hover:scale-125 cursor-pointer'>
                                  <Tooltip label='See notes'>
                                    <FontAwesomeIcon
                                      icon={faNoteSticky}
                                      className='text-blue-500'
                                      onClick={() =>
                                        coachStore.setNotesDisplay(meeting)
                                      }
                                    />
                                  </Tooltip>
                                </div>
                              </div>

                              {coachStore.notesDisplay &&
                                coachStore.notesDisplay.tsc_id ===
                                  meeting.tsc_id && (
                                  <div className='my-2 p-2 border rounded shadow'>
                                    <p>
                                      {coachStore.notesDisplay.notes
                                        ? coachStore.notesDisplay.notes
                                        : 'No Notes Available'}
                                    </p>
                                  </div>
                                )}

                              <Button
                                onClick={() => handleReviewClick(meeting)}
                                size='xs'
                                variant='light'
                                className='item-center mt-2'
                              >
                                Review
                              </Button>
                            </div>
                          ) : timeSlotStore.meetingStatus === 'booked' ? (
                            <div className='flex justify-between'>
                              <div>
                                {meeting.student_name
                                  ? meeting.student_name
                                  : ''}
                              </div>
                              <div>
                                {meeting.student_phone
                                  ? formatPhoneNumber(meeting.student_phone)
                                  : ''}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={` w-fit px-1 py-0.5 leading-none rounded-md mt-2 ${
                                meeting.status === 'available'
                                  ? 'bg-green-200 shadow-md text-green-700'
                                  : ''
                              }`}
                            >
                              {meeting.status
                                ? meeting.status
                                : meeting.dataValues.status}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}{' '}
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
