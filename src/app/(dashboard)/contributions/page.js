'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatCard, PageHeader, Loading, Empty } from '@/components/ui';

export default function ContributionsPage() {
  const [contribs, setContribs] = useState({ items: [], total: 0, count: 0, average: 0 });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ member_id: '', amount: '', type: 'monthly', notes: '' });
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([api.get('/api/contributions'), api.get('/api/members')]);
      setContribs(c);
      setMembers(m);
      if (!form.member_id && m.length) setForm((f) => ({ ...f, member_id: String(m[0].id) }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.member_id || !form.amount || parseFloat(form.amount) <= 0) return setMsg('⚠️ اختار العضو ودخل المبلغ!');
    try {
      await api.post('/api/contributions', { member_id: Number(form.member_id), amount: parseFloat(form.amount), type: form.type, notes: form.notes });
      setMsg('✅ تزادت المساهمة!');
      setForm({ ...form, amount: '', notes: '' });
      setShowForm(false);
      load();
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  if (loading) return <Loading />;

  const typeL = { monthly: '📅 شهرية', annual: '📆 سنوية', extra: '➕ إضافية' };

  return (
    <div>
      <PageHeader
        title="💰 المساهمات"
        count={contribs.count ? `${contribs.count} عملية` : ''}
        actions={<button className="btn btn-p" onClick={() => setShowForm(!showForm)}><i className="fas fa-plus" /> زيد مساهمة</button>}
      />

      {msg && <div className={`al ${msg.startsWith('✅') ? 'al-s' : 'al-d'}`} style={{ marginBottom: 12 }}>{msg}</div>}

      {showForm && (
        <div className="wc" style={{ borderTop: '4px solid #43e97b' }}>
          <h5 style={{ marginBottom: 16, color: '#43e97b' }}>➕ مساهمة جديدة</h5>
          <div className="row g-3">
            <div className="col-md-4"><div className="field"><label>العضو *</label>
              <select className="select" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}>
                {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div></div>
            <div className="col-md-2"><div className="field"><label>المبلغ د.م *</label><input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>النوع</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="monthly">📅 شهرية</option>
                <option value="annual">📆 سنوية</option>
                <option value="extra">➕ إضافية</option>
              </select>
            </div></div>
            <div className="col-md-3"><div className="field"><label>ملاحظات</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div></div>
            <div className="col-12" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-s" onClick={save}>💾 حفظ</button>
              <button className="btn btn-sec" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-4"><StatCard color="c-teal" icon="coins" label="مجموع المساهمات د.م" value={contribs.total.toFixed(2)} /></div>
        <div className="col-md-4"><StatCard color="c-blue" icon="list" label="عدد العمليات" value={contribs.count} /></div>
        <div className="col-md-4"><StatCard color="c-purple" icon="users" label="معدل المساهمة د.م" value={contribs.average.toFixed(2)} /></div>
      </div>

      <div className="wc table-wrap">
        <table className="ct">
          <thead><tr><th>#</th><th>العضو</th><th>المبلغ</th><th>النوع</th><th>التاريخ</th><th>ملاحظات</th></tr></thead>
          <tbody>
            {contribs.items.length === 0 && <Empty colSpan={6} text="لا توجد مساهمات" />}
            {contribs.items.map((c) => (
              <tr key={c.id}>
                <td><span className="bi">{c.id}</span></td>
                <td><strong>{c.member_name}</strong></td>
                <td><strong style={{ color: '#43e97b' }}>{c.amount} د.م</strong></td>
                <td><span className="bs">{typeL[c.type] || c.type}</span></td>
                <td style={{ color: '#999', fontSize: '0.83em' }}>{String(c.date).slice(0, 10)}</td>
                <td style={{ color: '#999', fontSize: '0.83em' }}>{c.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
