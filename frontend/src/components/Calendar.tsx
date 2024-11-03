import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { observer } from 'mobx-react-lite';
import { TimeSlotCoach } from '../services/timeSlotServices';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from '../stores/StoreContext';
import { useContext } from 'react';

dayjs.extend(utc);
dayjs.extend(timezone);

// Define props interface
interface CalendarProps {
  meetings: TimeSlotCoach[];
}

interface EventMeetingsType {
  title: string;
  date: string;
}

const Calendar: React.FC<CalendarProps> = ({ meetings }) => {
  const { userStore } = useContext(StoreContext);

  const eventMeetings: EventMeetingsType[] = [];

  if (meetings !== undefined) {
    meetings.forEach((meet) => {
      eventMeetings.push({
        title: `${dayjs(meet.start_time).format('H a')} - ${dayjs(
          meet.end_time
        ).format('H a')}`,
        // Convert to the desired timezone if needed, e.g., 'America/New_York'
        start: dayjs(meet.start_time).tz(userStore.userTimeZone).toISOString(),
        end: dayjs(meet.end_time).tz(userStore.userTimeZone).toISOString(),
      });
    });
  }

  return (
    <div className='w-[800px] h-auto mx-auto p-0'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='timeGridWeek'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={eventMeetings}
        views={{
          dayGridMonth: {
            displayEventTime: false, // Show times in monthly view
          },
          timeGridWeek: {
            slotDuration: '01:00:00',
          },
        }}
        allDaySlot={false}
      />
    </div>
  );
};

export default observer(Calendar);
