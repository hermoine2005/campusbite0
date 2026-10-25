import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Thumb from './Thumb.jsx';

const SLOTS = [15, 30, 45, 60, 90];
export default function Cart({ cart, setCart, user, open, close, notify }) {
  const nav = useNavigate();
  const [mins, setMins] = useState(30);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const setQty = (id, d) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.qty + d, i.max, 10)) } : i));
  const remove = id => setCart(c => c.filter(i => i.id !== id));

  const checkout = async () => {
    if (!user) { close(); return nav('/login'); }
    setBusy(true); setErr('');
    try {
      const { order } = await api('/orders', { method: 'POST', body: {
        items: cart.map(i => ({ foodId: i.id, qty: i.qty })),
        pickupTime: new Date(Date.now() + mins * 60000).toISOString(),
        requestKey: user.id + '-' + Date.now()
      } });
      setDone(order); setCart([]); notify('Order placed!');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <aside className={'cart' + (open ? ' open' : '')}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold">My Cart</h5>
        <button className="btn-close d-lg-none" onClick={close} aria-label="Close cart" />
      </div>
      {done ? (
        <div className="text-center my-4">
          <div style={{ fontSize: 48 }}>✅</div>
          <h6 className="fw-bold">Order confirmed</h6>
          <p className="mb-1">Order no: <b>{done.orderNo}</b></p>
          <p className="small text-muted">Total ₹{done.total} • Pay cash at pickup</p>
          <button className="btn btn-warning btn-sm" onClick={() => { setDone(null); nav('/orders'); close(); }}>Track order</button>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center text-muted my-5"><div style={{ fontSize: 52 }}>🛒</div><p className="mt-2">Your cart is empty.<br />Add something tasty!</p></div>
      ) : (<>
        <div className="cart-list">
          {cart.map(i => (
            <div className="cart-row" key={i.id}>
              <Thumb food={i} size={46} />
              <div className="flex-grow-1">
                <div className="fw-semibold small">{i.name}</div>
                <div className="qty">
                  <button onClick={() => setQty(i.id, -1)} aria-label="Decrease">−</button><span>{i.qty}</span><button onClick={() => setQty(i.id, 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="text-end"><div className="fw-bold">₹{i.price * i.qty}</div><button className="rm" onClick={() => remove(i.id)} aria-label="Remove">🗑</button></div>
            </div>
          ))}
        </div>
        <label className="small text-muted mt-3">Pickup time</label>
        <select className="form-select form-select-sm mb-3" value={mins} onChange={e => setMins(+e.target.value)}>
          {SLOTS.map(m => <option key={m} value={m}>In {m} minutes</option>)}
        </select>
        <div className="summary"><div className="d-flex justify-content-between"><span>Subtotal</span><span>₹{total}</span></div>
          <div className="d-flex justify-content-between"><span>Payment</span><span>Cash at Pickup</span></div>
          <hr className="my-2" /><div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{total}</span></div></div>
        {err && <div className="alert alert-danger py-1 small mt-2">{err}</div>}
        <button className="btn-checkout" disabled={busy} onClick={checkout}>{busy ? 'Placing order…' : 'Checkout'}</button>
      </>)}
    </aside>
  );
}
