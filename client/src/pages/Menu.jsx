import { useEffect, useState } from 'react';
import { api } from '../api';
import Thumb from '../components/Thumb.jsx';
const CATS = [['All', '🍽️'], ['Snacks', '🥟'], ['Meals', '🍛'], ['Fast Food', '🍔'], ['Beverages', '🥤'], ['Desserts', '🍮']];

export default function Menu({ addToCart, search }) {
  const [foods, setFoods] = useState([]);
  const [cat, setCat] = useState('All');
  const [err, setErr] = useState('');
  useEffect(() => { api('/food', { auth: false }).then(d => setFoods(d.foods)).catch(e => setErr(e.message)); }, []);
  const shown = foods.filter(f => (cat === 'All' || f.category === cat) && f.name.toLowerCase().includes(search.trim().toLowerCase()));
  return (<>
    <section className="banner">
      <div><h1>CampusBite</h1><p>Fresh food, less waiting</p>
        <div className="stats"><div><b>{foods.length}</b><span>Total items</span></div><div><b>{CATS.length - 1}</b><span>Categories</span></div><div><b>{foods.filter(f => f.stock > 0).length}</b><span>Available</span></div></div></div>
      <div className="banner-art">🍛</div>
    </section>
    <div className="cats">
      {CATS.map(([c, e]) => <button key={c} className={'cat' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}><span>{e}</span>{c}</button>)}
    </div>
    <h4 className="fw-bold my-3">Today's Menu</h4>
    {err && <div className="alert alert-danger">{err}. Is the server running?</div>}
    {!err && shown.length === 0 && <p className="text-muted">No dishes match your search.</p>}
    <div className="grid">
      {shown.map(f => (
        <div className={'card-food' + (f.stock < 1 ? ' off' : '')} key={f._id}>
          <Thumb food={f} size={96} />
          <h6 className="fw-bold mt-2 mb-0">{f.name}</h6>
          <p className="small text-muted mb-1">{f.description}</p>
          <p className="small mb-2">{f.stock < 1 ? <span className="text-danger">Out of stock</span> : <>⏱ {f.prepTime} min • {f.stock} left</>}</p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="price">₹{f.price}</span>
            <button className="plus" disabled={f.stock < 1} onClick={() => addToCart(f)} aria-label={'Add ' + f.name}>+</button>
          </div>
        </div>
      ))}
    </div>
  </>);
}
