import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { observer } from 'mobx-react-lite';
import {
  AvailableMeetingsStudents,
  TimeSlotCoach,
} from '../services/timeSlotServices';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from '../stores/StoreContext';
import { useContext, useRef, useEffect } from 'react';
import { formatPhoneNumber } from '../services/formatPhoneNumber';

dayjs.extend(utc);
dayjs.extend(timezone);

// Define props interface
interface CalendarProps {
  meetings: TimeSlotCoach[] | AvailableMeetingsStudents[];
  availableDate: {
    date: string;
    meetings: AvailableMeetingsStudents[];
  };
}

interface EventMeetingsType {
  title: string;
  date: string;
}

const Calendar: React.FC<CalendarProps> = ({
  meetings,
  availableDate = [],
}) => {
  const { userStore } = useContext(StoreContext);
  const calendarRef = useRef<FullCalendar | null>(null);

  console.log(meetings);
  console.log(availableDate);

  const eventMeetings: EventMeetingsType[] = [];
  console.log('meetings', meetings);

  if (meetings !== undefined) {
    meetings.forEach((meet) => {
      eventMeetings.push({
        title: `${dayjs(meet.start_time).format('H:mm ')} - ${dayjs(
          meet.end_time
        ).format('H:mm')}`,
        // Convert to the desired timezone if needed, e.g., 'America/New_York'
        start: dayjs(meet.start_time).tz(userStore.userTimeZone).toISOString(),
        end: dayjs(meet.end_time).tz(userStore.userTimeZone).toISOString(),
        // student_phone: `${meet.student_phone ? meet.student_phone : null}`,
        // coach_phone: `${meet.coach_phone ? meet.coach_phone : null}`,
        phone: meet.student_phone
          ? meet.student_phone
          : meet.coach_phone || null,
        status: `${meet.status}`,
        color: `${meet.status === 'booked' ? 'purple' : ''}`,
      });
    });
  }

  if (availableDate.length > 0) {
    availableDate.forEach((date) => {
      eventMeetings.push({
        start: dayjs(date.date).startOf('day').toISOString(),
        end: dayjs(date.date).endOf('day').toISOString(),
        allDay: true,
        color: 'lightblue',
        display: 'background',
      });
    });
  }

  const renderEventContent = (eventInfo) => {
    // Apply different background colors based on status
    const isAvailable =
      eventInfo.event.extendedProps.status === 'available' ? true : false;
    console.log(eventInfo);

    return (
      <div>
        <b className='text-xs'>
          {eventInfo.event.title && eventInfo.event.title}
        </b>
        {!isAvailable && (
          <p className='text-xs'>
            {eventInfo.event.extendedProps.phone
              ? formatPhoneNumber(eventInfo.event.extendedProps.phone)
              : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className='min-w-[700px] max-w-[800px] w-full mx-auto'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        timeZone={userStore.userTimeZone}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={eventMeetings}
        views={{
          dayGridMonth: {
            displayEventTime: true, // Show times in monthly view
          },
          timeGridWeek: {
            slotDuration: '01:00:00',
          },
        }}
        allDaySlot={false}
        eventColor=''
        eventContent={renderEventContent}
        eventDisplay='block'
      />
    </div>
  );
};

export default observer(Calendar);
