import { Modal, Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { DatePicker } from '@mantine/dates';
import { TimePicker, Card } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timeSlotStore from '../stores/timeSlotStore';
import { useCallback, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { createTimeSlots } from '../services/timeSlotServices';
import { StoreContext } from '../stores/StoreContext';

interface AddTimeSlotModalProps {
  opened: boolean;
  onClose: () => void;
}

type RangeDisabledTime = (
  now: Dayjs,
  type: 'start' | 'end'
) => {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
};

const AddTimeSlotModal = ({ opened, onClose }: AddTimeSlotModalProps) => {
  const { coachStore, userStore } = useContext(StoreContext);
  dayjs.extend(customParseFormat);

  const today = dayjs().startOf('day');

  const handleCurrentDay = () => {
    timeSlotStore.setSelectedDays(today);
  };

  const changeStartTime = (day: Dayjs) => {
    timeSlotStore.updateTimeSlots(day, day.format('YYYY-MM-DDTHH:mm:ssZ'), '');
  };

  const changeEndTime = (day: Dayjs) => {
    timeSlotStore.updateTimeSlots(day, '', day.format('YYYY-MM-DDTHH:mm:ssZ'));
    timeSlotStore.isSessionValid(day);
  };

  const renderDay = useCallback(
    (date: Date) => {
      const day = dayjs(date);
      const isTodayDate = day.isSame(today, 'day');
      const isFutureDate = day.isAfter(today);
      const isSelected = timeSlotStore.selectedDays.some((s) =>
        day.isSame(s, 'date')
      );

      const dayClass = `flex items-center justify-center w-8 h-8 rounded-full cursor-pointer ${
        isSelected
          ? 'bg-green-200 text-white'
          : isTodayDate
          ? 'bg-blue-200'
          : isFutureDate
          ? 'text-blue-500'
          : 'text-gray-400'
      }`;

      return <div className={dayClass}>{day.date()}</div>;
    },
    [timeSlotStore.selectedDays]
  );

  const handleSelectDays = (date: Date) => {
    const isSelected = timeSlotStore.selectedDays.some((s) =>
      dayjs(date).isSame(s, 'date')
    );

    if (isSelected) {
      timeSlotStore.updateSelectedDays(date);
    } else if (timeSlotStore.selectedDays.length < 4) {
      timeSlotStore.setSelectedDays(date);
    }
  };

  const handleRemoveDay = (day: Date) => {
    timeSlotStore.updateSelectedDays(day);
  };

  const handleClose = () => {
    onClose();
    timeSlotStore.resetSelectedDays();
  };

  const handleStatus = (day: Dayjs) => {
    const dateStr = dayjs(day).format('YYYY-MM-DD');

    if (timeSlotStore.timeSlots[dateStr]) {
      const slot = timeSlotStore.timeSlots[dateStr];

      return slot.validSession ? '' : 'error';
    }

    return '';
  };

  const getDisabledTime: RangeDisabledTime = (now, type) => {
    const isToday = dayjs().isSame(now, 'day');

    const disabledHours = [];
    if (isToday) {
      disabledHours.push(...Array.from({ length: now.hour() }, (_, i) => i));
    }

    const commonDisabledHoursStart = [
      ...Array.from({ length: 8 }, (_, i) => i), // Before 8 AM
      ...Array.from({ length: 7 }, (_, i) => i + 19), // After 6 PM
    ];

    const commonDisabledHoursEnd = [
      ...Array.from({ length: 10 }, (_, i) => i),
      ...Array.from({ length: 9 }, (_, i) => i + 21),
    ];

    if (type === 'start') {
      return {
        disabledHours: () => commonDisabledHoursStart,
        disabledMinutes: (selectedHour) => {
          return [];
        },
      };
    }

    if (type === 'end') {
      return {
        disabledHours: () => commonDisabledHoursEnd,
        disabledMinutes: (selectedHour) => {
          return [];
        },
      };
    }
  };

  const handleSubmit = async () => {
    if (userStore.currentUser) {
      const response = await createTimeSlots({
        timeSlots: timeSlotStore.timeSlots,
        coachId: userStore.currentUser.id,
        timeZone: userStore.userTimeZone,
      });
      const approvedTimeSlots = response.createdLinks;
      console.log('aproved slot', approvedTimeSlots);
      approvedTimeSlots.forEach((slot) => {
        const modifiedSlot = {
          ...slot.dataValues,
          start_time: slot.start_time,
          end_time: slot.end_time,
        };
        coachStore.refreshMeetings(modifiedSlot);
      });

      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map((err) => err).join('\n');
        alert(errorMessages);
      }

      onClose();

      timeSlotStore.resetSelectedDays();
    } else {
      console.error('Current user is not available.');
    }
  };
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title='Add New Time Slot'
      size='lg'
    >
      <div className='flex'>
        <div>
          <DatePicker
            allowDeselect
            minDate={today.toDate()}
            renderDay={renderDay}
            getDayProps={(date) => ({
              selected: timeSlotStore.selectedDays.some((s) =>
                dayjs(date).isSame(s, 'date')
              ),
              onClick: () => handleSelectDays(date),
            })}
          />
          {timeSlotStore.timeSlots.length === 0 && <p>Select day to start</p>}
          {timeSlotStore.selectedDays.length === 4 && (
            <p className='text-red-500 mt-4'>Reach the limit of dates picked</p>
          )}
        </div>
        <div>
          {timeSlotStore.selectedDays.length > 0 ? (
            timeSlotStore.selectedDays.map((day) => (
              <Card
                key={dayjs(day).toString()}
                bodyStyle={{ padding: '12px' }}
                className='mb-2 w-64'
              >
                <div className='flex justify-between mb-2 border-b-2'>
                  <h3 className='font-bold'>
                    {dayjs(day).format('DD MMMM YYYY')}
                  </h3>
                  <FontAwesomeIcon
                    icon={faX}
                    className='text-xs cursor-pointer self-center'
                    onClick={() => handleRemoveDay(day)}
                  />
                </div>

                <div className='flex justify-between'>
                  <label className='font-medium'>Start Time:</label>
                  <TimePicker
                    onChange={changeStartTime}
                    defaultOpenValue={dayjs(day).hour(8).minute(0)}
                    value={
                      timeSlotStore.timeSlots[dayjs(day).format('YYYY-MM-DD')]
                        ? dayjs(
                            timeSlotStore.timeSlots[
                              dayjs(day).format('YYYY-MM-DD')
                            ].startTime,
                            'YYYY-MM-DDTHH:mm:ssZ' // Correct input format
                          ) // Keep it as a Day.js object
                        : dayjs(day).hour(10).minute(0) // Default time as Day.js object
                    }
                    format='HH:mm'
                    disabledTime={(now) => getDisabledTime(dayjs(now), 'start')}
                  />
                </div>
                <div className='flex justify-between'>
                  <label>End Time</label>
                  <TimePicker
                    onChange={changeEndTime}
                    defaultOpenValue={dayjs(day).hour(10).minute(0)} // Default time to 10:00 AM for opening
                    value={
                      timeSlotStore.timeSlots[dayjs(day).format('YYYY-MM-DD')]
                        ? dayjs(
                            timeSlotStore.timeSlots[
                              dayjs(day).format('YYYY-MM-DD')
                            ].endTime,
                            'YYYY-MM-DDTHH:mm:ssZ' // Correct input format
                          ) // Keep it as a Day.js object
                        : dayjs(day).hour(10).minute(0) // Default time as Day.js object
                    }
                    format='HH:mm'
                    disabledTime={(now) => getDisabledTime(dayjs(now), 'end')}
                    status={handleStatus(day)} // Handle the status based on validations
                  />
                </div>
              </Card>
            ))
          ) : (
            <Card bodyStyle={{ padding: '12px' }} className='mb-2 w-64'>
              <div className='flex justify-between mb-2 border-b-2'>
                <h3 className='font-bold'>
                  {dayjs(today).format('DD MMMM YYYY')}
                </h3>
              </div>

              <div className='flex justify-between'>
                <label>Start Time</label>
                <TimePicker
                  onClick={handleCurrentDay}
                  onChange={changeStartTime}
                  defaultOpenValue={dayjs()}
                  format='HH:mm'
                  disabledTime={(now) => getDisabledTime(dayjs(now), 'start')}
                />
              </div>
              <div className='flex justify-between'>
                <label>End Time</label>
                <TimePicker
                  onChange={changeEndTime}
                  defaultOpenValue={dayjs().hour(20).minute(0)}
                  format='HH:mm'
                  disabledTime={(now) => getDisabledTime(dayjs(now), 'end')}
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      <Button
        variant='filled'
        color='green'
        className='mt-6'
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Modal>
  );
};

export default observer(AddTimeSlotModal);
