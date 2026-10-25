import { useEffect, useState } from 'react';
import { api } from '../api';
export default function Orders() {
  const [orders, setOrders] = useState(null); const [err, setErr] = useState('');
  const load = () => api('/orders/mine').then(d => setOrders(d.orders)).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  const cancel = id => api(`/orders/${id}/cancel`, { method: 'PATCH' }).then(load).catch(e => setErr(e.message));
  return (<div className="mt-3">
    <h4 className="fw-bold">My Orders</h4>
    {err && <div className="alert alert-danger">{err}</div>}
    {orders?.length === 0 && <p className="text-muted">No orders yet. Pick something from the menu.</p>}
    {orders?.map(o => (
      <div className="order" key={o._id}>
        <div className="d-flex justify-content-between flex-wrap gap-2"><b>{o.orderNo}</b><span className={'st st-' + o.status.split(' ')[0]}>{o.status}</span></div>
        <div className="small text-muted">{o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}</div>
        <div className="d-flex justify-content-between align-items-center mt-1"><span>₹{o.total} • Pickup {new Date(o.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {o.status === 'Pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(o._id)}>Cancel order</button>}</div>
      </div>))}
  </div>);
}
