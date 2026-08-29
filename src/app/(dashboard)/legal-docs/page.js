'use client';

import { useState } from 'react';
import { PageHeader, Empty } from '@/components/ui';

export default function LegalDocsPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'statute', date: '', reference: '', notes: '' });

  function save() {
    if (!form.title.trim()) return alert('⚠️ دخل عنوان الوثيقة!');
    setItems([{ id: Date.now(), ...form }, ...items]);
    setForm({ title: '', type: 'statute', date: '', reference: '', notes: '' });
    setShowForm(false);
  }

  function del(id) {
    if (!confirm('واش متأكد؟')) return;
    setItems(items.filter((x) => x.id !== id));
  }

  const typeL = {
    statute: 'النظام الأساسي',
    regulation: 'النظام الداخلي',
    contract: 'عقد',
    license: 'رخصة',
    other: 'أخرى',
  };

  return (
    <div>
      <PageHeader
        title="⚖️ الوثائق القانونية"
        count={items.length ? `${items.length} وثيقة` : ''}
        actions={<button className="btn btn-p" onClick={() => setShowForm(!showForm)}><i className="fas fa-plus" /> وثيقة جديدة</button>}
      />

      {showForm && (
        <div className="wc" style={{ borderTop: '4px solid #c9a227' }}>
          <h5 style={{ marginBottom: 16, color: '#c9a227' }}>➕ وثيقة قانونية</h5>
          <div className="row g-3">
            <div className="col-md-4"><div className="field"><label>العنوان *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>النوع</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="statute">النظام الأساسي</option>
                <option value="regulation">النظام الداخلي</option>
                <option value="contract">عقد</option>
                <option value="license">رخصة</option>
                <option value="other">أخرى</option>
              </select>
            </div></div>
            <div className="col-md-2"><div className="field"><label>التاريخ</label><input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>المرجع</label><input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div></div>
            <div className="col-md-12"><div className="field"><label>ملاحظات</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div></div>
            <div className="col-md-12" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-s" onClick={save}>💾 حفظ</button>
              <button className="btn btn-sec" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="wc table-wrap">
        <table className="ct">
          <thead><tr><th>#</th><th>العنوان</th><th>النوع</th><th>التاريخ</th><th>المرجع</th><th>ملاحظات</th><th>🗑️</th></tr></thead>
          <tbody>
            {items.length === 0 && <Empty colSpan={7} text="لا توجد وثائق قانونية" />}
            {items.map((x, i) => (
              <tr key={x.id}>
                <td>{i + 1}</td>
                <td>{x.title}</td>
                <td>{typeL[x.type] || x.type}</td>
                <td>{x.date || '—'}</td>
                <td>{x.reference || '—'}</td>
                <td>{x.notes || '—'}</td>
                <td><button className="btn btn-sec btn-sm" onClick={() => del(x.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
