import { Modal, Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { DatePicker } from '@mantine/dates';
import type { TimePickerProps } from 'antd';
import { TimePicker, Card } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timeSlotStore from '../stores/timeSlotStore';
import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

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
  dayjs.extend(customParseFormat);

  const today = dayjs().startOf('day');

  const handleCurrentDay = () => {
    timeSlotStore.setSelectedDays(today);
  };

  const changeStartTime = (day: Dayjs, time: string) => {
    timeSlotStore.updateTimeSlots(day, time, '');
  };

  const changeEndTime = (day: Dayjs, time: string) => {
    timeSlotStore.updateTimeSlots(day, '', time);
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
      console.log('adding day');
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
    // console.log(isToday);

    const disabledHours = [];
    if (isToday) {
      disabledHours.push(...Array.from({ length: now.hour() }, (_, i) => i));
    }

    // console.log('today hours', disabledHours);

    const commonDisabledHoursStart = [
      ...Array.from({ length: 8 }, (_, i) => i), // Before 8 AM
      ...Array.from({ length: 7 }, (_, i) => i + 19), // After 6 PM
    ];

    // console.log('after filtering', commonDisabledHoursStart);

    // console.log('common disable hours', disabledHours);
    // console.log('Start hours', commonDisabledHoursStart);
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
                            'HH:mm'
                          )
                        : dayjs(day).hour(8).minute(0)
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
                            'HH:mm'
                          )
                        : dayjs(day).hour(10).minute(0)
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

      <Button variant='filled' color='green' className='mt-6' onClick={onClose}>
        Submit
      </Button>
    </Modal>
  );
};

export default observer(AddTimeSlotModal);
