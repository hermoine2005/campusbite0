const router = require('express').Router();
const mongoose = require('mongoose');
const Food = require('../models/FoodItem');
const { protect, adminOnly } = require('../middleware/auth');
const validId = (req, res, next) => mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid food id' });
const clean = b => {
  const o = {}; for (const k of ['name', 'description', 'category', 'price', 'stock', 'prepTime', 'emoji', 'imageUrl', 'active']) if (b[k] !== undefined) o[k] = b[k];
  return o;
};
router.get('/', async (req, res, next) => { try { res.json({ foods: await Food.find({ active: true }).sort('category name') }); } catch (e) { next(e); } });
router.get('/admin/all', protect, adminOnly, async (req, res, next) => { try { res.json({ foods: await Food.find().sort('category name') }); } catch (e) { next(e); } });
router.post('/', protect, adminOnly, async (req, res, next) => { try { res.status(201).json({ food: await Food.create(clean(req.body)) }); } catch (e) { next(e); } });
router.put('/:id', protect, adminOnly, validId, async (req, res, next) => {
  try {
    const f = await Food.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
    f ? res.json({ food: f }) : res.status(404).json({ message: 'Food not found' });
  } catch (e) { next(e); }
});
router.delete('/:id', protect, adminOnly, validId, async (req, res, next) => { // soft delete = deactivate
  try {
    const f = await Food.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    f ? res.json({ message: 'Item deactivated', food: f }) : res.status(404).json({ message: 'Food not found' });
  } catch (e) { next(e); }
});
module.exports = router;
