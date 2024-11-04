import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import UserSelector from './UserSelector';
import {
  StudentData,
  StudentResponse,
  createStudent,
  getAllStudents,
} from '../services/studentServices';
import Calendar from './Calendar';
import { Checkbox, Avatar, Button } from '@mantine/core';
import { Card } from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import {
  bookTimeSlot,
  getAllAvailableMeetingsForStudents,
} from '../services/timeSlotServices';
import MeetingFilterModal from './MeetingFilterModal';
import timeSlotStore from '../stores/timeSlotStore';
import { formatPhoneNumber } from '../services/formatPhoneNumber';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClock,
  faUser,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';

const StudentUI = observer(() => {
  const { studentStore, userStore, coachStore } = useContext(StoreContext);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allStudents: StudentResponse[] = (await getAllStudents()) || [];
        studentStore.setStudents(allStudents);
      } catch (error) {
        console.error('Error fetching coaches', error);
      }
    };

    fetchStudents();
  }, []);

  const handleSubmit = async () => {
    const studentData: StudentData = {
      name: userStore.newUserName,
      phone: userStore.newUserPhone,
    };

    try {
      const createdStudent = await createStudent(studentData);
      studentStore.addNewStudent(createdStudent);
      userStore.setCurrentUser(createdStudent);
      userStore.setNewUserName('');
      userStore.setNewUserPhone('');
    } catch (error) {
      console.error(`Error creating student`, error);
    }
  };

  const handleCoachFiltering = (coachId: string) => {
    studentStore.setFilteredCoaches(coachId);

    const filteredMeetings = studentStore.availableMeetings.filter(
      (meeting) => {
        return meeting.coaches.some((meetingCoach) => {
          return studentStore.filteredCoaches[meetingCoach.id];
        });
      }
    );

    studentStore.setDisplayedMeetings(filteredMeetings);

    const fetchMeetings = debounce(async (coaches) => {
      const selectedCoachesArray = [];
      for (const coach in coaches) {
        if (coaches[coach] === true) {
          selectedCoachesArray.push(coach);
        }
      }

      const fetchedFilteredMeetings = await getAllAvailableMeetingsForStudents(
        selectedCoachesArray
      );
      studentStore.setDisplayedMeetings(Object.values(fetchedFilteredMeetings));
    }, 400);

    fetchMeetings(studentStore.filteredCoaches);
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

        alert(result.message);

        const fetchAvailableMeetings = async () => {
          try {
            const availableMeetings: AvailableMeetingsStudents[] =
              (await getAllAvailableMeetingsForStudents()) || [];
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

  return (
    <div>
      <div className='absolute right-0 mr-4 top-4 w-48'>
        <UserSelector
          data={studentStore.students}
          handleSubmit={handleSubmit}
        />
      </div>

      <div className='flex justify-around w-full gap-4'>
        <div>
          <Calendar
            meetings={studentStore.bookedMeetings}
            availableDate={studentStore.availableDates}
          />
        </div>

        <div>
          {userStore.currentUser && userStore.currentUser !== 'create-new' ? (
            <div className='w-full flex flex-col justify-start items-center'>
              <MeetingFilterModal />
              {timeSlotStore.meetingStatus === 'available'}{' '}
              {
                <div className='flex justify-between my-4'>
                  {timeSlotStore.meetingStatus === 'available' &&
                    userStore.currentUser &&
                    coachStore.coaches &&
                    coachStore.coaches.map((coach) => {
                      const [firstName, lastName] = coach.name.split(' ');
                      const lastInitial = lastName ? lastName.charAt(0) : ''; // Get the first letter of the last name

                      return (
                        <Checkbox
                          key={coach.id}
                          label={`${firstName} ${lastInitial}.`}
                          checked={
                            studentStore.filteredCoaches[coach.id] === true
                          }
                          onClick={() => handleCoachFiltering(coach.id)}
                        />
                      );
                    })}
                </div>
              }
              <div className=' flex flex-col gap-4 mt-4 w-full max-h-[470px] overflow-y-auto'>
                {' '}
                {studentStore.displayedMeetings.map((meeting) => {
                  return (
                    <Card
                      key={meeting.time_slot_id}
                      className={`w-80 mb-4 ${
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
                      {timeSlotStore.meetingStatus === 'available' ? (
                        <div>
                          <div className='flex gap-4'>
                            <FontAwesomeIcon
                              icon={faCalendarDays}
                              className='self-center'
                            />
                            <p>
                              {dayjs(meeting.start_time).format(
                                'dddd, MMMM D, YYYY'
                              )}
                            </p>
                          </div>

                          <div className='flex gap-16'>
                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faClock} />
                              <p>
                                {dayjs(meeting.start_time)
                                  .tz(userStore.userTimeZone)
                                  .format('HH:mm')}
                              </p>
                            </div>

                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faClock} />
                              <p>
                                {dayjs(meeting.end_time)
                                  .tz(userStore.userTimeZone)
                                  .format('HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className='flex justify-center mt-2'>
                            {meeting.coaches &&
                              meeting.coaches.map((coach) => {
                                const [firstName, lastName] =
                                  coach.name.split(' ');
                                const firstInitial = firstName.charAt(0);
                                const lastInitial = lastName
                                  ? lastName.charAt(0)
                                  : '';

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
                      ) : (
                        <div>
                          <div className='flex gap-4'>
                            <FontAwesomeIcon
                              icon={faCalendarDays}
                              className='self-center'
                            />
                            <p>
                              {dayjs(meeting.start_time).format(
                                'dddd, MMMM D, YYYY'
                              )}
                            </p>
                          </div>
                          <div className='flex gap-16'>
                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faClock} />
                              <p>
                                {dayjs(meeting.start_time)
                                  .tz(userStore.userTimeZone)
                                  .format('HH:mm')}
                              </p>
                            </div>
                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faClock} />
                              <p>
                                {dayjs(meeting.end_time)
                                  .tz(userStore.userTimeZone)
                                  .format('HH:mm')}
                              </p>
                            </div>
                          </div>

                          <div className='flex justify-between'>
                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faUser} />
                              <p>{meeting.coach_name}</p>
                            </div>

                            <div className='flex items-center gap-2 '>
                              <FontAwesomeIcon icon={faPhone} />{' '}
                              <p>{formatPhoneNumber(meeting.coach_phone)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className='text-center text-gray-600 flex self-center font-bold'>
              Sign in/Create Account to add time slots
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default StudentUI;
