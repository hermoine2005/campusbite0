const router = require('express').Router();
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, prn: u.prn, role: u.role });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, prn, department, year, password } = req.body;
    if (![name, email, prn, department, year, password].every(Boolean)) return res.status(400).json({ message: 'All fields are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (!/^[A-Za-z0-9]{6,15}$/.test(prn)) return res.status(400).json({ message: 'PRN must be 6-15 letters/digits' });
    if (!(Number(year) >= 1 && Number(year) <= 4)) return res.status(400).json({ message: 'Year must be 1-4' });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ message: 'Password needs 8+ characters with a letter and a number' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    if (await User.findOne({ prn })) return res.status(409).json({ message: 'PRN already registered' });
    const u = await User.create({ name, email, prn, department, year, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(u), user: pub(u) });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const u = await User.findOne({ email: String(email).toLowerCase() });
    if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ message: 'Incorrect email or password' });
    res.json({ token: sign(u), user: pub(u) });
  } catch (e) { next(e); }
});
router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));
module.exports = router;
