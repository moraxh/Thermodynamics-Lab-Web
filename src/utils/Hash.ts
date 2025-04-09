import fs from "node:fs"
import crypto from "node:crypto"

export const generateHashFromFile = (path: string) => new Promise((resolve, reject) => {
  const hash = crypto.createHash('sha1')
  const rs = fs.createReadStream(path)
  rs.on("error", reject)
  rs.on("data", chunk => hash.update(chunk))
  rs.on("end", () => resolve(hash.digest('hex')))
})

export const generateHashFromStream = (stream: ReadableStream<Uint8Array>) => new Promise((resolve, reject) => {
  const hash = crypto.createHash('sha1')
  const rs = stream.getReader()
  rs.read().then(function processText({ done, value }) {
    if (done) {
      return resolve(hash.digest('hex'))
    }
    hash.update(value)
    rs.read().then(processText).catch(reject)
  })
})