import { useContext } from 'react';
import {
  InputBase,
  Combobox,
  useCombobox,
  Avatar,
  Modal,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { getUserTimeZone } from '../services/userTimeZone';
import {
  AvailableMeetingsStudents,
  getAllAvailableMeetingsForStudents,
  getAllMeetingsForCoach,
  getBookedMeetingsForStudent,
} from '../services/timeSlotServices';
import timeSlotStore from '../stores/timeSlotStore';
import dayjs from 'dayjs';

const UserSelector = ({ data, handleSubmit }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { userStore, coachStore, studentStore } = useContext(StoreContext);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const fetchAllMeetingsForCoach = async () => {
    if (userStore.currentRole === 'coach') {
      if (userStore.currentUser) {
        try {
          const result = await getAllMeetingsForCoach(
            userStore.currentUser.id,
            userStore.userTimeZone
          );

          coachStore.setAllCoachMeetings(result);

          if (timeSlotStore.meetingStatus === 'available') {
            const availableSlots = coachStore.allCoachMeetings.filter(
              (slot) => {
                return slot.status === 'available';
              }
            );
            coachStore.setDisplayedMeetings(availableSlots);
          }
        } catch (error) {
          console.error('Error fetching upcoming meetings:', error);
        }
      }
    }
  };

  const fetchAvailableMeetingStudents = async () => {
    try {
      const availableMeetings: AvailableMeetingsStudents[] =
        (await getAllAvailableMeetingsForStudents()) || [];

      const bookedMeetings: AvailableMeetingsStudents[] =
        await getBookedMeetingsForStudent(
          userStore.currentUser.id,
          userStore.userTimeZone
        );

      studentStore.setBookedMeetings(bookedMeetings);

      // const availableDates = {};

      // Object.values(availableMeetings).forEach((meeting) => {
      //   const date = dayjs(meeting.start_time).format('YYYY-MM-DD');
      //   if (!availableDates[date]) {
      //     availableDates[date] = {
      //       date: date,
      //       meetings: [],
      //     };
      //   }
      //   availableDates[date].meetings.push(meeting);
      // });

      // studentStore.setAvailableDates(Object.values(availableDates));

      studentStore.setAvailableMeetings(Object.values(availableMeetings));
    } catch (error) {
      console.error(
        `Error in 'fetchAvailableMeetingStudents', couldn't get the meetings`,
        error
      );
    }
  };

  const options = [
    ...data.map((item) => (
      <Combobox.Option
        value={item}
        key={item.id}
        className='grid grid-cols-[auto_1fr] items-center gap-2'
      >
        <Avatar color='cyan' radius='xl'>
          {item.name.charAt(0)}
        </Avatar>
        <span className='self-center'>{item.name}</span>
      </Combobox.Option>
    )),

    <Combobox.Option
      value='create-new'
      key='create-new'
      className='grid grid-cols-[auto_1fr] items-center gap-2'
      onClick={open}
    >
      <Avatar>
        <FontAwesomeIcon icon={faUserPlus} onClick={open} />
      </Avatar>
      <span>Create New {userStore.currentRole}</span>
    </Combobox.Option>,
  ];

  const handleUserSelection = (val) => {
    userStore.setCurrentUser(val);
    getUserTimeZone();

    if (userStore.currentRole === 'coach') {
      coachStore.resetCoachUI();
      fetchAllMeetingsForCoach();
    } else if (userStore.currentRole === 'student') {
      studentStore.resetStudentUI();
      fetchAvailableMeetingStudents();
    }

    timeSlotStore.setMeetingStatus('available');

    combobox.closeDropdown();
  };

  const onSubmit = async () => {
    await handleSubmit();
    close();
  };

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => handleUserSelection(val)}
      >
        <Combobox.Target className='cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 max-w-xs mx-auto flex items-center justify-center'>
          <div onClick={() => combobox.toggleDropdown()}>
            {userStore.currentUser !== null &&
            userStore.currentUser !== 'create-new' ? (
              <>
                <Avatar color='cyan' radius='xl'>
                  {userStore.currentUser.name.charAt(0)}
                </Avatar>
                <span className='flex-1'>{userStore.currentUser.name}</span>
              </>
            ) : (
              <>
                <Avatar>
                  <FontAwesomeIcon icon={faUser} />
                </Avatar>
                <span className='ml-2'>Sign In</span>
              </>
            )}
            <Combobox.Chevron className='self-center' />
          </div>
        </Combobox.Target>

        <Combobox.Dropdown className='w-24 mx-auto '>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      <Modal opened={opened} onClose={close} title='Create New User'>
        <InputBase
          label='Your Name'
          type='text'
          placeholder='Name'
          onChange={(event) =>
            userStore.setNewUserName(event.currentTarget.value)
          }
        ></InputBase>
        <InputBase
          label='Phone Number'
          placeholder='555-555-5555'
          onChange={(event) =>
            userStore.setNewUserPhone(event.currentTarget.value)
          }
        ></InputBase>
        <Button
          variant='filled'
          color='green'
          className='mt-6'
          onClick={onSubmit}
        >
          Submit
        </Button>
      </Modal>
    </>
  );
};

export default observer(UserSelector);
