import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hash } from '@node-rs/argon2';
import { PATCH } from "@api/users"
import { GET as LoginGET, POST as LoginPOST } from "@api/login"
import { GET as LogoutGET, POST as LogoutPOST } from "@api/logout"
import { UserRepository } from '@src/repositories/UserRepository';
import { createMockContext } from '@__mocks__/utils';
import { passwordHashingOptions } from '@src/services/UserService';
import type { APIContext } from 'astro';
import type { UserSelect } from '@src/repositories/UserRepository';
import { lucia } from '@src/auth';

vi.mock('@src/repositories/UserRepository')
vi.mock('lucia', () => import('@__mocks__/modules/lucia'))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockUser: UserSelect = {
  id: '123',
  username: 'testuser',
  passwordHash: await hash('testpassword', passwordHashingOptions)
}

describe('PATCH /users', async() => {
  it('should update a user', async() => {
    vi.spyOn(UserRepository,  'updateUser').mockResolvedValue()

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'testpassword')
    formData.append('confirmPassword', 'testpassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/users', {
        method: 'PATCH',
        body: formData
      })
    )

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Usuario actualizado correctamente')
  })

  it('should return an error if the params are not given', async () => {
    vi.spyOn(UserRepository,  'updateUser').mockResolvedValue()

    const validFormData = new FormData()
    validFormData.append('username', 'testuser')
    validFormData.append('password', 'testpassword')
    validFormData.append('confirmPassword', 'testpassword')

    const testCases = {
      "username": "El nombre de usuario es requerido",
      "password": "La contraseña es requerida",
      "confirmPassword": "La confirmación de contraseña es requerida"
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }

      formData.delete(key)
      const context = createMockContext(
        new Request('http://localhost:3000/api/users', {
          method: 'PATCH',
          body: formData
        })
      )

      const response = await PATCH(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if the password and the password confirmation are not the same', async () => {
    vi.spyOn(UserRepository,  'updateUser').mockResolvedValue()

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'testpassword')
    formData.append('confirmPassword', 'notthesamepassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/users', {
        method: 'PATCH',
        body: formData
      })
    )

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("Las contraseñas no coinciden")
  })

  it('should return an error if the credentials are not valid', async () => {
    vi.spyOn(UserRepository,  'updateUser').mockResolvedValue()

    const validFormData = new FormData()
    validFormData.append('username', 'testuser')
    validFormData.append('password', 'testpassword')
    validFormData.append('confirmPassword', 'testpassword')

    const testCases = {
      "username": {
        "limits": [3, 255],
        "errorMessages": {
          "min": "El nombre de usuario debe tener al menos 3 caracteres de longitud",
          "max": "El nombre de usuario no puede tener mas de 255 caracteres de longitud"
        }
      },
      "password": {
        "limits": [5, 255],
        "errorMessages": {
          "min": "La contraseña debe tener al menos 5 caracteres de longitud",
          "max": "La contraseña no puede tener mas de 255 caracteres de longitud"
        }
      }
    }

    await Promise.all(Object.entries(testCases).map(async ([key, info]) => {
      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }

      // Min
      formData.set(key, 'a'.repeat(info.limits[0] - 1))
      formData.set('confirmPassword', formData.get('password') as string)
      var context = createMockContext(
        new Request('http://localhost:3000/api/users', {
          method: 'PATCH',
          body: formData
        })
      )

      var response = await PATCH(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toBe(info.errorMessages.min)

      // Max
      formData.set(key, 'a'.repeat(info.limits[1] + 1))
      formData.set('confirmPassword', formData.get('password') as string)
      var context = createMockContext(
        new Request('http://localhost:3000/api/users', {
          method: 'PATCH',
          body: formData
        })
      )

      var response = await PATCH(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(UserRepository,  'updateUser').mockRejectedValueOnce(new Error("Error"))

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'testpassword')
    formData.append('confirmPassword', 'testpassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/users', {
        method: 'PATCH',
        body: formData
      })
    )

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("No se pudo actualizar el usuario")
  })
})

describe('GET /login', async() => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to /login', async() => {
    const context = {
      redirect: vi.fn()
    } as unknown as APIContext

    await LoginGET(context)
    expect(context.redirect).toHaveBeenCalledWith('/login')
  })
})

describe('POST /login', async() => {
  it('should login a user', async() => {
    vi.spyOn(UserRepository, 'findUserByUsername').mockResolvedValueOnce(mockUser)

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'testpassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: formData
      })
    )

    const response = await LoginPOST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Usuario autenticado correctamente')
  })

  it('should return an error if the user or password is not given', async () => {
    vi.spyOn(UserRepository, 'findUserByUsername').mockResolvedValueOnce(mockUser)

    const validFormData = new FormData()
    validFormData.append('username', 'testuser')
    validFormData.append('password', 'testpassword')

    const testCases = {
      "username": "El nombre de usuario es requerido",
      "password": "La contraseña es requerida",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }

      formData.delete(key)
      const context = createMockContext(
        new Request('http://localhost:3000/api/login', {
          method: 'POST',
          body: formData
        })
      )

      const response = await LoginPOST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if user does not exist', async () => {
    vi.spyOn(UserRepository, 'findUserByUsername').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'testpassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: formData
      })
    )

    const response = await LoginPOST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("El usuario o la contraseña no son correctos")
  })

  it('should return an error if password is incorrect', async () => {
    vi.spyOn(UserRepository, 'findUserByUsername').mockResolvedValueOnce(mockUser)

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'notthesamepassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: formData
      })
    )

    const response = await LoginPOST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("El usuario o la contraseña no son correctos")
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(UserRepository, 'findUserByUsername').mockRejectedValueOnce(new Error("Error"))

    const formData = new FormData()
    formData.append('username', 'testuser')
    formData.append('password', 'notthesamepassword')

    const context = createMockContext(
      new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: formData
      })
    )

    const response = await LoginPOST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("No se pudo iniciar sesión")
  })
})

describe('GET /logout', async() => {
  it('should redirect to /login', async() => {
    const context = {
      redirect: vi.fn()
    } as unknown as APIContext

    await LogoutGET(context)
    expect(context.redirect).toHaveBeenCalledWith('/login')
  })
})

describe('POST /logout', async() => {
  it('should logout a user', async () => {
    const context = createMockContext(
      new Request('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'auth_session': 'session-id'
        }
      })
    )
    context.cookies.set('auth_session', 'session-id')

    const response = await LogoutPOST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe("Sesión cerrada correctamente")
  })

  it('should return an error if the auth session is not given', async () => {
    const context = createMockContext(
      new Request('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'auth_session': 'session-id'
        }
      })
    )

    const response = await LogoutPOST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("No se encontró la sesión")
  })

  it('should return an error if the auth session is not found', async () => {
    vi.spyOn(lucia, 'validateSession').mockResolvedValueOnce({ user: null, session: null })

    const context = createMockContext(
      new Request('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'auth_session': 'session-id'
        }
      })
    )
    context.cookies.set('auth_session', 'session-id')

    const response = await LogoutPOST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("La sesión no es válida")
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(lucia, 'validateSession').mockRejectedValueOnce(new Error("Error"))

    const context = createMockContext(
      new Request('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'auth_session': 'session-id'
        }
      })
    )
    context.cookies.set('auth_session', 'session-id')

    const response = await LogoutPOST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("No se pudo cerrar sesión")
  })
})