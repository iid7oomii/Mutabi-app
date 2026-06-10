import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vectorOrange from '../assets/VectorOrange.svg';
import vectorWhite from '../assets/VectorWhite.svg';
import screen1 from '../assets/phone-screen1.jpg';
import screen2 from '../assets/phone-screen2.jpg';
import screen3 from '../assets/phone-screen3.jpg';
import logo from '../assets/logo-mark.svg';

const CheckIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BarChartIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const phoneScreens = [
  { src: screen1, alt: 'شاشة تمارين اليوم' },
  { src: screen2, alt: 'شاشة تسجيل الجلسة' },
  { src: screen3, alt: 'شاشة مسار التقدم' },
];

function PhoneMockup({ className = '' }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % phoneScreens.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative w-[320px] md:w-[420px]">
        <div className="relative rounded-[2.8rem] bg-gray-900 p-[6px] shadow-2xl ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[2.3rem] bg-black">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-5 w-24 rounded-b-2xl bg-gray-900" />
            <div className="relative h-[640px] md:h-[800px] w-full overflow-hidden">
              {phoneScreens.map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === active ? 1 : 0 }}
                >
                  <img src={s.src} alt={s.alt} className="w-full h-full object-cover object-top" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-20 rounded-full bg-white/30" />
          </div>
          <div className="absolute -right-[5px] top-20 h-8 w-[5px] rounded-r bg-gray-700" />
          <div className="absolute -right-[5px] top-32 h-12 w-[5px] rounded-r bg-gray-700" />
          <div className="absolute -left-[5px] top-24 h-14 w-[5px] rounded-l bg-gray-700" />
        </div>
      </div>
      <div className="flex gap-2">
        {phoneScreens.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'}`}
            aria-label={`شاشة ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.mutabi.app';

function ContactModal({ open, onClose, defaultType }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: defaultType, message: '' });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (open) { setForm(f => ({ ...f, type: defaultType })); setStatus('idle'); }
  }, [open, defaultType]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">تواصل معنا</h2>
            <p className="text-blue-100 text-sm mt-0.5">سنتواصل معك خلال 24 ساعة</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم الإرسال بنجاح!</h3>
            <p className="text-gray-500">سنتواصل معك قريباً على بريدك الإلكتروني.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium">إغلاق</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, type: 'specialist' }))}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.type === 'specialist' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                أخصائي
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, type: 'clinic' }))}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.type === 'clinic' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                عيادة
              </button>
            </div>
            <input required placeholder="الاسم الكامل" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm" />
            <input required type="email" placeholder="البريد الإلكتروني" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm" />
            <input required placeholder="رقم الهاتف" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm" />
            <textarea placeholder="رسالتك (اختياري)" rows={3} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm resize-none" />
            {status === 'error' && <p className="text-red-500 text-sm text-center">حدث خطأ، يرجى المحاولة مرة أخرى.</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-colors font-medium">
              {status === 'loading' ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const PlanIconSpecialist = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const PlanIconClinic = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const PlanIconUnlimited = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const PLAN_META = {
  specialist: { color: 'blue',   Icon: PlanIconSpecialist, badge: null,                    btnCls: 'bg-blue-600 hover:bg-blue-700',   hasTrial: true  },
  clinic:     { color: 'orange', Icon: PlanIconClinic,     badge: '✦ الأكثر شيوعاً', btnCls: 'bg-orange-500 hover:bg-orange-600', hasTrial: true  },
  unlimited:  { color: 'purple', Icon: PlanIconUnlimited,  badge: 'للعيادات الكبيرة', btnCls: 'bg-purple-600 hover:bg-purple-700', hasTrial: false },
}
const BORDER_CLS = { blue: 'border-blue-200', orange: 'border-orange-400', purple: 'border-purple-200' }

export default function LandingPage() {
  document.title = 'Mutabi | متابع'
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactType, setContactType] = useState('specialist');
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/subscriptions/plans`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setPlans(data))
      .catch(() => {});
  }, []);

  const handlePlanClick = (planType) => navigate(`/signup?plan=${planType}`);

  const openContact = (type = 'specialist') => { setContactType(type); setContactOpen(true); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} defaultType={contactType} />

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white/10 backdrop-blur-md border-b border-white/20'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="متابع" className="h-8 w-8" />
            <span className={`font-bold text-xl transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>متابع</span>
          </div>
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors duration-300 ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`transition-colors ${scrolled ? 'hover:text-gray-900' : 'hover:text-white'}`}>الرئيسية</button>
            <a href="#products" className={`transition-colors ${scrolled ? 'hover:text-gray-900' : 'hover:text-white'}`}>المنتجات</a>
            <a href="#pricing" className={`transition-colors ${scrolled ? 'hover:text-gray-900' : 'hover:text-white'}`}>الباقات</a>
            <button onClick={() => openContact()} className={`transition-colors ${scrolled ? 'hover:text-gray-900' : 'hover:text-white'}`}>تواصل معنا</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium">
              تسجيل الدخول
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-orange-500 px-6 pt-20 md:pt-28 pb-0">
        <img
          src={vectorWhite}
          alt=""
          className="pointer-events-none select-none absolute -top-10 -left-10 w-72 md:w-[480px] opacity-40"
        />
        <img
          src={vectorOrange}
          alt=""
          className="pointer-events-none select-none absolute -bottom-10 -right-10 w-72 md:w-[480px] opacity-50"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-800/50 blur-3xl" />
        <div className="pointer-events-none absolute top-10 left-10 h-48 w-48 rounded-full bg-orange-400/20 blur-2xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12 md:gap-16">
            {/* Text */}
            <div className="flex-1 text-center md:text-right order-2 md:order-1 pb-20 md:pb-28">
              <span className="inline-block mb-6 rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm ring-1 ring-white/30">
                منصة العلاج الوظيفي
              </span>
              <h1 className="mb-4 text-7xl md:text-9xl font-bold tracking-tight text-white drop-shadow-sm">
                متابع
              </h1>
              <p className="mb-3 text-2xl md:text-3xl text-white/90">سد الفجوة الرقمية</p>
              <p className="mb-3 text-2xl md:text-3xl text-orange-200">في العلاج الوظيفي</p>
              <p className="mb-10 text-lg text-white/70 max-w-md">
                ربط الأخصائيين والعائلات من خلال منصة موحدة للرعاية المستمرة
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/40 transition-colors font-medium"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  ابدأ الآن
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="flex-shrink-0 order-1 md:order-2 self-end relative">
              <div className="absolute inset-x-0 top-10 bottom-0 rounded-t-full bg-white/10 blur-2xl" />
              <PhoneMockup className="relative translate-y-[25%]" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 text-red-600">
              <ShieldIcon />
            </div>
            <h3 className="text-2xl font-semibold mb-4">التحدي</h3>
            <p className="text-gray-600 leading-relaxed">
              يمكن للمعالجين الوظيفيين مراقبة المرضى مباشرة فقط أثناء زيارات العيادة.
              بين الجلسات، لا توجد طريقة موثوقة لمراقبة ما إذا كانت التمارين المنزلية يتم
              إجراؤها بشكل صحيح أو على الإطلاق. هذا يخلق فجوات في استمرارية العلاج ويحد من
              عدد المرضى الذين يمكن للعيادة خدمتهم بفعالية.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <ActivityIcon />
            </div>
            <h3 className="text-2xl font-semibold mb-4">الحل</h3>
            <p className="text-gray-600 leading-relaxed">
              متابع يمنح الأخصائيين إمكانية المراقبة عن بُعد ويوفر للأهالي تعليمات واضحة
              وموجهة — كل ذلك في نظام واحد متكامل. تستمر التمارين الحسية للأطفال بدقة
              واتساق خارج العيادة، مما يقلل العبء على الأخصائيين مع الحفاظ على سير العلاج.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl md:text-5xl font-bold">منتجان متكاملان</h2>
            <p className="text-xl text-gray-600">منصة واحدة، تجربتان، تكامل سلس</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Dashboard card */}
            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow bg-white">
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-8 text-white">
                <MonitorIcon />
                <h3 className="text-2xl font-semibold mt-4 mb-1">لوحة التحكم</h3>
                <p className="text-orange-100 text-sm">للمعالجين الوظيفيين</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-600 mt-0.5"><CalendarIcon /></span>
                    إنشاء خطط علاج مخصصة
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-600 mt-0.5"><ActivityIcon /></span>
                    تعيين ومتابعة التمارين عن بُعد
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-600 mt-0.5"><BarChartIcon /></span>
                    مراقبة تقدم المريض في الوقت الفعلي
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-600 mt-0.5"><UsersIcon /></span>
                    إدارة عدة مرضى بكفاءة
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile app card */}
            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow bg-white">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
                <SmartphoneIcon />
                <h3 className="text-2xl font-semibold mt-4 mb-1">تطبيق الجوال</h3>
                <p className="text-blue-100 text-sm">للأهالي ومقدمي الرعاية</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-0.5"><ActivityIcon /></span>
                    عرض التمارين المحددة مع تعليمات واضحة
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-0.5"><CalendarIcon /></span>
                    تسجيل إكمال التمارين اليومية
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-0.5"><HeartIcon /></span>
                    متابعة تقدم طفلك في المنزل
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-0.5"><UsersIcon /></span>
                    البقاء على تواصل مع المعالج
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="mb-4 text-4xl md:text-5xl font-bold">الباقات والأسعار</h2>
            <p className="text-xl text-gray-600">جميع الباقات تشمل كامل الميزات — الفرق في عدد المستخدمين</p>
          </div>

          {/* COMING SOON OVERLAY WRAPPER */}
          <div className="relative">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-2xl shadow-lg border border-amber-200">
                <svg className="h-10 w-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-bold text-gray-800">الباقات قيد الإنشاء</p>
                <p className="text-sm text-gray-500 text-center">سيتم الإعلان عن الباقات والأسعار قريباً</p>
              </div>
            </div>

          <div className="opacity-30 pointer-events-none select-none">
          {plans.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {plans.map(plan => {
                const meta   = PLAN_META[plan.plan_type] || PLAN_META.specialist
                const border = BORDER_CLS[meta.color] || 'border-gray-200'
                const featured = plan.plan_type === 'clinic'

                return (
                  <div
                    key={plan.plan_type}
                    className={`rounded-2xl border-2 ${featured ? 'border-orange-400 shadow-lg shadow-orange-100' : border} hover:shadow-xl transition-shadow p-8 relative flex flex-col`}
                  >
                    {meta.badge && (
                      <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs px-4 py-1.5 rounded-full font-medium whitespace-nowrap ${featured ? 'bg-orange-500' : 'bg-purple-600'}`}>
                        {meta.badge}
                      </span>
                    )}

                    <div className={`flex items-center justify-center h-14 w-14 rounded-2xl mx-auto mb-3 ${meta.color === 'blue' ? 'bg-blue-100 text-blue-600' : meta.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                      <meta.Icon />
                    </div>
                    <h3 className="text-2xl font-semibold text-center mb-1">{plan.display_name}</h3>
                    <p className="text-gray-500 text-sm text-center mb-5">{plan.description}</p>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price_sar.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm"> ريال</span>
                      <span className="text-gray-400 text-sm"> / سنة</span>
                      <div className="text-xs text-gray-400 mt-1">
                        ما يعادل {Math.round(plan.price_sar / 12).toLocaleString()} ريال / شهر
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1 mb-8">
                      <li className="flex items-center gap-3 text-gray-700 font-medium">
                        <span className="text-green-500"><CheckIcon /></span>
                        {plan.max_doctors === -1 ? 'عدد غير محدود من الأطباء' : `${plan.max_doctors === 1 ? 'طبيب واحد' : `حتى ${plan.max_doctors} أطباء`}`}
                      </li>
                      <li className="flex items-center gap-3 text-gray-700 font-medium">
                        <span className="text-green-500"><CheckIcon /></span>
                        {plan.max_patients_per_doctor === -1 ? 'عدد غير محدود من المرضى' : `${plan.max_patients_per_doctor} مريضاً لكل طبيب`}
                      </li>
                      {['خطط علاجية مخصصة', 'متابعة التمارين عن بُعد', 'تقارير التقدم', 'تطبيق جوال للأهالي', 'إشعارات فورية', 'مقالات التوعية'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-gray-700">
                          <span className="text-green-500"><CheckIcon /></span>
                          {f}
                        </li>
                      ))}
                      {plan.plan_type === 'unlimited' && (
                        <li className="flex items-center gap-3 text-purple-700 font-medium">
                          <span className="text-purple-500">
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </span>
                          أولوية في طلبات الميزات الجديدة
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => handlePlanClick(plan.plan_type)}
                      className={`w-full py-3.5 text-white rounded-xl transition-colors font-semibold text-base ${meta.btnCls}`}
                    >
                      {meta.hasTrial ? 'ابدأ التجربة المجانية' : 'ابدأ الآن'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Fallback skeleton while loading */
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border-2 border-gray-100 p-8 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-6" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
                  <div className="space-y-2 mb-8">
                    {[1,2,3,4].map(j => <div key={j} className="h-4 bg-gray-100 rounded" />)}
                  </div>
                  <div className="h-11 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}
          </div>{/* end opacity wrapper */}
          </div>{/* end relative overlay wrapper */}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-4xl md:text-5xl font-bold">هل أنت مستعد لتطوير ممارستك؟</h2>
          <p className="mb-10 text-xl text-gray-600 max-w-2xl mx-auto">
            انضم إلى عيادات العلاج الوظيفي التي تستخدم متابع لتقديم رعاية أفضل
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openContact()}
              className="flex items-center justify-center gap-2 text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/30 transition-colors font-medium"
            >
              تواصل معنا
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 pt-16 pb-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">

            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-3">متابع</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                سد الفجوة الرقمية في العلاج الوظيفي — ربط الأخصائيين والعائلات من خلال منصة موحدة.
              </p>
              <div className="flex gap-3">
                {/* X / Twitter */}
                <a href="#" aria-label="X" className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.034 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" aria-label="LinkedIn" className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">تواصل معنا</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="mailto:contact@mutabi.app" className="flex items-center gap-3 hover:text-white transition-colors">
                    <span className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </span>
                    contact@mutabi.app
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/" className="flex items-center gap-3 hover:text-white transition-colors">
                    <span className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.625a.75.75 0 00.919.919l5.878-1.474A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.74 9.74 0 01-5.002-1.376l-.358-.214-3.717.931.951-3.624-.235-.373A9.722 9.722 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                      </svg>
                    </span>
                    واتساب
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} متابع — جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
