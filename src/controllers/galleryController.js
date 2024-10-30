import { galleryModel } from '../models/galleryModel.js'

export class galleryController {
  static async getGallery (req, res) {
    res.json(await galleryModel.getGallery())
  }
}
