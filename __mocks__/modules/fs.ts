import { vi } from 'vitest';
import { PassThrough } from "node:stream"

const mkdirSync = vi.fn()
const writeFileSync = vi.fn()
const existsSync = vi.fn().mockReturnValue(true)
const unlinkSync = vi.fn()
const rmdirSync = vi.fn()
const readdirSync = vi.fn().mockReturnValue([])
const copyFileSync = vi.fn()

const createWriteStream = vi.fn(() => {
  const stream = new PassThrough()
  setTimeout(() => stream.emit('finish'), 10)
  return stream
})

const rmSync = vi.fn()

export default {
  rmSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  rmdirSync,
  readdirSync,
  copyFileSync,
  createWriteStream,
}