import { db } from "@db/connection"
import { Event } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type EventInsert = typeof Event.$inferInsert

// IMPORTANT: This data is only for development purposes. Do not use it in production.
const test_events: EventInsert[] = []  
const locations = ["Auditorium", "Room 101", "Room 102", "Room 103", "Room 104", "Room 105"]

for (let i = 0; i < 15; i++) {
  const event: EventInsert = {
    id: generateIdFromEntropySize(10),
    title: `Title of the event ${i + 1}`,
    description: `Description of the event ${i + 1}`,
    typeOfEvent: "Conference",
    eventDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toDateString(),
    startTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toTimeString(),
    endTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toTimeString(),
    location: locations[Math.floor(Math.random() * locations.length)],
    link: `https://example.com/event-${i + 1}`,
    uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
  }

  test_events.push(event)
}

export async function seedEvents() {
  await db.insert(Event).values(test_events)
}