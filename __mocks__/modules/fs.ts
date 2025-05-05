import { vi } from "vitest"
import { PassThrough } from "node:stream"

const mkdirSync = vi.fn()

const createWriteStream = vi.fn(() => {
  const stream = new PassThrough()
  setTimeout(() => stream.emit('finish'), 10)
  return stream
})

export default {
  mkdirSync,
  createWriteStream,
}