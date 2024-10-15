import path from 'node:path'
import { getDirname } from './dirname.js'

const __dirname = getDirname(import.meta.url)

const view = (_path) => path.join(__dirname, '../src/views', _path)
const controller = (_path) => path.join(__dirname, '../src/controllers', _path)
const model = (_path) => path.join(__dirname, '../src/models', _path)
const util = (_path) => path.join(__dirname, '../src/utils', _path)
const public_ = (_path) => path.join(__dirname, '../public', _path)

export const locpath = {
  view,
  controller,
  model,
  util,
  public_
}
