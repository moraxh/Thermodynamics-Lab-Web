import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

export const getFilename = (url) => fileURLToPath(url)
export const getDirname = (url) => dirname(getFilename(url))
