const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order'), Food = require('../models/FoodItem');
const { protect, adminOnly } = require('../middleware/auth');
router.use(protect);

const NEXT = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Preparing', 'Cancelled'], Preparing: ['Ready for Pickup'], 'Ready for Pickup': ['Completed'], Completed: [], Cancelled: [] };
const restock = o => Promise.all(o.items.map(i => Food.updateOne({ _id: i.food }, { $inc: { stock: i.qty } })));

router.post('/', async (req, res, next) => {
  const reserved = [];
  try {
    const { items, pickupTime, requestKey } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
    const pt = new Date(pickupTime), now = Date.now();
    if (isNaN(pt) || pt < now + 5 * 60000 || pt > now + 8 * 3600000) return res.status(400).json({ message: 'Pickup time must be 5 minutes to 8 hours from now' });
    if (requestKey) { const dup = await Order.findOne({ requestKey }); if (dup) return res.status(409).json({ message: 'Duplicate checkout request', order: dup }); }
    const lines = [];
    for (const it of items) {
      if (!mongoose.isValidObjectId(it.foodId)) throw Object.assign(new Error('Invalid food id'), { status: 400 });
      if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 10) throw Object.assign(new Error('Quantity must be 1-10'), { status: 400 });
      // atomic stock reservation; price is read from DB, never from client
      const f = await Food.findOneAndUpdate({ _id: it.foodId, active: true, stock: { $gte: it.qty } }, { $inc: { stock: -it.qty } }, { new: true });
      if (!f) throw Object.assign(new Error('An item is unavailable or out of stock'), { status: 409 });
      reserved.push({ food: f._id, qty: it.qty });
      lines.push({ food: f._id, name: f.name, price: f.price, qty: it.qty });
    }
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const orderNo = 'CB' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    const order = await Order.create({ orderNo, user: req.user._id, items: lines, total, pickupTime: pt, requestKey });
    res.status(201).json({ order });
  } catch (e) {
    await Promise.all(reserved.map(r => Food.updateOne({ _id: r.food }, { $inc: { stock: r.qty } })));
    next(e);
  }
});
router.get('/mine', async (req, res, next) => { try { res.json({ orders: await Order.find({ user: req.user._id }).sort('-createdAt') }); } catch (e) { next(e); } });

router.get('/admin/all', adminOnly, async (req, res, next) => { try { res.json({ orders: await Order.find().populate('user', 'name prn').sort('-createdAt') }); } catch (e) { next(e); } });
router.get('/admin/stats', adminOnly, async (req, res, next) => {
  try {
    const [byStatus, sales] = await Promise.all([
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }])
    ]);
    res.json({ byStatus, revenue: sales[0]?.revenue || 0, orders: sales[0]?.orders || 0 });
  } catch (e) { next(e); }
});
router.patch('/admin/:id/status', adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    const { status } = req.body;
    if (!NEXT[o.status].includes(status)) return res.status(400).json({ message: `Cannot change ${o.status} to ${status}` });
    if (status === 'Cancelled') await restock(o);
    o.status = status; await o.save(); res.json({ order: o });
  } catch (e) { next(e); }
});
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const o = await Order.findOne({ _id: req.params.id, user: req.user._id }); // can't touch others' orders
    if (!o) return res.status(404).json({ message: 'Order not found' });
    if (o.status !== 'Pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    await restock(o); o.status = 'Cancelled'; await o.save(); res.json({ order: o });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const o = await Order.findById(req.params.id);
    if (!o || (String(o.user) !== String(req.user._id) && req.user.role !== 'admin')) return res.status(404).json({ message: 'Order not found' });
    res.json({ order: o });
  } catch (e) { next(e); }
});
module.exports = router;
