import { useState, useContext } from 'react';
import {
  InputBase,
  Combobox,
  useCombobox,
  Avatar,
  Modal,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { StoreContext } from '../stores/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { getUserTimeZone } from '../services/userTimeZone';

const UserSelector = ({ data, handleSubmit }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { userStore } = useContext(StoreContext);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = [
    ...data.map((item) => (
      <Combobox.Option
        value={item}
        key={item.id}
        className='grid grid-cols-2 items-center'
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
      className='grid grid-cols-2 items-center'
      onClick={open}
    >
      <Avatar>
        <FontAwesomeIcon icon={faUserPlus} onClick={open} />
      </Avatar>
      <span>Create New Coach</span>
    </Combobox.Option>,
  ];

  const onSubmit = async () => {
    await handleSubmit(); // Call the handleSubmit from CoachUI
    close(); // Close the modal after submission
  };

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          userStore.setCurrentUser(val);
          getUserTimeZone();
          // setValue(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target className='cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 max-w-xs mx-auto flex items-center justify-center'>
          <div
            onClick={() => combobox.toggleDropdown()}
            className='flex items-center'
          >
            {userStore.currentUser !== null &&
            userStore.currentUser !== 'create-new' ? (
              <>
                <Avatar color='cyan' radius='xl' className='mr-2'>
                  {userStore.currentUser.name.charAt(0)}
                </Avatar>
                <span>{userStore.currentUser.name}</span>
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

export default UserSelector;
