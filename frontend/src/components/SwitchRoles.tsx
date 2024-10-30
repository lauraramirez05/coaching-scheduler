import { SegmentedControl } from '@mantine/core';
import { StoreContext } from '../stores/StoreContext';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

const SwitchRoles = observer(() => {
  const { uiStore } = useContext(StoreContext);

  const handleToggle = (value: string) => {
    uiStore.toggleRole(value);
  };
  return (
    <SegmentedControl
      value={uiStore.role}
      onChange={handleToggle}
      data={[
        { label: 'Coach', value: 'coach' },
        { label: 'Student', value: 'student' },
      ]}
    />
  );
});

export default SwitchRoles;
