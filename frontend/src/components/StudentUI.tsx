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
import { Checkbox } from '@mantine/core';
import debounce from 'lodash.debounce';
import { getAllAvailableMeetingsForStudents } from '../services/timeSlotServices';
import MeetingFilterModal from './MeetingFilterModal';
import timeSlotStore from '../stores/timeSlotStore';
import MeetingCard from './MeetingCard';

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
                      const lastInitial = lastName ? lastName.charAt(0) : '';

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
                  return <MeetingCard meeting={meeting} />;
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
