import { Card } from 'antd';
import { Button, Tooltip, Rating, Avatar } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../stores/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClock,
  faUser,
  faPhone,
  faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { formatPhoneNumber } from '../services/formatPhoneNumber';
import {
  bookTimeSlot,
  getAllAvailableMeetingsForStudents,
} from '../services/timeSlotServices';

const MeetingCard = ({ meeting, handleReview }) => {
  const { studentStore, userStore, coachStore, timeSlotStore } =
    useContext(StoreContext);

  const handleBooking = async (timeSlotId) => {
    if (!studentStore.selectedCoach) {
      studentStore.setErrorCard(timeSlotId);
      return;
    }
    if (
      studentStore.selectedBooking.coach_id === '' ||
      studentStore.selectedBooking.time_slot_id !== timeSlotId
    ) {
      studentStore.setErrorCard(studentStore.selectedBooking.time_slot_id);
      return;
    } else {
      const result = await bookTimeSlot(studentStore.selectedBooking);

      if (result.status === 'success') {
        studentStore.setConfirmedBooking(result);
        console.log('result', result.data.timeSlot);
        studentStore.updateBookedMeeting(result.data.timeSlot);

        alert(result.message);

        const fetchAvailableMeetings = async () => {
          try {
            const availableMeetings: AvailableMeetingsStudents[] =
              await getAllAvailableMeetingsForStudents();

            studentStore.setAvailableMeetings(Object.values(availableMeetings));
          } catch (error) {
            console.error(
              `Error is ${fetchAvailableMeetings}, couldn't get the meetings`,
              error
            );
          }
        };
        fetchAvailableMeetings();
        // studentStore.resetStudentUI();
      } else if (result.status === 'error') {
        alert(result.message); // Notify the user of the error
      }
    }
  };

  const handleCoachSelection = (
    coachId: string,
    timeSlotId: string,
    userId: string
  ) => {
    studentStore.setSelectedCoach(coachId);
    studentStore.setSelectedBooking(coachId, timeSlotId, userId);

    if (studentStore.errorCard !== '') {
      studentStore.setErrorCard('');
    }
  };

  return (
    <Card
      className={`flex flex-col w-80 ${
        studentStore.errorCard === meeting.time_slot_id
          ? 'border border-red-500'
          : ''
      } ${
        timeSlotStore.meetingStatus === 'available'
          ? 'border-2 border-blue-600'
          : meeting.status === 'booked'
          ? 'border-2 border-fuchsia-700'
          : ''
      }`}
    >
      <div>
        <div className='flex gap-4'>
          <FontAwesomeIcon icon={faCalendarDays} className='self-center' />
          <p>{dayjs(meeting.start_time).format('dddd, MMMM D, YYYY')}</p>
        </div>

        <div className='flex gap-16'>
          <div className='flex items-center gap-2'>
            <FontAwesomeIcon icon={faClock} />
            <p>
              {dayjs(meeting.start_time)
                .tz(userStore.userTimeZone)
                .format('HH:mm')}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <FontAwesomeIcon icon={faClock} />
            <p>
              {dayjs(meeting.end_time)
                .tz(userStore.userTimeZone)
                .format('HH:mm')}
            </p>
          </div>
        </div>
      </div>

      <div>
        {timeSlotStore.meetingStatus === 'booked' && (
          <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
              <FontAwesomeIcon icon={faUser} />
              <p>
                {meeting.coach_name ? meeting.coach_name : meeting.student_name}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <FontAwesomeIcon icon={faPhone} />
              <p>
                {meeting.coach_phone
                  ? formatPhoneNumber(meeting.coach_phone)
                  : formatPhoneNumber(meeting.student_phone)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        {userStore.currentRole === 'coach' &&
          timeSlotStore.meetingStatus === 'available' && (
            <div
              className={`w-fit px-1 py-0.5 leading-none rounded-md mt-2 ${
                meeting.status === 'available'
                  ? 'bg-green-200 shadow-md text-green-700'
                  : ''
              }`}
            >
              {meeting.status || meeting.dataValues.status}
            </div>
          )}

        {userStore.currentRole === 'coach' &&
          timeSlotStore.meetingStatus === 'completed' && (
            <div className='flex flex-col'>
              <div className='flex justify-between'>
                <p className='text-sky-700 font-bold'>
                  {meeting.student_name ? meeting.student_name : ''}
                </p>
                <Rating value={meeting.rating ? meeting.rating : 0} readOnly />
                <div className='transform transition-transform duration-200 hover:scale-125 cursor-pointer'>
                  <Tooltip label='See notes'>
                    <FontAwesomeIcon
                      icon={faNoteSticky}
                      className='text-blue-500'
                      onClick={() => coachStore.setNotesDisplay(meeting)}
                    />
                  </Tooltip>
                </div>
              </div>

              {coachStore.notesDisplay &&
                coachStore.notesDisplay.tsc_id === meeting.tsc_id && (
                  <div className='my-2 p-2 border rounded shadow'>
                    <p>
                      {coachStore.notesDisplay.notes
                        ? coachStore.notesDisplay.notes
                        : 'No Notes Available'}
                    </p>
                  </div>
                )}

              <Button
                onClick={() => handleReview(meeting)}
                size='xs'
                variant='light'
                className='item-center mt-2'
              >
                Review
              </Button>
            </div>
          )}
      </div>

      <div>
        {userStore.currentRole === 'student' &&
          timeSlotStore.meetingStatus === 'available' && (
            <div>
              <div className='flex justify-center mt-2'>
                {meeting.coaches &&
                  meeting.coaches.map((coach) => {
                    const [firstName, lastName] = coach.name.split(' ');
                    const firstInitial = firstName.charAt(0);
                    const lastInitial = lastName ? lastName.charAt(0) : '';

                    const isSelected =
                      studentStore.selectedCoach === coach.id &&
                      studentStore.selectedBooking.time_slot_id ===
                        meeting.time_slot_id;

                    return (
                      <Avatar
                        color='pink'
                        radius='xl'
                        size='md'
                        className={`mr-2 cursor-pointer transition-transform duration-200 ${
                          isSelected
                            ? 'ring-2 ring-pink-500 scale-105'
                            : 'hover:ring-2 hover:ring-pink-300 hover:scale-105'
                        }`}
                        key={`${meeting.time_slot_id}-${coach.id}`}
                        // Uncomment and implement onClick handler for coach selection
                        onClick={() =>
                          handleCoachSelection(
                            coach.id,
                            meeting.time_slot_id,
                            userStore.currentUser.id
                          )
                        }
                      >
                        {`${firstInitial}${lastInitial}`}
                      </Avatar>
                    );
                  })}
              </div>
              {studentStore.errorCard === meeting.time_slot_id && (
                <p className='text-red-500 mt-2 text-center'>
                  Please select a coach
                </p>
              )}

              <Button
                variant='light'
                onClick={() => handleBooking(meeting.time_slot_id)}
              >
                Book
              </Button>
            </div>
          )}
      </div>
    </Card>
  );
};

export default observer(MeetingCard);
