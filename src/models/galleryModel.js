import fs from 'node:fs'
import { locpath } from '../../utils/locpath.js'

const galleryDir = locpath.public_('storage/gallery')

export class galleryModel {
  static async getGallery () {
    const imgs = []

    // Check if the directory exists
    if (!fs.existsSync(galleryDir)) return imgs

    // Get all files in the directory
    fs.readdirSync(galleryDir).forEach((file) => {
      imgs.push(galleryDir.replace('/app', '') + '/' + file)
    })

    return imgs
  }
}
