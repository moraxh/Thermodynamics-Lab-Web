import fs from "node:fs"
import crypto from "node:crypto"

export const generateHashFromFile = (path: string) => new Promise((resolve, reject) => {
  const hash = crypto.createHash('sha1')
  const rs = fs.createReadStream(path)
  rs.on("error", reject)
  rs.on("data", chunk => hash.update(chunk))
  rs.on("end", () => resolve(hash.digest('hex')))
})