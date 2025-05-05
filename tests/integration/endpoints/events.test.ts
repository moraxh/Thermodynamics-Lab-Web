import { describe, it, expect, vi } from 'vitest';
import { GET } from '@api/events';
import { EventRepository } from '@src/repositories/EventRepository';
import type { EventSelect } from '@src/repositories/EventRepository';
import type { APIContext } from 'astro';

vi.mock('@src/repositories/EventRepository');

const mockEvents: EventSelect[] = [
  {
    id: '1',
    title: 'Event 1',
    link: 'https://example.com/event1',
    description: 'Description of event 1',
    typeOfEvent: 'Type 1',
    eventDate: '2023-01-01',  
    startTime: '10:00',
    endTime: '12:00',
    location: 'Location 1',
    uploadedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Event 2',
    link: 'https://example.com/event2',
    description: 'Description of event 2',
    typeOfEvent: 'Type 2',
    eventDate: '2023-01-02',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Location 2',
    uploadedAt: new Date('2023-01-02'),
  }
]

describe('GET /events', async () => {
  it('should return a list of events without params', async () => {
    vi.spyOn(EventRepository, 'getEvents').mockResolvedValueOnce(mockEvents)

    const url = new URL("http://localhost/api/events")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.events).toEqual(
      mockEvents.map(event => ({
        ...event,
        uploadedAt: new Date(event.uploadedAt).toISOString()
      }))
    )

    expect(EventRepository.getEvents).toHaveBeenCalled()
  })

  it('should return a list of events with params', async () => {
    const page = 1
    const limit = 5
    const total = 10

    vi.spyOn(EventRepository, 'getEvents').mockResolvedValueOnce(mockEvents)
    vi.spyOn(EventRepository, 'getNumberOfEvents').mockResolvedValueOnce(total)

    const url = new URL("http://localhost/api/events")
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', limit.toString())

    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.info.page).toBe(page)
    expect(body.info.limit).toBe(limit)
    expect(body.info.total).toBe(total)
    
    expect(body.events).toEqual(
      mockEvents.map(event => ({
        ...event,
        uploadedAt: new Date(event.uploadedAt).toISOString()
      }))
    )

    expect(EventRepository.getEvents).toHaveBeenCalledWith(page, limit)
  })

  it('should return an empty list of events if no events are found', async () => {
    const page = 1
    const limit = 5
    const total = 0

    vi.spyOn(EventRepository, 'getEvents').mockResolvedValueOnce([])
    vi.spyOn(EventRepository, 'getNumberOfEvents').mockResolvedValueOnce(total)

    const url = new URL("http://localhost/api/events")
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', limit.toString())

    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.info.page).toBe(page)
    expect(body.info.limit).toBe(limit)
    expect(body.info.total).toBe(total)
    
    expect(body.events).toEqual([])

    expect(EventRepository.getEvents).toHaveBeenCalledWith(page, limit)
  })

  it('should return an error if something goes wrong on the repository', async () => {
    vi.spyOn(EventRepository, 'getEvents').mockRejectedValueOnce(new Error('Database error'))

    const url = new URL("http://localhost/api/events")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()
  })
})