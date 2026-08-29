'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatCard, PageHeader, Loading, Empty } from '@/components/ui';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: 'rent' });

  async function load() {
    setLoading(true);
    try {
      const d = await api.get('/api/expenses');
      setExpenses(d.items);
      setTotal(d.total);
      setCats(d.by_category || {});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.description.trim() || !form.amount || parseFloat(form.amount) <= 0) return alert('⚠️ دخل الوصف والمبلغ!');
    try {
      await api.post('/api/expenses', { description: form.description, amount: parseFloat(form.amount), category: form.category });
      setForm({ description: '', amount: '', category: 'rent' });
      setShowForm(false);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  async function del(id) {
    if (!confirm('واش متأكد؟')) return;
    try {
      await api.del(`/api/expenses/${id}`);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  if (loading) return <Loading />;

  const catL = { rent: '🏠 الكراء', utilities: '💡 الكهرباء/الماء', transport: '🚗 التنقل', maintenance: '🔧 الصيانة', salary: '👤 الأجور', other: '📦 أخرى' };
  const catLabel = (c) => catL[c] || c;

  return (
    <div>
      <PageHeader
        title="💸 المصاريف"
        count={expenses.length ? `${expenses.length} مصروف` : ''}
        actions={<button className="btn btn-p" onClick={() => setShowForm(!showForm)}><i className="fas fa-plus" /> زيد مصروف</button>}
      />

      {showForm && (
        <div className="wc" style={{ borderTop: '4px solid #f5576c' }}>
          <h5 style={{ marginBottom: 16, color: '#f5576c' }}>➕ مصروف جديد</h5>
          <div className="row g-3">
            <div className="col-md-4"><div className="field"><label>الوصف *</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="كراء المحل" /></div></div>
            <div className="col-md-2"><div className="field"><label>المبلغ *</label><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>الفئة</label>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="rent">🏠 الكراء</option>
                <option value="utilities">💡 الكهرباء/الماء</option>
                <option value="transport">🚗 التنقل</option>
                <option value="maintenance">🔧 الصيانة</option>
                <option value="salary">👤 الأجور</option>
                <option value="other">📦 أخرى</option>
              </select>
            </div></div>
            <div className="col-md-3" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 12 }}>
              <button className="btn btn-s" onClick={save}>💾 حفظ</button>
              <button className="btn btn-sec" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-3"><StatCard color="c-red" icon="wallet" label="المجموع د.م" value={total.toFixed(2)} /></div>
        <div className="col-md-3"><StatCard color="c-orange" icon="house" label="الكراء د.م" value={(cats.rent || 0).toFixed(2)} /></div>
        <div className="col-md-3"><StatCard color="c-purple" icon="bolt" label="كهرباء/ماء د.م" value={(cats.utilities || 0).toFixed(2)} /></div>
        <div className="col-md-3"><StatCard color="c-dark" icon="box" label="أخرى د.م" value={(cats.other || 0).toFixed(2)} /></div>
      </div>

      <div className="wc table-wrap">
        <table className="ct">
          <thead><tr><th>#</th><th>الوصف</th><th>المبلغ</th><th>الفئة</th><th>التاريخ</th><th>🗑️</th></tr></thead>
          <tbody>
            {expenses.length === 0 && <Empty colSpan={6} text="لا توجد مصاريف" />}
            {expenses.map((e) => (
              <tr key={e.id}>
                <td><span className="bi">{e.id}</span></td>
                <td><strong>{e.description}</strong></td>
                <td><strong style={{ color: '#f5576c' }}>{e.amount} د.م</strong></td>
                <td><span className="bw">{catLabel(e.category)}</span></td>
                <td style={{ color: '#999', fontSize: '0.83em' }}>{String(e.date).slice(0, 10)}</td>
                <td><button className="btn btn-d btn-sm" onClick={() => del(e.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
