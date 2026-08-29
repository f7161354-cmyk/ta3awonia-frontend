'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Sidebar from '@/components/Sidebar';
import HeaderTools from '@/components/HeaderTools';

const TITLES = {
  dashboard: '📊 لوحة التحكم',
  board: '🏛️ مجلس الإدارة',
  users: '👤 User Admin Panel',
  assemblies: '📅 الجموعات العامة',
  minutes: '📝 محاضر الاجتماعات',
  decisions: '🔑 سجل القرارات',
  committees: '🏛️ اللجان',
  attendance: '✅ سجل الحضور',
  members: '👥 الأعضاء',
  accounting: '🧮 المحاسبة العامة',
  contributions: '💰 الحصص والاشتراكات',
  'share-certificates': '📜 شهادات الحصص',
  treasury: '🏦 الصندوق والخزينة',
  budget: '📊 الميزانية',
  debts: '💳 الديون',
  expenses: '💸 المصاريف',
  profits: '💹 توزيع الأرباح',
  'fiscal-year': '📅 السنة المالية',
  products: '📦 المنتجات والمخزون',
  'stock-moves': '🔄 حركات المخزون',
  inventory: '📋 الجرد',
  sales: '🧾 المبيعات والفواتير',
  purchases: '🚚 المشتريات',
  suppliers: '🏭 الموردين',
  clients: '🤝 الزبناء',
  'legal-docs': '⚖️ الوثائق القانونية',
  'mandatory-records': '📚 السجلات الإلزامية',
  reports: '📈 التقارير والإحصائيات',
  export: '📤 تصدير البيانات',
  'activity-log': '📋 سجل النشاط',
  settings: '⚙️ الإعدادات',
  profile: '👤 الملف الشخصي',
  calendar: '📅 التقويم',
  'market-search': '🔍 بحث السوق والتعاونيات',
};

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const dark = theme?.dark;
  const router = useRouter();
  const pathname = usePathname();
  const [dateStr, setDateStr] = useState('');

  const page = (pathname || '/').split('/').filter(Boolean)[0] || 'dashboard';

  useEffect(() => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
    const n = new Date();
    setDateStr(`📅 ${days[n.getDay()]} ${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()}`);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ⏳ كيتحمّل...
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh' }} className={dark ? 'dark-app' : ''}>
      <Sidebar />
      <div style={{ marginRight: 260 }}>
        <div
          style={{
            background: dark ? 'rgba(26,46,40,0.95)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 0 rgba(15,23,42,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.04)',
            flexWrap: 'wrap',
            gap: 10,
            color: dark ? '#e8f0ec' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h5 style={{ margin: 0, fontWeight: 'bold', color: dark ? '#e8c547' : '#2d3748' }}>
              {TITLES[page] || page}
            </h5>
            <span
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : '#f0f2f5',
                padding: '5px 11px',
                borderRadius: 20,
                fontSize: '0.75em',
                color: dark ? '#a8c5b8' : '#666',
              }}
            >
              {dateStr}
            </span>
          </div>
          <HeaderTools />
        </div>
        <div style={{ padding: '22px 26px 40px', minHeight: 'calc(100vh - 70px)' }}>{children}</div>
      </div>
    </div>
  );
}
