'use client';

import { useState } from 'react';
import { PageHeader, Empty } from '@/components/ui';

export default function MandatoryRecordsPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'members', period: '', status: 'up_to_date', notes: '' });

  function save() {
    if (!form.title.trim()) return alert('⚠️ دخل عنوان السجل!');
    setItems([{ id: Date.now(), ...form }, ...items]);
    setForm({ title: '', type: 'members', period: '', status: 'up_to_date', notes: '' });
    setShowForm(false);
  }

  function del(id) {
    if (!confirm('واش متأكد؟')) return;
    setItems(items.filter((x) => x.id !== id));
  }

  const typeL = {
    members: 'سجل الأعضاء',
    minutes: 'محاضر الاجتماعات',
    accounts: 'السجلات المحاسبية',
    inventory: 'سجل الجرد',
    other: 'أخرى',
  };
  const statusL = { up_to_date: '✅ محدّث', pending: '⏳ يحتاج تحديث', missing: '❌ ناقص' };

  return (
    <div>
      <PageHeader
        title="📚 السجلات الإلزامية"
        count={items.length ? `${items.length} سجل` : ''}
        actions={<button className="btn btn-p" onClick={() => setShowForm(!showForm)}><i className="fas fa-plus" /> سجل جديد</button>}
      />

      {showForm && (
        <div className="wc" style={{ borderTop: '4px solid #c9a227' }}>
          <h5 style={{ marginBottom: 16, color: '#c9a227' }}>➕ سجل إلزامي</h5>
          <div className="row g-3">
            <div className="col-md-4"><div className="field"><label>العنوان *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>النوع</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="members">سجل الأعضاء</option>
                <option value="minutes">محاضر الاجتماعات</option>
                <option value="accounts">السجلات المحاسبية</option>
                <option value="inventory">سجل الجرد</option>
                <option value="other">أخرى</option>
              </select>
            </div></div>
            <div className="col-md-2"><div className="field"><label>الفترة</label><input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="2026" /></div></div>
            <div className="col-md-3"><div className="field"><label>الحالة</label>
              <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="up_to_date">محدّث</option>
                <option value="pending">يحتاج تحديث</option>
                <option value="missing">ناقص</option>
              </select>
            </div></div>
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
          <thead><tr><th>#</th><th>العنوان</th><th>النوع</th><th>الفترة</th><th>الحالة</th><th>ملاحظات</th><th>🗑️</th></tr></thead>
          <tbody>
            {items.length === 0 && <Empty colSpan={7} text="لا توجد سجلات إلزامية" />}
            {items.map((x, i) => (
              <tr key={x.id}>
                <td>{i + 1}</td>
                <td>{x.title}</td>
                <td>{typeL[x.type] || x.type}</td>
                <td>{x.period || '—'}</td>
                <td>{statusL[x.status] || x.status}</td>
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
