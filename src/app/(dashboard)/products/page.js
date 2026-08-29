'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Loading, Empty, Badge } from '@/components/ui';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', unit: 'قطعة', buy_price: '', sell_price: '', stock_quantity: '0', min_stock: '5' });
  const [restock, setRestock] = useState({ product_id: '', quantity: '', new_buy_price: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', buy_price: '', sell_price: '', min_stock: '' });

  async function load() {
    setLoading(true);
    try {
      const data = await api.get('/api/products');
      setProducts(data);
      if (!restock.product_id && data.length) setRestock((r) => ({ ...r, product_id: String(data[0].id) }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim() || !form.buy_price || !form.sell_price) return alert('⚠️ دخل الاسم وثمن الشراء والبيع!');
    try {
      await api.post('/api/products', {
        ...form,
        buy_price: parseFloat(form.buy_price),
        sell_price: parseFloat(form.sell_price),
        stock_quantity: parseFloat(form.stock_quantity) || 0,
        min_stock: parseFloat(form.min_stock) || 5,
      });
      setForm({ name: '', description: '', category: '', unit: 'قطعة', buy_price: '', sell_price: '', stock_quantity: '0', min_stock: '5' });
      setShowForm(false);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  async function doRestock() {
    if (!restock.product_id || !restock.quantity || parseFloat(restock.quantity) <= 0) return alert('⚠️ اختار المنتج ودخل الكمية!');
    try {
      const data = await api.post(`/api/products/${restock.product_id}/restock`, {
        quantity: parseFloat(restock.quantity),
        new_buy_price: restock.new_buy_price ? parseFloat(restock.new_buy_price) : undefined,
      });
      alert(`✅ تجدّد المخزون!\nالكمية الجديدة: ${data.new_stock}`);
      setRestock({ product_id: restock.product_id, quantity: '', new_buy_price: '' });
      setShowRestock(false);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  function openEdit(p) {
    setEditId(p.id);
    setEditForm({ name: p.name, category: p.category || '', buy_price: String(p.buy_price), sell_price: String(p.sell_price), min_stock: String(p.min_stock) });
  }

  async function doEdit() {
    try {
      await api.put(`/api/products/${editId}`, {
        ...editForm,
        buy_price: parseFloat(editForm.buy_price),
        sell_price: parseFloat(editForm.sell_price),
        min_stock: parseFloat(editForm.min_stock) || 5,
      });
      setEditId(null);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  async function del(id) {
    if (!confirm('واش متأكد؟')) return;
    try {
      await api.del(`/api/products/${id}`);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  const totalStockValue = products.reduce((s, p) => s + Number(p.stock_quantity) * Number(p.buy_price), 0);

  return (
    <div>
      <PageHeader
        title="📦 المنتجات"
        count={products.length ? `${products.length} منتج` : ''}
        actions={
          <>
            <button className="btn btn-w" onClick={() => { setShowRestock(!showRestock); setShowForm(false); }}>
              <i className="fas fa-plus-circle" /> تجديد مخزون
            </button>
            <button className="btn btn-p" onClick={() => { setShowForm(!showForm); setShowRestock(false); }}>
              <i className="fas fa-plus" /> زيد منتج
            </button>
          </>
        }
      />

      {showForm && (
        <div className="wc" style={{ borderTop: '4px solid #4facfe' }}>
          <h5 style={{ marginBottom: 16, color: '#4facfe' }}>➕ منتج جديد</h5>
          <div className="row g-3">
            <div className="col-md-3"><div className="field"><label>اسم المنتج *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="زيت الزيتون - 1 لتر" /></div></div>
            <div className="col-md-2"><div className="field"><label>الفئة</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="زيوت" /></div></div>
            <div className="col-md-2"><div className="field"><label>الوحدة</label><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div></div>
            <div className="col-md-2"><div className="field"><label>ثمن الشراء *</label><input className="input" type="number" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} /></div></div>
            <div className="col-md-2"><div className="field"><label>ثمن البيع *</label><input className="input" type="number" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} /></div></div>
            <div className="col-md-2"><div className="field"><label>الكمية</label><input className="input" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div></div>
            <div className="col-md-2"><div className="field"><label>الحد الأدنى</label><input className="input" type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} /></div></div>
            <div className="col-md-3"><div className="field"><label>الوصف</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اختياري" /></div></div>
            <div className="col-md-5" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 12 }}>
              <button className="btn btn-s" onClick={save}>💾 حفظ</button>
              <button className="btn btn-sec" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showRestock && (
        <div className="wc" style={{ borderTop: '4px solid #fa8231' }}>
          <h5 style={{ marginBottom: 16, color: '#fa8231' }}>📦 تجديد المخزون</h5>
          <div className="row g-3">
            <div className="col-md-4"><div className="field"><label>المنتج</label>
              <select className="select" value={restock.product_id} onChange={(e) => setRestock({ ...restock, product_id: e.target.value })}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit})</option>
                ))}
              </select>
            </div></div>
            <div className="col-md-2"><div className="field"><label>الكمية المضافة *</label><input className="input" type="number" value={restock.quantity} onChange={(e) => setRestock({ ...restock, quantity: e.target.value })} /></div></div>
            <div className="col-md-2"><div className="field"><label>ثمن الشراء الجديد</label><input className="input" type="number" value={restock.new_buy_price} onChange={(e) => setRestock({ ...restock, new_buy_price: e.target.value })} /></div></div>
            <div className="col-md-4" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 12 }}>
              <button className="btn btn-w" onClick={doRestock}>📦 جدّد</button>
              <button className="btn btn-sec" onClick={() => setShowRestock(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="wc table-wrap">
        <table className="ct">
          <thead><tr><th>#</th><th>المنتج</th><th>الفئة</th><th>الوحدة</th><th>الشراء</th><th>البيع</th><th>الربح</th><th>هامش%</th><th>المخزون</th><th>قيمة المخزون</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {loading && <Empty colSpan={12} text="⏳ كيتحمّل..." />}
            {!loading && products.length === 0 && <Empty colSpan={12} text="لا توجد منتجات" />}
            {products.map((p) => {
              const profit = Number(p.sell_price) - Number(p.buy_price);
              const margin = p.sell_price > 0 ? ((profit / p.sell_price) * 100).toFixed(1) : 0;
              const sv = Number(p.stock_quantity) * Number(p.buy_price);
              return (
                <tr key={p.id}>
                  <td><span className="bi">{p.id}</span></td>
                  <td><strong>{p.name}</strong>{p.description && <br />}{p.description && <small style={{ color: '#999' }}>{p.description}</small>}</td>
                  <td>{p.category || '-'}</td>
                  <td><span className="bp">{p.unit}</span></td>
                  <td>{p.buy_price} د.م</td>
                  <td><strong>{p.sell_price} د.م</strong></td>
                  <td><span style={{ color: '#43e97b', fontWeight: 'bold' }}>+{profit.toFixed(2)} د.م</span></td>
                  <td><span className="bi">{margin}%</span></td>
                  <td><strong>{p.stock_quantity}</strong> {p.unit}</td>
                  <td style={{ color: '#4facfe', fontWeight: 'bold' }}>{sv.toFixed(2)} د.م</td>
                  <td>{p.low_stock ? <Badge variant="danger">⚠️ ناقص</Badge> : <Badge variant="success">✅ مزيان</Badge>}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-p btn-sm" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn btn-d btn-sm" onClick={() => del(p.id)}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {!loading && products.length > 0 && (
            <tfoot style={{ background: '#f8f9ff', fontWeight: 'bold' }}>
              <tr>
                <td colSpan={9} style={{ padding: '9px 13px', color: '#555' }}>الإجمالي</td>
                <td style={{ padding: '9px 13px', color: '#4facfe', fontWeight: 'bold' }}>{totalStockValue.toFixed(2)} د.م</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {editId && (
        <div className="modal-overlay open" onClick={() => setEditId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditId(null)} style={{ position: 'absolute', top: 14, left: 18, background: 'none', border: 'none', fontSize: '1.3em', cursor: 'pointer', color: '#999' }}>✕</button>
            <div className="modal-title">✏️ تعديل المنتج</div>
            <div className="row g-3">
              <div className="col-md-6"><div className="field"><label>الاسم</label><input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div></div>
              <div className="col-md-6"><div className="field"><label>الفئة</label><input className="input" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} /></div></div>
              <div className="col-md-4"><div className="field"><label>ثمن الشراء</label><input className="input" type="number" value={editForm.buy_price} onChange={(e) => setEditForm({ ...editForm, buy_price: e.target.value })} /></div></div>
              <div className="col-md-4"><div className="field"><label>ثمن البيع</label><input className="input" type="number" value={editForm.sell_price} onChange={(e) => setEditForm({ ...editForm, sell_price: e.target.value })} /></div></div>
              <div className="col-md-4"><div className="field"><label>الحد الأدنى</label><input className="input" type="number" value={editForm.min_stock} onChange={(e) => setEditForm({ ...editForm, min_stock: e.target.value })} /></div></div>
              <div className="col-12" style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-s" onClick={doEdit}>💾 حفظ</button>
                <button className="btn btn-sec" onClick={() => setEditId(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
