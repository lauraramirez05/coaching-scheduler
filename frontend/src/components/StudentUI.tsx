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
import { getAllCoaches } from '../services/coachServices';
import coachStore from '../stores/coachStore';
import { Checkbox, Avatar, Button } from '@mantine/core';
import { Card } from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import {
  bookTimeSlot,
  getAllAvailableMeetingsForStudents,
} from '../services/timeSlotServices';

const StudentUI = observer(() => {
  const { studentStore } = useContext(StoreContext);
  const { userStore } = useContext(StoreContext);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allStudents: StudentResponse[] = (await getAllStudents()) || [];
        studentStore.setStudents(allStudents);
      } catch (error) {
        console.error('Error fetching coaches', error);
      }
    };

    // const fetchAvailableMeetings = async () => {
    //   try {
    //     const allAvailableMeetings =
    //       (await getAllAvailableMeetingsForStudents()) || [];
    //     studentStore.setDisplayedMeetings(allAvailableMeetings);
    //   } catch (error) {
    //     console.error('Error fetch all available meetings', error);
    //   }
    // };

    fetchStudents();
    // fetchAvailableMeetings();
    // getAllCoaches();
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

    console.log('USER', userStore.currentUser);

    const filteredMeetings = studentStore.availableMeetings.filter(
      (meeting) => {
        console.log('meeting', meeting);
        return meeting.coaches.some((meetingCoach) => {
          console.log(meetingCoach);
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
  };

  const handleBooking = async () => {
    if (studentStore.selectedBooking.coach_id === '') {
      console.log('here');
      console.log('booking id', studentStore.selectedBooking.time_slot_id);
      studentStore.setErrorCard(studentStore.selectedBooking.time_slot_id);
    } else {
      const result = await bookTimeSlot(studentStore.selectedBooking);
      console.log(result.status);
      console.log(result.message);

      if (result.status === 'success') {
        studentStore.confirmedBooking = result;
        console.log(studentStore.confirmedBooking);
        alert(result.message);

        const allAvailableMeetings = await getAllAvailableMeetingsForStudents();

        studentStore.setAvailableMeetings(allAvailableMeetings);

        studentStore.resetAfterBooking();
      } else if (result.status === 'error') {
        alert(result.message); // Notify the user of the error
      }
    }
  };

  return (
    <div>
      <div>
        <UserSelector
          data={studentStore.students}
          handleSubmit={handleSubmit}
        />
      </div>
      <div className='flex justify-between'>
        <Calendar meetings={[]} />
        <div>
          <div className='flex justify-between'>
            {userStore.currentUser &&
              coachStore.coaches &&
              coachStore.coaches.map((coach) => {
                const [firstName, lastName] = coach.name.split(' ');
                const lastInitial = lastName ? lastName.charAt(0) : ''; // Get the first letter of the last name

                return (
                  <Checkbox
                    key={coach.id}
                    label={`${firstName} ${lastInitial}.`}
                    // checked={studentStore.selectedCoaches.includes(coach.id)}
                    onClick={() => handleCoachFiltering(coach.id)}
                  />
                );
              })}
          </div>
          {studentStore.displayedMeetings.map((meeting) => {
            const isBooked =
              studentStore.confirmedBooking &&
              studentStore.confirmedBooking.time_slot_id ===
                meeting.time_slot_id;
            console.log('isBooked', isBooked);
            return (
              <Card key={meeting.time_slot_id}>
                {isBooked ? (
                  <div className='text-center'>
                    <h3 className='text-lg font-bold'>Congratulations!</h3>
                    <p>
                      You have booked this time slot for{' '}
                      {dayjs(meeting.start_time).format('dddd, MMMM D, YYYY')}{' '}
                      at{' '}
                      {dayjs(meeting.start_time)
                        .tz(userStore.userTimeZone)
                        .format('HH:mm')}
                      <br />
                      Coach's Phone Number:{' '}
                      {studentStore.confirmedBooking.coachPhone}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong>Date:</strong>{' '}
                      {dayjs(meeting.start_time).format('dddd, MMMM D, YYYY')}
                    </p>
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
                      <div className='flex justify-center'>
                        {meeting.coaches.map((coach) => {
                          const [firstName, lastName] = coach.name.split(' ');
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
                              color='cyan'
                              radius='xl'
                              className={`mr-2 cursor-pointer transition-transform duration-200 ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 scale-105'
                                  : 'hover:ring-2 hover:ring-blue-300 hover:scale-105'
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
                    </div>
                    {studentStore.errorCard === meeting.time_slot_id && (
                      <p className='text-red-500 mt-2 text-center'>
                        Please select a coach
                      </p>
                    )}
                    <Button onClick={handleBooking}>Book</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default StudentUI;
