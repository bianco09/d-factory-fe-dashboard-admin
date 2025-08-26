"use client"

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchBookings } from "@/utils/api";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface BookingEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  people: number;
  user?: { name: string };
  tour?: { title: string };
  date: string;
}

export default function CalendarView() {
  const [events, setEvents] = useState<BookingEvent[]>([]);

  useEffect(() => {
    fetchBookings().then((bookings: BookingEvent[]) => {
      const evs = bookings.map((b) => ({
        id: b.id,
        title: `${b.tour?.title || "Tour"} (${b.people} people)`,
        start: new Date(b.date),
        end: new Date(b.date),
        people: b.people,
        user: b.user,
        tour: b.tour,
        date: b.date,
      }));
      setEvents(evs);
    });
  }, []);

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        views={["month", "week", "day"]}
        popup
        selectable
        onSelectEvent={(event: BookingEvent) => {
          alert(`Booking for ${event.title}`);
        }}
      />
    </div>
  );
}
