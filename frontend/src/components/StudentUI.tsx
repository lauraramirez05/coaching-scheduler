import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Avatar, Modal, InputBase, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { StudentData, createStudent } from '../services/studentServices';

const StudentUI = observer(() => {
  const [opened, { open, close }] = useDisclosure(false);
  const { studentStore } = useContext(StoreContext);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  studentStore.setStudentTimeZone(userTimeZone);

  const handleSubmit = async () => {
    const studentData: StudentData = {
      name: studentStore.newUserName,
      phone: studentStore.newUserPhone,
    };

    try {
      const createdStudent = await createStudent(studentData);
      console.log(`Student created`, createdStudent);
      studentStore.setNewUserName('');
      studentStore.setNewUserPhone('');
      close();
    } catch (error) {
      console.error(`Error creating student`, error);
    }
  };

  return (
    <div>
      <div>
        <Avatar
          className='cursor-pointer hover:scale-110 hover:shadow-lg'
          onClick={open}
        >
          <FontAwesomeIcon icon={faUserPlus} onClick={open} />
        </Avatar>
      </div>
      <Modal opened={opened} onClose={close} title='Add New User'>
        <InputBase
          label='Your Name'
          type='text'
          placeholder='Name'
          onChange={(event) =>
            studentStore.setNewUserName(event.currentTarget.value)
          }
        ></InputBase>
        <InputBase
          label='Phone Number'
          placeholder='555-555-5555'
          onChange={(event) =>
            studentStore.setNewUserPhone(event.currentTarget.value)
          }
        ></InputBase>
        <Button
          variant='filled'
          color='green'
          className='mt-6'
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Modal>
      <div>
        <div>calendar</div>
        <div>time slots</div>
      </div>
    </div>
  );
});

export default StudentUI;
