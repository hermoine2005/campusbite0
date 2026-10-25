import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Menu from './pages/Menu.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';
import Cart from './components/Cart.jsx';

export default function App() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [drawer, setDrawer] = useState(false);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 1800); };
  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); nav(u.role === 'admin' ? '/admin' : '/'); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setCart([]); nav('/login'); };
  const addToCart = f => {
    if (f.stock < 1) return notify('Item is out of stock');
    setCart(c => {
      const ex = c.find(i => i.id === f._id);
      if (ex) return c.map(i => i.id === f._id ? { ...i, qty: Math.min(i.qty + 1, i.max, 10) } : i);
      return [...c, { id: f._id, name: f.name, price: f.price, emoji: f.emoji, imageUrl: f.imageUrl, max: f.stock, qty: 1 }];
    });
    notify(f.name + ' added to cart');
  };
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const showCart = !['/login', '/register', '/admin'].some(p => pathname.startsWith(p));

  return (
    <div className="page"><div className="shell">
      <div className="main">
        <header className="topbar">
          <Link to="/" className="burger" aria-label="Home">☰</Link>
          <input className="form-control searchbar" placeholder="🔍  Search food..." value={search} onChange={e => { setSearch(e.target.value); nav('/'); }} aria-label="Search" />
          {user ? (<>
            <Link to="/orders" className="avatar" title="My orders">{user.name[0]}</Link>
            {user.role === 'admin' && <Link to="/admin" className="btn btn-sm btn-outline-dark">Admin</Link>}
            <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
          </>) : <Link to="/login" className="btn btn-sm btn-warning">Login</Link>}
          <button className="basket" onClick={() => setDrawer(true)} aria-label="Open cart">🛒<span className="badge-green">{count}</span></button>
        </header>
        <div className="crumb">Store • CampusBite</div>
        <Routes>
          <Route path="/" element={<Menu addToCart={addToCart} search={search} />} />
          <Route path="/login" element={<Login onAuth={login} />} />
          <Route path="/register" element={<Register onAuth={login} />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {showCart && <Cart cart={cart} setCart={setCart} user={user} open={drawer} close={() => setDrawer(false)} notify={notify} />}
    </div>{toast && <div className="toast-msg">{toast}</div>}</div>
  );
}
