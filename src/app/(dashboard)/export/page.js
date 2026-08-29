'use client';

import { useEffect, useState } from 'react';
import { api, downloadCsv } from '@/lib/api';
import { Loading } from '@/components/ui';

const EXPORTS = [
  { key: 'members', icon: '👥', title: 'الأعضاء', desc: 'تصدير قائمة كاع الأعضاء', file: 'members.csv' },
  { key: 'products', icon: '📦', title: 'المنتجات', desc: 'تصدير المنتجات والمخزون', file: 'products.csv' },
  { key: 'sales', icon: '🧾', title: 'المبيعات', desc: 'تصدير كاع عمليات البيع', file: 'sales.csv' },
  { key: 'debts', icon: '💳', title: 'الديون', desc: 'تصدير قائمة الديون', file: 'debts.csv' },
];

export default function ExportPage() {
  const [sales, setSales] = useState([]);
  const [saleId, setSaleId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/sales?limit=200')
      .then((s) => {
        setSales(s);
        if (s.length) setSaleId(String(s[0].id));
      })
      .finally(() => setLoading(false));
  }, []);

  async function doExport(key, file) {
    try {
      await downloadCsv(`/api/export/${key}`, file);
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  }

  function printInvoice() {
    if (!saleId) return alert('⚠️ اختار فاتورة!');
    api
      .get(`/api/sales/${saleId}`)
      .then((s) => {
        const dt = new Date(s.sale_date);
        const dateStr = dt.toLocaleDateString('ar-MA') + ' - ' + dt.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
        const itemsHtml = (s.items || [])
          .map(
            (it) =>
              `<tr style="border-bottom:1px solid #eee"><td style="padding:7px">${it.product_name}</td><td style="padding:7px;text-align:center">${it.quantity} ${it.unit}</td><td style="padding:7px;text-align:center">${it.unit_price} د.م</td><td style="padding:7px;text-align:left;font-weight:bold">${Number(it.total_price).toFixed(2)} د.م</td></tr>`
          )
          .join('');
        const payLabel = s.payment_method === 'cash' ? 'نقدا 💵' : 'بالدين 📝';
        const subtotal = (Number(s.total_amount) + Number(s.discount)).toFixed(2);
        const content = `
          <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;direction:rtl">
            <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:14px;margin-bottom:14px">
              <h2 style="margin:0;font-size:1.3em">🏪 التعاونية</h2>
              <p style="margin:4px 0;color:#666;font-size:0.88em">Coopérative Manager</p>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:0.86em">
              <span><strong>العضو:</strong> ${s.member_name}</span><span><strong>#</strong>${s.id}</span>
            </div>
            <div style="margin-bottom:12px;font-size:0.83em;color:#666"><strong>التاريخ:</strong> ${dateStr}</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.88em">
              <thead><tr style="background:#f0f2f5"><th style="padding:7px;text-align:right">المنتج</th><th style="padding:7px">الكمية</th><th style="padding:7px">الثمن</th><th style="padding:7px">المجموع</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top:13px;border-top:1px solid #eee;padding-top:9px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>المجموع:</span><span>${subtotal} د.م</span></div>
              ${s.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;color:#f5576c"><span>التخفيض:</span><span>-${s.discount} د.م</span></div>` : ''}
              <div style="display:flex;justify-content:space-between;font-size:1.18em;font-weight:bold;margin-top:7px;padding-top:7px;border-top:2px solid #333"><span>الإجمالي:</span><span>${Number(s.total_amount).toFixed(2)} د.م</span></div>
            </div>
            <div style="margin-top:12px;font-size:0.85em"><strong>طريقة الدفع:</strong> ${payLabel}</div>
            <div style="text-align:center;margin-top:18px;padding-top:13px;border-top:1px dashed #ccc;font-size:0.8em;color:#999">شكراً على ثقتكم 🙏<br>نظام التعاونية</div>
          </div>`;
        const pw = window.open('', '_blank', 'width=500,height=700');
        pw.document.write(`<html><head><title>فاتورة #${s.id}</title></head><body>${content}<script>window.onload=function(){window.print();window.close()}<\/script></body></html>`);
        pw.document.close();
      })
      .catch((e) => alert(`مشكل! ${e.message}`));
  }

  if (loading) return <Loading />;

  return (
    <div>
      <h4 style={{ marginBottom: 18, fontWeight: 'bold' }}>📤 تصدير وطباعة</h4>
      <div className="row g-4">
        {EXPORTS.map((x) => (
          <div className="col-md-3" key={x.key}>
            <div className="wc" style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: '2.8em', marginBottom: 13 }}>{x.icon}</div>
              <h5 style={{ marginBottom: 8 }}>{x.title}</h5>
              <p style={{ color: '#999', fontSize: '0.85em', marginBottom: 18 }}>{x.desc}</p>
              <button className="btn btn-p w-100" onClick={() => doExport(x.key, x.file)}>
                <i className="fas fa-download" /> تحميل CSV
              </button>
            </div>
          </div>
        ))}

        <div className="col-12">
          <div className="wc">
            <div className="wc-head"><div className="wc-title">🖨️ طباعة فاتورة PDF</div></div>
            <div className="row g-3 align-items-end">
              <div className="col-md-5"><div className="field"><label>اختار الفاتورة</label>
                <select className="select" value={saleId} onChange={(e) => setSaleId(e.target.value)}>
                  {sales.map((s) => (
                    <option key={s.id} value={s.id}>#{s.id} - {s.member_name} - {s.total_amount} د.م - {new Date(s.sale_date).toLocaleDateString('fr-MA')}</option>
                  ))}
                </select>
              </div></div>
              <div className="col-md-3" style={{ paddingBottom: 12 }}><button className="btn btn-p w-100" onClick={printInvoice}>🖨️ طباعة الفاتورة</button></div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="wc" style={{ borderTop: '4px solid #c9a227' }}>
            <div className="wc-head">
              <div className="wc-title">💾 نسخ احتياطي كامل (Backup)</div>
            </div>
            <p style={{ fontSize: '0.88em', color: '#5c726a', marginBottom: 14 }}>
              صدّر كاع البيانات المهمة دفعة وحدة (أعضاء، منتجات، مبيعات، ديون) كملفات CSV.
            </p>
            <button
              className="btn btn-s"
              onClick={async () => {
                for (const x of EXPORTS) {
                  try {
                    await doExport(x.key, x.file);
                  } catch {}
                }
                alert('✅ تم تحميل النسخ الاحتياطية');
              }}
            >
              <i className="fas fa-database" /> تحميل النسخ الاحتياطي الكامل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
