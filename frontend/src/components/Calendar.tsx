import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  return (
    <div className='w-[600px] h-auto mx-auto p-0'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth' // Default view
        headerToolbar={{
          left: 'prev,next today', // Buttons to navigate between months
          center: 'title', // Title of the calendar
          right: 'dayGridMonth,timeGridWeek,timeGridDay', // View switcher
        }}
        views={{
          dayGridMonth: {
            // Configuration for monthly view
          },
          timeGridWeek: {
            // Configuration for weekly view
            slotDuration: '00:30:00', // Sets the duration of each slot
          },
          timeGridDay: {
            // Configuration for daily view
            slotDuration: '00:30:00', // Sets the duration of each slot
          },
        }}
        // Additional options can go here, such as events, date settings, etc.
      />
    </div>
  );
};

export default Calendar;
