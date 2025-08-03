import {
  beforeEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { copyFormData } from '@src/utils/formData';
import { createMockContext } from '@__mocks__/utils';
import {
  DELETE,
  GET,
  PATCH,
  POST
  } from '@api/events';
import { EventRepository } from '@src/repositories/EventRepository';
import type { EventSelect } from '@src/repositories/EventRepository';
import type { APIContext } from 'astro';

vi.mock('@src/repositories/EventRepository');

beforeEach(() => {
  vi.restoreAllMocks()
})

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

const uri = "http://localhost/api/events";

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

describe('POST /events', async () => {
  const validFormData = new FormData();
  validFormData.append('title', 'Test Event');
  validFormData.append('description', 'This is a test event');
  validFormData.append('typeOfEvent', 'Conference');
  validFormData.append('eventDate', '2026-01-01');
  validFormData.append('startTime', '10:00');
  validFormData.append('endTime', '12:00');
  validFormData.append('location', 'Test Location');
  validFormData.append('link', 'https://example.com/test-event');

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request(uri, {
        method: 'POST',
        body: formData
      })
    )
  }

  it('should create a new event', async() => {
    vi.spyOn(EventRepository, 'getEventsByTitle').mockResolvedValueOnce([]);
    vi.spyOn(EventRepository, 'insertEvents').mockResolvedValueOnce();

    const context = createValidContext(validFormData);

    const response = await POST(context)
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toEqual('Evento creado correctamente');
  })

  it('should return an error if the formdata is not provided', async() => {
    vi.spyOn(EventRepository, 'getEventsByTitle').mockResolvedValueOnce([]);
    vi.spyOn(EventRepository, 'insertEvents').mockResolvedValueOnce();

    const context = createValidContext();

    const response = await POST(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al crear el evento');
  })

  it('should return an error if any of the parameters are not provided', async() => {
    vi.spyOn(EventRepository, 'getEventsByTitle').mockResolvedValueOnce([]);
    vi.spyOn(EventRepository, 'insertEvents').mockResolvedValueOnce();

    const testCases = {
      title: 'El título es requerido',
      description: 'La descripción es requerida',
      typeOfEvent: 'El tipo de evento es requerido',
      eventDate: 'La fecha del evento es requerida',
      startTime: 'La hora de inicio del evento es requerida',
      endTime: 'La hora de fin del evento es requerida',
      location: 'La ubicación del evento es requerida',
    }

    for (const [key, error] of Object.entries(testCases)) {
      const formData = copyFormData (validFormData);
      formData.delete(key);

      const context = createValidContext(formData);

      const response = await POST(context);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toEqual(error);
    }
  })

  it('should return an error if any of the parameters is invalid', async() => {
    const testCases = [
      { field: 'title', value: 'h'.repeat(2), error: 'El título debe tener al menos 3 caracteres de longitud' },
      { field: 'title', value: 'h'.repeat(501), error: 'El título no puede tener mas de 500 caracteres de longitud' },
      { field: 'description', value: 'd'.repeat(2), error: 'La descripción debe tener al menos 3 caracteres de longitud' },
      { field: 'description', value: 'd'.repeat(5001), error: 'La descripción no puede tener mas de 5000 caracteres de longitud' },
      { field: 'typeOfEvent', value: 't'.repeat(2), error: 'El tipo de evento debe tener al menos 3 caracteres de longitud' },
      { field: 'typeOfEvent', value: 't'.repeat(256), error: 'El tipo de evento no puede tener mas de 255 caracteres de longitud' },
      { field: 'startTime', value: '9:00', error: 'La hora de inicio del evento debe tener al menos 5 caracteres de longitud' },
      { field: 'startTime', value: '10:000', error: 'La hora de inicio del evento no puede tener mas de 5 caracteres de longitud' },
      { field: 'endTime', value: '9:00', error: 'La hora de fin del evento debe tener al menos 5 caracteres de longitud' },
      { field: 'endTime', value: '10:000', error: 'La hora de fin del evento no puede tener mas de 5 caracteres de longitud' },
      { field: 'location', value: 'l'.repeat(2), error: 'La ubicación del evento debe tener al menos 3 caracteres de longitud' },
      { field: 'location', value: 'l'.repeat(256), error: 'La ubicación del evento no puede tener mas de 255 caracteres de longitud' }
    ]

    for (const testCase of testCases) {
      const formData = copyFormData(validFormData);
      formData.set(testCase.field, testCase.value);

      const context = createValidContext(formData);

      const response = await POST(context);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toEqual(testCase.error);
    }
  })

  it('should return an error if the event already exists', async() => {
    const existingEvent = {
      ...mockEvents[0],
      title: 'Existing Event',
      eventDate: '2026-01-01',
      startTime: '10:00',
      endTime: '12:00'
    };

    vi.spyOn(EventRepository, 'getEventsByTitle').mockResolvedValueOnce([existingEvent]);
    vi.spyOn(EventRepository, 'insertEvents').mockResolvedValueOnce();

    const formData = copyFormData(validFormData);
    formData.set('title', existingEvent.title);
    formData.set('eventDate', existingEvent.eventDate);
    formData.set('startTime', existingEvent.startTime);
    formData.set('endTime', existingEvent.endTime);

    const context = createValidContext(formData);

    const response = await POST(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toEqual("Ya existe un evento con el mismo título, fecha y hora");
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(EventRepository, 'getEventsByTitle').mockRejectedValueOnce(new Error('Database error'));
    vi.spyOn(EventRepository, 'insertEvents').mockRejectedValueOnce(new Error('Database error'));

    const context = createValidContext(validFormData);

    const response = await POST(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al crear el evento');
  })
})

describe('PATCH /events', async () => {
  const validFormData = new FormData();
  validFormData.append('id', '1');
  validFormData.append('title', 'Updated Event');
  validFormData.append('description', 'This is an updated test event');
  validFormData.append('typeOfEvent', 'Workshop');
  validFormData.append('eventDate', '2026-02-01');
  validFormData.append('startTime', '14:00');
  validFormData.append('endTime', '16:00');
  validFormData.append('location', 'Updated Test Location');
  validFormData.append('link', 'https://example.com/updated-test-event');

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request(uri, {
        method: 'PATCH',
        body: formData
      })
    )
  }

  it('should update an event', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(mockEvents[0]);
    vi.spyOn(EventRepository, 'updateEventById').mockResolvedValueOnce();

    const context = createValidContext(validFormData);

    const response = await PATCH(context)
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toEqual('Evento actualizado correctamente');
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext();

    const response = await PATCH(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al actualizar el evento');
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData);
    formData.delete('id');

    const context = createValidContext(formData);

    const response = await PATCH(context)
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toEqual('El ID del evento es requerido');
  })

  it('should return an error if the event does not exist', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(null);

    const context = createValidContext(validFormData);

    const response = await PATCH(context)
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toEqual('No hay ningún evento con ese ID');
  })

  it('should return an error if any of the parameters are not provided', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(mockEvents[0]);

    const testCases = {
      title: 'El título es requerido',
      description: 'La descripción es requerida',
      typeOfEvent: 'El tipo de evento es requerido',
      eventDate: 'La fecha del evento es requerida',
      startTime: 'La hora de inicio del evento es requerida',
      endTime: 'La hora de fin del evento es requerida',
      location: 'La ubicación del evento es requerida',
    }

    await Promise.all(Object.entries(testCases).map(async ([key, error]) => {
      vi.clearAllMocks();
      vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(mockEvents[0]);

      const formData = copyFormData(validFormData);
      formData.delete(key);

      const context = createValidContext(formData);

      const response = await PATCH(context);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toEqual(error);
    }));
  })

  it('should return an error if any of the parameters is invalid', async() => {
    const testCases = [
      { field: 'title', value: 'h'.repeat(2), error: 'El título debe tener al menos 3 caracteres de longitud' },
      { field: 'title', value: 'h'.repeat(501), error: 'El título no puede tener mas de 500 caracteres de longitud' },
      { field: 'description', value: 'd'.repeat(2), error: 'La descripción debe tener al menos 3 caracteres de longitud' },
      { field: 'description', value: 'd'.repeat(5001), error: 'La descripción no puede tener mas de 5000 caracteres de longitud' },
      { field: 'typeOfEvent', value: 't'.repeat(2), error: 'El tipo de evento debe tener al menos 3 caracteres de longitud' },
      { field: 'typeOfEvent', value: 't'.repeat(256), error: 'El tipo de evento no puede tener mas de 255 caracteres de longitud' },
      { field: 'startTime', value: '9:00', error: 'La hora de inicio del evento debe tener al menos 5 caracteres de longitud' },
      { field: 'startTime', value: '10:000', error: 'La hora de inicio del evento no puede tener mas de 5 caracteres de longitud' },
      { field: 'endTime', value: '9:00', error: 'La hora de fin del evento debe tener al menos 5 caracteres de longitud' },
      { field: 'endTime', value: '10:000', error: 'La hora de fin del evento no puede tener mas de 5 caracteres de longitud' },
      { field: 'location', value: 'l'.repeat(2), error: 'La ubicación del evento debe tener al menos 3 caracteres de longitud' },
      { field: 'location', value: 'l'.repeat(256), error: 'La ubicación del evento no puede tener mas de 255 caracteres de longitud' }
    ]

    for (const testCase of testCases) {
      vi.clearAllMocks();
      vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(mockEvents[0]);

      const formData = copyFormData(validFormData);
      formData.set(testCase.field, testCase.value);

      const context = createValidContext(formData);

      const response = await PATCH(context);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toEqual(testCase.error);
    }
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockRejectedValueOnce(new Error('Database error'));

    const context = createValidContext(validFormData);

    const response = await PATCH(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al actualizar el evento');
  })
})

describe('DELETE /events', async () => {
  const validFormData = new FormData();
  validFormData.append('id', '1');

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request(uri, {
        method: 'DELETE',
        body: formData
      })
    )
  }

  it('should delete an event', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(mockEvents[0]);
    vi.spyOn(EventRepository, 'deleteEventById').mockResolvedValueOnce();

    const context = createValidContext(validFormData);

    const response = await DELETE(context)
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toEqual('Evento eliminado correctamente');
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext();

    const response = await DELETE(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al eliminar el evento');
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData);
    formData.delete('id');

    const context = createValidContext(formData);

    const response = await DELETE(context)
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toEqual('El ID del evento es requerido');
  })

  it('should return an error if the event does not exist', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockResolvedValueOnce(null);

    const context = createValidContext(validFormData);

    const response = await DELETE(context)
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toEqual('No hay ningún evento con ese ID');
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(EventRepository, 'getEventById').mockRejectedValueOnce(new Error('Database error'));

    const context = createValidContext(validFormData);

    const response = await DELETE(context)
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toEqual('Error al eliminar el evento');
  })
})