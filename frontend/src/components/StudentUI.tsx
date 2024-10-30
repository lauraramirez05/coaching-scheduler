import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../stores/StoreContext';
import UserSelector from './UserSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Avatar, Modal, InputBase, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  StudentData,
  StudentResponse,
  createStudent,
  getAllStudents,
} from '../services/studentServices';
import { getUserTimeZone } from '../services/userTimeZone';

const StudentUI = observer(() => {
  // const [opened, { open, close }] = useDisclosure(false);
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

    fetchStudents();
  }, []);

  const handleSubmit = async () => {
    const studentData: StudentData = {
      name: userStore.newUserName,
      phone: userStore.newUserPhone,
    };

    try {
      const createdStudent = await createStudent(studentData);
      studentStore.addNewStudent(createStudent);
      userStore.setCurrentUser(createStudent);
      userStore.setNewUserName('');
      userStore.setNewUserPhone('');
      close();
    } catch (error) {
      console.error(`Error creating student`, error);
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
      <div>
        <div>calendar</div>
        <div>time slots</div>
      </div>
    </div>
  );
});

export default StudentUI;
