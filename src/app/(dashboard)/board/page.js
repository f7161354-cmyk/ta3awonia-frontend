'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Loading, Empty, Badge } from '@/components/ui';

const POSITIONS = ['رئيسة', 'نائبة الرئيسة', 'أمينة المال', 'الكاتبة', 'عضوة'];

function fmtDate(d) {
  if (!d) return '—';
  return String(d).slice(0, 10);
}

function posColor(pos) {
  const map = {
    رئيسة: '#8B4513',
    'نائبة الرئيسة': '#2e7d32',
    'أمينة المال': '#1565c0',
    الكاتبة: '#e65100',
    عضوة: '#5d4037',
  };
  return map[pos] || '#5d4037';
}

export default function BoardPage() {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    member_id: '',
    position: 'رئيسة',
    appointment_date: '',
    term_years: '3',
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    position: 'رئيسة',
    appointment_date: '',
    term_years: '3',
    is_active: true,
  });
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [board, mems] = await Promise.all([
        api.get('/api/board'),
        api.get('/api/members'),
      ]);
      setItems(board);
      setMembers(mems.filter((m) => m.is_active !== false));
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // أعضاء ما زالو ما فمجلس الإدارة
  const availableMembers = members.filter(
    (m) => !items.some((b) => b.member_id === m.id && (!editId || true))
  );

  async function save() {
    if (!form.member_id || !form.position || !form.appointment_date) {
      return setMsg('⚠️ اختار العضوة والصفة وتاريخ التعيين!');
    }
    try {
      await api.post('/api/board', {
        member_id: Number(form.member_id),
        position: form.position,
        appointment_date: form.appointment_date,
        term_years: parseInt(form.term_years, 10) || 3,
      });
      setMsg('✅ تزاد عضو مجلس الإدارة!');
      setForm({ member_id: '', position: 'رئيسة', appointment_date: '', term_years: '3' });
      setShowForm(false);
      load();
      setTimeout(() => setMsg(''), 2500);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  function openEdit(b) {
    setEditId(b.id);
    setEditForm({
      position: b.position || 'عضوة',
      appointment_date: b.appointment_date ? String(b.appointment_date).slice(0, 10) : '',
      term_years: String(b.term_years ?? 3),
      is_active: b.is_active !== false,
    });
  }

  async function doEdit() {
    try {
      await api.put(`/api/board/${editId}`, {
        position: editForm.position,
        appointment_date: editForm.appointment_date || null,
        term_years: parseInt(editForm.term_years, 10) || 3,
        is_active: editForm.is_active,
      });
      setEditId(null);
      load();
      setMsg('✅ تم التعديل');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  async function del(id) {
    if (!confirm('واش متأكد بغيتي تحيد هاد العضو من مجلس الإدارة؟')) return;
    try {
      await api.del(`/api/board/${id}`);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  return (
    <div>
      <PageHeader
        title="مجلس الإدارة"
        count={items.length ? `${items.length} عضو` : ''}
        actions={
          <button className="btn btn-p" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus" /> إضافة عضو
          </button>
        }
      />
      <p style={{ color: '#8B7355', fontSize: '0.9em', marginTop: -8, marginBottom: 16 }}>
        وفق المواد 19-28 من القانون 112.12
      </p>

      {msg && (
        <div className={`al ${msg.startsWith('✅') ? 'al-s' : 'al-d'}`} style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="wc table-wrap">
          <table className="ct">
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>الصفة</th>
                <th>تاريخ التعيين</th>
                <th>تاريخ انتهاء الولاية</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <Empty colSpan={7} text="لا يوجد أعضاء في مجلس الإدارة — زيد من سجل الأعضاء" />
              )}
              {items.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.full_name}</td>
                  <td>
                    <span style={{ color: posColor(b.position), fontWeight: 600 }}>{b.position}</span>
                  </td>
                  <td>{fmtDate(b.appointment_date)}</td>
                  <td>{fmtDate(b.term_end_date)}</td>
                  <td dir="ltr">{b.phone || '—'}</td>
                  <td>
                    {b.is_active !== false ? (
                      <Badge variant="success">سارية</Badge>
                    ) : (
                      <Badge variant="danger">منتهية</Badge>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-p btn-sm" onClick={() => openEdit(b)} title="تعديل">
                      ✏️
                    </button>{' '}
                    <button className="btn btn-d btn-sm" onClick={() => del(b.id)} title="حذف">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* فورم إضافة — بحال الصورة */}
      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: 14,
                left: 18,
                background: 'none',
                border: 'none',
                fontSize: '1.3em',
                cursor: 'pointer',
                color: '#999',
              }}
            >
              ✕
            </button>
            <div className="modal-title" style={{ color: '#8B7355' }}>
              👤 إضافة عضو مجلس إدارة
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="field">
                  <label>العضوة</label>
                  <select
                    className="input"
                    value={form.member_id}
                    onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  >
                    <option value="">اختر من الأعضاء</option>
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>الصفة</label>
                  <select
                    className="input"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>تاريخ التعيين</label>
                  <input
                    className="input"
                    type="date"
                    value={form.appointment_date}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>مدة الولاية (سنوات)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    value={form.term_years}
                    onChange={(e) => setForm({ ...form, term_years: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-12" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-sec" onClick={() => setShowForm(false)}>
                  إلغاء
                </button>
                <button className="btn btn-s" onClick={save}>
                  💾 حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تعديل */}
      {editId && (
        <div className="modal-overlay open" onClick={() => setEditId(null)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditId(null)}
              style={{
                position: 'absolute',
                top: 14,
                left: 18,
                background: 'none',
                border: 'none',
                fontSize: '1.3em',
                cursor: 'pointer',
                color: '#999',
              }}
            >
              ✕
            </button>
            <div className="modal-title" style={{ color: '#8B7355' }}>
              ✏️ تعديل عضو مجلس الإدارة
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="field">
                  <label>الصفة</label>
                  <select
                    className="input"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>مدة الولاية (سنوات)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    value={editForm.term_years}
                    onChange={(e) => setEditForm({ ...editForm, term_years: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>تاريخ التعيين</label>
                  <input
                    className="input"
                    type="date"
                    value={editForm.appointment_date}
                    onChange={(e) => setEditForm({ ...editForm, appointment_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="field">
                  <label>الحالة</label>
                  <select
                    className="input"
                    value={editForm.is_active ? '1' : '0'}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_active: e.target.value === '1' })
                    }
                  >
                    <option value="1">سارية</option>
                    <option value="0">منتهية</option>
                  </select>
                </div>
              </div>
              <div className="col-12" style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-s" onClick={doEdit}>
                  💾 حفظ
                </button>
                <button className="btn btn-sec" onClick={() => setEditId(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
