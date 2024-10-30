import { SegmentedControl } from '@mantine/core';
import { StoreContext } from '../stores/StoreContext';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

const SwitchRoles = observer(() => {
  // const { uiStore } = useContext(StoreContext);
  const { userStore } = useContext(StoreContext);

  const handleToggle = (value: string) => {
    userStore.toggleRole(value);
    userStore.currentUser = null;
  };
  return (
    <SegmentedControl
      value={userStore.currentRole}
      onChange={handleToggle}
      data={[
        { label: 'Coach', value: 'coach' },
        { label: 'Student', value: 'student' },
      ]}
    />
  );
});

export default SwitchRoles;
