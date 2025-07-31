// routes/bannerRoutes.js
import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const banners = await Banner.find({ active: true });
  res.json(banners);
});

export default router;