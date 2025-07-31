import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  link: { type: String, default: '' },
  active: { type: Boolean, default: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;