import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function useForm(initial, path, onAuth, check) {
  const [f, setF] = useState(initial); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const change = e => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); const v = check(f); if (v) return setErr(v);
    setBusy(true); setErr('');
    try { const d = await api(path, { method: 'POST', body: f, auth: false }); onAuth(d.token, d.user); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return { f, change, submit, err, busy };
}
const Field = ({ label, ...p }) => <div className="mb-2"><label className="form-label small mb-1">{label}</label><input className="form-control" {...p} /></div>;

export function Login({ onAuth }) {
  const { f, change, submit, err, busy } = useForm({ email: '', password: '' }, '/auth/login', onAuth, f => !/^\S+@\S+\.\S+$/.test(f.email) ? 'Enter a valid email' : !f.password ? 'Enter your password' : '');
  return (
    <form className="authbox" onSubmit={submit} noValidate>
      <h3 className="fw-bold">Welcome back</h3>
      <Field label="Email" name="email" type="email" value={f.email} onChange={change} />
      <Field label="Password" name="password" type="password" value={f.password} onChange={change} />
      {err && <div className="alert alert-danger py-1 small">{err}</div>}
      <button className="btn btn-warning w-100 fw-bold" disabled={busy}>Login</button>
      <p className="small mt-3 mb-0">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
export function Register({ onAuth }) {
  const check = f => {
    if (Object.values(f).some(v => !String(v).trim())) return 'All fields are required';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return 'Enter a valid email';
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) return 'Password needs 8+ characters with a letter and a number';
    return '';
  };
  const { f, change, submit, err, busy } = useForm({ name: '', email: '', prn: '', department: '', year: '3', password: '' }, '/auth/register', onAuth, check);
  return (
    <form className="authbox" onSubmit={submit} noValidate>
      <h3 className="fw-bold">Create student account</h3>
      <Field label="Full name" name="name" value={f.name} onChange={change} />
      <Field label="Email" name="email" type="email" value={f.email} onChange={change} />
      <Field label="PRN" name="prn" value={f.prn} onChange={change} />
      <Field label="Department" name="department" value={f.department} onChange={change} />
      <div className="mb-2"><label className="form-label small mb-1">Year</label>
        <select className="form-select" name="year" value={f.year} onChange={change}>{[1, 2, 3, 4].map(y => <option key={y}>{y}</option>)}</select></div>
      <Field label="Password" name="password" type="password" value={f.password} onChange={change} />
      {err && <div className="alert alert-danger py-1 small">{err}</div>}
      <button className="btn btn-warning w-100 fw-bold" disabled={busy}>Register</button>
      <p className="small mt-3 mb-0">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
