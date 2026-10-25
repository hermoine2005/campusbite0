require('dotenv').config();
const bcrypt = require('bcryptjs'), mongoose = require('mongoose');
const User = require('./models/User'), Food = require('./models/FoodItem');
const foods = [
 ['Veg Sandwich','Grilled with mint chutney','Snacks',50,40,8,'🥪'],['Vada Pav','Mumbai street classic','Snacks',25,60,5,'🍔'],
 ['Samosa','Crispy aloo samosa (2 pcs)','Snacks',30,50,5,'🥟'],['Masala Dosa','With sambar and chutney','Meals',70,30,12,'🫓'],
 ['Veg Thali','Roti, sabzi, dal, rice','Meals',110,25,15,'🍛'],['Veg Pizza','Cheesy 7-inch pizza','Fast Food',120,20,15,'🍕'],
 ['Veg Burger','Crunchy patty burger','Fast Food',80,30,10,'🍔'],['French Fries','Salted and crisp','Fast Food',60,40,8,'🍟'],
 ['Paneer Wrap','Spicy paneer roll','Fast Food',90,25,10,'🌯'],['Tea','Hot masala chai','Beverages',15,100,3,'🍵'],
 ['Cold Coffee','Thick and chilled','Beverages',55,40,5,'🥤'],['Fresh Juice','Seasonal fruit juice','Beverages',45,0,5,'🧃'],
 ['Gulab Jamun','Two warm pieces','Desserts',35,30,3,'🍮']
].map(([name,description,category,price,stock,prepTime,emoji]) => ({ name,description,category,price,stock,prepTime,emoji }));
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Food.deleteMany({}); await Food.insertMany(foods);
  const email = process.env.ADMIN_EMAIL || 'admin@campusbite.com';
  if (!(await User.findOne({ email })))
    await User.create({ name: 'Canteen Admin', email, prn: 'ADMIN001', department: 'Canteen', year: 1, role: 'admin', password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10) });
  console.log('Seeded', foods.length, 'foods + admin', email); process.exit(0);
})();
