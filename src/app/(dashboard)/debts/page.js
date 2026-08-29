'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatCard, Loading, Empty } from '@/components/ui';

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmounts, setPayAmounts] = useState({});

  async function load() {
    setLoading(true);
    try {
      setDebts(await api.get('/api/debts'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalRemaining = debts.reduce((s, d) => s + Number(d.remaining), 0);
  const totalPaid = debts.reduce((s, d) => s + Number(d.paid_amount), 0);

  async function pay(id) {
    const amount = parseFloat(payAmounts[id]);
    if (!amount || amount <= 0) return alert('⚠️ دخل المبلغ!');
    try {
      const r = await api.post(`/api/debts/${id}/pay`, { amount });
      if (Number(r.remaining) <= 0) alert('🎉 تسدّد الدين كامل!');
      else alert(`✅ ${r.message}\n💳 الباقي: ${r.remaining} د.م`);
      load();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="row g-3 mb-3">
        <div className="col-md-4"><StatCard color="c-pink" icon="credit-card" label="مجموع الديون د.م" value={totalRemaining.toFixed(2)} /></div>
        <div className="col-md-4"><StatCard color="c-orange" icon="list" label="عدد الديون" value={debts.length} /></div>
        <div className="col-md-4"><StatCard color="c-green" icon="check" label="ما تخلص د.م" value={totalPaid.toFixed(2)} /></div>
      </div>

      <div className="wc table-wrap">
        <table className="ct">
          <thead><tr><th>#</th><th>العضو</th><th>الدين الكلي</th><th>تخلّص</th><th>الباقي</th><th>نسبة الأداء</th><th>خلّص</th></tr></thead>
          <tbody>
            {debts.length === 0 && <Empty colSpan={7} text="🎉 ماكاين حتى دين!" />}
            {debts.map((d) => {
              const pct = d.total_debt > 0 ? Math.min(100, (d.paid_amount / d.total_debt) * 100).toFixed(0) : 0;
              const col = pct < 30 ? '#f5576c' : pct < 70 ? '#ffc107' : '#43e97b';
              return (
                <tr key={d.id}>
                  <td><span className="bi">{d.id}</span></td>
                  <td><strong>{d.member_name}</strong></td>
                  <td>{d.total_debt} د.م</td>
                  <td style={{ color: '#43e97b' }}>{d.paid_amount} د.م</td>
                  <td><strong style={{ color: '#f5576c' }}>{d.remaining} د.م</strong></td>
                  <td style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="prog"><div className="prog-bar" style={{ width: `${pct}%`, background: col }} /></div>
                      <small>{pct}%</small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        className="input"
                        type="number"
                        style={{ width: 90 }}
                        placeholder="د.م"
                        value={payAmounts[d.id] || ''}
                        onChange={(e) => setPayAmounts({ ...payAmounts, [d.id]: e.target.value })}
                      />
                      <button className="btn btn-s btn-sm" onClick={() => pay(d.id)}>💰</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
