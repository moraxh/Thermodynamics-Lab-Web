'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  organizer: string | null;
  createdAt: string;
};

export type EventFormData = {
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
};

type EventsContextType = {
  events: Event[];
  isLoading: boolean;
  createEvent: (data: EventFormData) => Promise<boolean>;
  updateEvent: (id: string, data: EventFormData) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      toast.error('Error loading events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (data: EventFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create event');

      await fetchEvents();
      toast.success('Event created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create event');
      return false;
    }
  };

  const updateEvent = async (id: string, data: EventFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (!res.ok) throw new Error('Failed to update event');

      await fetchEvents();
      toast.success('Event updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update event');
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete event');

      await fetchEvents();
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete event');
      return false;
    }
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        createEvent,
        updateEvent,
        deleteEvent,
        refreshEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
