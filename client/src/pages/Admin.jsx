import { useEffect, useState } from 'react';
import { api } from '../api';
const NEXT = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Preparing', 'Cancelled'], Preparing: ['Ready for Pickup'], 'Ready for Pickup': ['Completed'] };
const BLANK = { name: '', description: '', category: 'Snacks', price: '', stock: '', prepTime: 10, emoji: '🍽️', imageUrl: '' };

export default function Admin() {
  const [orders, setOrders] = useState([]), [foods, setFoods] = useState([]), [stats, setStats] = useState({});
  const [form, setForm] = useState(BLANK), [editing, setEditing] = useState(null), [err, setErr] = useState('');
  const load = async () => {
    try {
      const [o, f, s] = await Promise.all([api('/orders/admin/all'), api('/food/admin/all'), api('/orders/admin/stats')]);
      setOrders(o.orders); setFoods(f.foods); setStats(s);
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);
  const act = p => p.then(() => { setErr(''); return load(); }).catch(e => setErr(e.message));
  const save = e => {
    e.preventDefault();
    const body = { ...form, price: +form.price, stock: +form.stock, prepTime: +form.prepTime };
    delete body._id; delete body.__v; delete body.createdAt; delete body.updatedAt;
    act(editing ? api('/food/' + editing, { method: 'PUT', body }) : api('/food', { method: 'POST', body })).then(() => { setForm(BLANK); setEditing(null); });
  };
  const ch = e => setForm({ ...form, [e.target.name]: e.target.value });
  return (<div className="mt-3">
    <h4 className="fw-bold">Admin dashboard</h4>
    {err && <div className="alert alert-danger">{err}</div>}
    <div className="stats adminstats"><div><b>₹{stats.revenue ?? 0}</b><span>Sales (excl. cancelled)</span></div><div><b>{stats.orders ?? 0}</b><span>Orders</span></div>
      {stats.byStatus?.map(s => <div key={s._id}><b>{s.count}</b><span>{s._id}</span></div>)}</div>

    <h5 className="mt-4 fw-bold">Orders</h5>
    <div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Order</th><th>Student</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
      {orders.map(o => <tr key={o._id}><td>{o.orderNo}</td><td>{o.user?.name} ({o.user?.prn})</td><td>{o.items.map(i => `${i.name}×${i.qty}`).join(', ')}</td><td>₹{o.total}</td>
        <td>{NEXT[o.status] ? <select className="form-select form-select-sm" value="" onChange={e => e.target.value && act(api(`/orders/admin/${o._id}/status`, { method: 'PATCH', body: { status: e.target.value } }))}>
          <option value="">{o.status}</option>{NEXT[o.status].map(s => <option key={s}>{s}</option>)}</select> : o.status}</td></tr>)}</tbody></table></div>

    <h5 className="mt-4 fw-bold">{editing ? 'Edit food item' : 'Add food item'}</h5>
    <form className="row g-2" onSubmit={save}>
      <div className="col-md-3"><input className="form-control" name="name" placeholder="Name" value={form.name} onChange={ch} required /></div>
      <div className="col-md-3"><input className="form-control" name="description" placeholder="Description" value={form.description} onChange={ch} /></div>
      <div className="col-md-2"><select className="form-select" name="category" value={form.category} onChange={ch}>{['Snacks', 'Meals', 'Fast Food', 'Beverages', 'Desserts'].map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="col-md-1"><input className="form-control" name="price" type="number" min="1" placeholder="₹" value={form.price} onChange={ch} required /></div>
      <div className="col-md-1"><input className="form-control" name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={ch} required /></div>
      <div className="col-md-1"><input className="form-control" name="emoji" value={form.emoji} onChange={ch} /></div>
      <div className="col-md-1 d-grid"><button className="btn btn-warning fw-bold">{editing ? 'Save' : 'Add'}</button></div>
      <div className="col-12"><input className="form-control" name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={ch} /></div>
    </form>
    <div className="table-responsive mt-3"><table className="table table-sm align-middle"><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th></th></tr></thead><tbody>
      {foods.map(f => <tr key={f._id} className={f.active ? '' : 'text-muted'}><td>{f.emoji} {f.name}</td><td>{f.category}</td><td>₹{f.price}</td><td>{f.stock}</td><td>{f.active ? 'Yes' : 'No'}</td>
        <td className="text-end"><button className="btn btn-sm btn-outline-dark me-1" onClick={() => { setEditing(f._id); setForm({ ...BLANK, ...f }); window.scrollTo(0, 0); }}>Edit</button>
          {f.active ? <button className="btn btn-sm btn-outline-danger" onClick={() => act(api('/food/' + f._id, { method: 'DELETE' }))}>Deactivate</button>
            : <button className="btn btn-sm btn-outline-success" onClick={() => act(api('/food/' + f._id, { method: 'PUT', body: { active: true } }))}>Activate</button>}</td></tr>)}</tbody></table></div>
  </div>);
}
