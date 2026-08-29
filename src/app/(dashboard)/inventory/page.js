'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Loading, Empty } from '@/components/ui';

export default function InventoryPage() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counting, setCounting] = useState(false);
  const [notes, setNotes] = useState('');
  const [actuals, setActuals] = useState({});

  async function load() {
    setLoading(true);
    try {
      const [h, p] = await Promise.all([api.get('/api/inventory/checks'), api.get('/api/products')]);
      setHistory(h);
      setProducts(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function start() {
    const map = {};
    products.forEach((p) => (map[p.id] = p.stock_quantity));
    setActuals(map);
    setNotes('');
    setCounting(true);
  }

  async function save() {
    if (!confirm('غادي تحدّث المخزون بالكميات الحقيقية. واش متأكد؟')) return;
    try {
      const r = await api.post('/api/inventory/check', {
        notes,
        items: products.map((p) => ({ product_id: p.id, actual_quantity: parseFloat(actuals[p.id]) || 0 })),
      });
      alert(`✅ ${r.message}`);
      setCounting(false);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="📦 الجرد"
        count="عدّ المخزون الحقيقي وقارنه مع السيستم"
        actions={<button className="btn btn-p" onClick={start}><i className="fas fa-clipboard-check" /> ابدأ جرد جديد</button>}
      />

      {counting && (
        <div className="wc">
          <div className="wc-head">
            <div className="wc-title">📋 جرد جديد - دخّل الكميات الحقيقية</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-s" onClick={save}>✅ احفظ وحدّث المخزون</button>
              <button className="btn btn-sec" onClick={() => setCounting(false)}>إلغاء</button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">ملاحظات</label>
            <input className="input" style={{ maxWidth: 400 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: جرد شهر يونيو 2024" />
          </div>
          <div className="table-wrap">
            <table className="ct">
              <thead><tr><th>المنتج</th><th>الوحدة</th><th>كمية السيستم</th><th>الكمية الحقيقية</th><th>الفرق</th></tr></thead>
              <tbody>
                {products.map((p) => {
                  const expected = Number(p.stock_quantity);
                  const actual = parseFloat(actuals[p.id]) || 0;
                  const diff = actual - expected;
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="bp">{p.unit}</span></td>
                      <td><span className="bi">{expected}</span></td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          style={{ maxWidth: 120 }}
                          value={actuals[p.id] ?? ''}
                          min="0"
                          step="0.1"
                          onChange={(e) => setActuals({ ...actuals, [p.id]: e.target.value })}
                        />
                      </td>
                      <td style={{ fontWeight: 'bold', color: diff === 0 ? '#999' : diff > 0 ? '#43e97b' : '#f5576c' }}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="wc table-wrap">
        <div className="wc-head"><div className="wc-title">📚 سجل الجرود السابقة</div></div>
        <table className="ct">
          <thead><tr><th>#</th><th>التاريخ</th><th>عدد المنتجات</th><th>الملاحظات</th></tr></thead>
          <tbody>
            {history.length === 0 && <Empty colSpan={4} text="لا يوجد جرد سابق" />}
            {history.map((c) => (
              <tr key={c.id}>
                <td><span className="bi">{c.id}</span></td>
                <td>{String(c.date).slice(0, 10)}</td>
                <td><span className="bs">{c.items_count} منتج</span></td>
                <td style={{ color: '#999' }}>{c.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
