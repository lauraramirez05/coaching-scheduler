import { SegmentedControl } from '@mantine/core';
import { StoreContext } from '../stores/StoreContext';
import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import timeSlotStore from '../stores/timeSlotStore';
import {
  getBookedMeetingsForStudent,
  getPastMeetingsForCoach,
  getAllAvailableMeetingsForStudents,
} from '../services/timeSlotServices';

const MeetingFilterModal = observer(() => {
  const { userStore, coachStore, studentStore } = useContext(StoreContext);

  useEffect(() => {
    if (userStore.currentRole === 'coach' && userStore.currentUser) {
      if (timeSlotStore.meetingStatus === 'available') {
        const availableSlots = coachStore.allCoachMeetings.filter((slot) => {
          return slot.status === 'available';
        });
        coachStore.setDisplayedMeetings(availableSlots);
      } else if (timeSlotStore.meetingStatus === 'booked') {
        const bookedSlots = coachStore.allCoachMeetings.filter((slot) => {
          return slot.status === 'booked';
        });
        coachStore.setDisplayedMeetings(bookedSlots);
        console.log('booked', coachStore.displayedMeetings);
      } else if (timeSlotStore.meetingStatus === 'completed') {
        const fetchPastMeetings = async () => {
          const pastMeetings = await getPastMeetingsForCoach(
            userStore.currentUser.id,
            userStore.userTimeZone
          );

          console.log('past meetings', pastMeetings);
          coachStore.setDisplayedMeetings(pastMeetings);
        };

        fetchPastMeetings();
      }
    } else if (userStore.currentRole === 'student' && userStore.currentUser) {
      if (timeSlotStore.meetingStatus === 'booked') {
        const fetchBookedMeetings = async () => {
          const bookedMeetings = await getBookedMeetingsForStudent(
            userStore.currentUser.id,
            userStore.userTimeZone
          );

          studentStore.setDisplayedMeetings(bookedMeetings);
        };

        fetchBookedMeetings();
      } else if (timeSlotStore.meetingStatus === 'available') {
        console.log('fetch all meetings for students in filteringModal');
        const fetchAvailableMeetingsForStudents = async () => {
          const allAvailableMeetingsForStudents =
            await getAllAvailableMeetingsForStudents();

          console.log(Object.values(allAvailableMeetingsForStudents));
          studentStore.setAvailableMeetings(
            Object.values(allAvailableMeetingsForStudents)
          );
          console.log(studentStore.displayedMeetings);
        };

        fetchAvailableMeetingsForStudents();
      }
    }
  }, [timeSlotStore.meetingStatus]);

  const getSegmentedControlData = () => {
    if (userStore.currentRole === 'coach') {
      return [
        { label: 'Available Slots', value: 'available' },
        { label: 'Upcoming Meetings', value: 'booked' },
        { label: 'Past', value: 'completed' },
      ];
    } else if (userStore.currentRole === 'student') {
      return [
        { label: 'Available Slots', value: 'available' },
        { label: 'Upcoming Meetings', value: 'booked' },
      ];
    } else {
      return [{ label: 'Available', value: 'available' }];
    }
  };

  const handleToggle = (value: string) => {
    timeSlotStore.setMeetingStatus(value);
  };

  return (
    <SegmentedControl
      value={timeSlotStore.meetingStatus}
      data={getSegmentedControlData()}
      onChange={(value) => handleToggle(value)}
    />
  );
});

export default MeetingFilterModal;