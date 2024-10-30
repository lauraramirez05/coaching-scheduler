import { useState } from 'react';
import {
  Input,
  InputBase,
  Combobox,
  useCombobox,
  Avatar,
  Modal,
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser } from '@fortawesome/free-solid-svg-icons';

const UserSelector = ({ data }) => {
  console.log('data', data);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);

  const options = [
    ...data.map((item) => (
      <Combobox.Option
        value={item.id}
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
    >
      <Avatar>
        <FontAwesomeIcon icon={faUserPlus} onClick={open} />
      </Avatar>
      <span>Create New Coach</span>
    </Combobox.Option>,
  ];

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          setValue(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target className='cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 max-w-xs mx-auto flex items-center justify-center'>
          <div
            onClick={() => combobox.toggleDropdown()}
            className='flex items-center'
          >
            {value ? (
              <>
                <Avatar color='cyan' radius='xl' className='mr-2'>
                  {data.find((item) => item.id === value)?.name.charAt(0)}
                </Avatar>
                <span>{data.find((item) => item.id === value)?.name}</span>
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

      {/* <Modal opened={opened} onClose={close} title='Add New Coach'>
        <InputBase
          label='Your Name'
          type='text'
          placeholder='Name'
          onChange={(event) =>
            coachStore.setNewCoachName(event.currentTarget.value)
          }
        ></InputBase>
        <InputBase
          label='Phone Number'
          placeholder='555-555-5555'
          onChange={(event) =>
            coachStore.setNewCoachPhone(event.currentTarget.value)
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
      </Modal> */}
    </>
  );
};

export default UserSelector;
