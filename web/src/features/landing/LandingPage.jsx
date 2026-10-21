import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, BookOpen, Check, ChevronLeft, ClipboardList, Heart, Menu, MessageSquareText, ShieldCheck, Smartphone, Target, UsersRound, X } from 'lucide-react'
import logo from '../../assets/logo-mark.svg'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { ThemeToggle } from '../../design-system/templates'
import { Button } from '../../design-system/components'
import { API_BASE_URL } from '../../services/api/config'
import '../../design-system/landing.css'

const benefits = [
  { icon: ClipboardList, title: 'خطة واضحة', description: 'يحدد الأخصائي التمارين والتعليمات المناسبة لكل طفل، وتظهر للأسرة في تطبيق الجوال.' },
  { icon: Activity, title: 'متابعة مستمرة', description: 'تُسجّل الأسرة تنفيذ التمارين وملاحظاتها، ويطّلع الأخصائي على ما حدث بين الجلسات.' },
  { icon: Target, title: 'أهداف قابلة للمتابعة', description: 'تبقى الأهداف العلاجية واضحة، ويتولى الأخصائي مراجعة تقدمها وتأكيد اكتمالها.' },
]

function ContactDialog({ onClose }) {
  const [form, setForm] = useState({ clinic_name: '', contact_name: '', email: '', phone: '', city: '', notes: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [cities, setCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [citiesError, setCitiesError] = useState(false)
  const [citiesRetry, setCitiesRetry] = useState(0)

  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE_URL}/api/v1/clinic-leads/cities`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Failed to load cities'); return response.json() })
      .then(data => { if (Array.isArray(data) && data.length) { setCities(data); setCitiesError(false) } else setCitiesError(true) })
      .catch(() => { if (!controller.signal.aborted) setCitiesError(true) })
      .finally(() => { if (!controller.signal.aborted) setCitiesLoading(false) })
    return () => controller.abort()
  }, [citiesRetry])

  const submit = async event => {
    event.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setError('')
    try {
      const payload = {
        clinic_name: form.clinic_name.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
        notes: form.notes.trim() || null,
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/clinic-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        setError(response.status === 400 ? 'راجع بيانات العيادة ورقم التواصل ثم حاول مجددًا.' : 'تعذر إرسال طلبك الآن. حاول مجددًا لاحقًا.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('تعذر الاتصال بالخادم. حاول مجددًا.')
      setStatus('error')
    }
  }

  return <div className="mt-landing-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="mt-landing-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <div className="mt-landing-dialog__head"><div><span className="mt-landing-kicker">لديك استفسار؟</span><h2 id="contact-title">تواصل مع فريق متابع</h2></div>
        <button type="button" onClick={onClose} aria-label="إغلاق"><X size={20} /></button></div>
      {status === 'success' ? <div className="mt-landing-dialog__success"><span><Check size={25} /></span><h3>تم إرسال طلبك</h3><p>سيتواصل معك الفريق عبر بيانات التواصل التي أدخلتها.</p><Button type="button" onClick={onClose}>إغلاق</Button></div>
        : <form onSubmit={submit} className="mt-landing-contact-form">
          <div className="mt-landing-contact-form__row"><label>اسم العيادة<input required minLength={2} maxLength={100} value={form.clinic_name} onChange={event => setForm(current => ({ ...current, clinic_name: event.target.value }))} /></label>
            <label>اسم مسؤول التواصل<input required minLength={2} maxLength={50} value={form.contact_name} onChange={event => setForm(current => ({ ...current, contact_name: event.target.value }))} /></label></div>
          <div className="mt-landing-contact-form__row"><label>البريد الإلكتروني<input required type="email" maxLength={254} dir="ltr" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></label>
            <label>رقم التواصل<input required type="tel" dir="ltr" placeholder="05xxxxxxxx" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} /></label></div>
          <label>المدينة<select required value={form.city} disabled={citiesLoading || citiesError} onChange={event => setForm(current => ({ ...current, city: event.target.value }))}><option value="">اختر مدينة العيادة</option>{cities.map(city => <option key={city} value={city}>{city}</option>)}</select></label>
          {citiesLoading && <p>جارٍ تحميل المدن…</p>}
          {citiesError && <p className="mt-landing-contact-form__error" role="alert">تعذر تحميل المدن. <button type="button" onClick={() => { setCitiesLoading(true); setCitiesError(false); setCitiesRetry(value => value + 1) }}>إعادة المحاولة</button></p>}
          <label>ملاحظات <span>(اختياري)</span><textarea rows="3" maxLength={1000} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></label>
          {status === 'error' && <p className="mt-landing-contact-form__error" role="alert">{error}</p>}
          <Button type="submit" loading={status === 'loading'} disabled={citiesLoading || citiesError}>إرسال الطلب <ArrowLeft size={17} /></Button>
        </form>}
    </div>
  </div>
}

function ProductPreview() {
  return <div className="mt-landing-preview" aria-label="معاينة توضيحية لواجهات متابع">
    <div className="mt-landing-preview__desktop">
      <div className="mt-landing-preview__desktop-head"><span className="mt-landing-preview__mark"><img src={logo} alt="" />متابع</span><span>لوحة الأخصائي</span><span className="mt-landing-preview__user">ن</span></div>
      <div className="mt-landing-preview__desktop-body">
        <div className="mt-landing-preview__rail"><span className="is-active"><UsersRound size={16} /> الأطفال</span><span><ClipboardList size={16} /> الخطط</span><span><BookOpen size={16} /> التمارين</span><span><MessageSquareText size={16} /> الملاحظات</span></div>
        <div className="mt-landing-preview__main"><small>ملخص المتابعة</small><h3>كل ما تحتاجه في مكان واحد</h3>
          <div className="mt-landing-preview__metrics"><div><UsersRound size={17} /><small>الأطفال المسندون</small><strong>١٢</strong></div><div><Activity size={17} /><small>الخطط النشطة</small><strong>٩</strong></div></div>
          <div className="mt-landing-preview__row"><span className="mt-landing-preview__avatar">ل</span><span><strong>خطة ليان</strong><small>تمارين هذا الأسبوع</small></span><span className="mt-landing-preview__pill">قيد المتابعة</span></div>
          <div className="mt-landing-preview__row"><span className="mt-landing-preview__avatar">س</span><span><strong>خطة سارة</strong><small>ملاحظة جديدة من الأسرة</small></span><ChevronLeft size={16} /></div>
        </div>
      </div>
    </div>
    <div className="mt-landing-preview__phone"><div className="mt-landing-preview__phone-screen">
      <div className="mt-landing-preview__phone-top"><span className="mt-landing-preview__phone-brand"><img src={logo} alt="" /> متابع</span><span className="mt-landing-preview__phone-dot" /></div>
      <span className="mt-landing-preview__phone-eyebrow">صفحة اليوم</span><strong className="mt-landing-preview__phone-title">تمارين ليان</strong>
      <div className="mt-landing-preview__phone-progress"><div><span>إنجاز اليوم</span><strong>٢ من ٣</strong></div><div className="mt-landing-preview__phone-track"><i /></div><small>خطوة واحدة متبقية</small></div>
      <div className="mt-landing-preview__phone-label">التمرين التالي</div>
      <div className="mt-landing-preview__phone-card"><span className="mt-landing-preview__phone-card-icon"><Heart size={17} /></span><strong>توازن الوقوف</strong><small>٥ دقائق · ٣ تكرارات</small><b>عرض التمرين <ChevronLeft size={13} /></b></div>
    </div></div>
  </div>
}

function LandingContent() {
  const navigate = useNavigate()
  const [contactOpen, setContactOpen] = useState(() => new URLSearchParams(window.location.search).get('contact') === '1')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { document.title = 'متابع | متابعة العلاج بين العيادة والمنزل' }, [])

  return <div className="mt-landing">
    {contactOpen && <ContactDialog onClose={() => setContactOpen(false)} />}
    <header className="mt-landing-header"><div className="mt-landing-container mt-landing-header__inner">
      <a href="#top" className="mt-landing-brand" aria-label="متابع، العودة لأعلى الصفحة"><img src={logo} alt="" /><span>متابع</span></a>
      <nav className={menuOpen ? 'is-open' : ''} aria-label="القائمة الرئيسية"><a href="#how-it-works" onClick={() => setMenuOpen(false)}>كيف يعمل</a><a href="#products" onClick={() => setMenuOpen(false)}>المنتجات</a><button type="button" onClick={() => { setContactOpen(true); setMenuOpen(false) }}>تواصل معنا</button></nav>
      <div className="mt-landing-header__actions"><ThemeToggle /><Button variant="secondary" type="button" onClick={() => navigate('/login')}>تسجيل الدخول</Button><button className="mt-landing-menu" type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><Menu size={21} /></button></div>
    </div></header>

    <main id="top">
      <section className="mt-landing-hero"><div className="mt-landing-container mt-landing-hero__grid">
        <div className="mt-landing-hero__copy"><span className="mt-landing-kicker"><span className="mt-landing-kicker__dot" /> متابعة علاجية أوضح</span>
          <h1>من العيادة إلى المنزل،<br /><em>تبقى المتابعة مستمرة.</em></h1>
          <p>متابع يجمع الخطة العلاجية والتمارين وملاحظات الأسرة في تجربة واضحة للأخصائي والعيادة، وتطبيق سهل للأسرة.</p>
          <div className="mt-landing-hero__actions"><Button type="button" onClick={() => setContactOpen(true)}>تواصل معنا <ArrowLeft size={18} /></Button><a className="mt-landing-text-link" href="#how-it-works">اكتشف كيف يعمل <ChevronLeft size={17} /></a></div>
          <div className="mt-landing-hero__note"><ShieldCheck size={18} /><span>الخطة والأهداف يحددها الأخصائي، والأسرة تتابع التنفيذ من الجوال.</span></div>
        </div>
        <ProductPreview />
      </div></section>

      <section id="how-it-works" className="mt-landing-section"><div className="mt-landing-container">
        <div className="mt-landing-section__intro"><span className="mt-landing-kicker">كيف يعمل</span><h2>خطوات مترابطة، من دون تشتيت</h2><p>كل طرف يرى ما يحتاجه ليبقى العلاج المنزلي جزءًا واضحًا من الخطة.</p></div>
        <div className="mt-landing-benefits">{benefits.map((benefit, index) => { const Icon = benefit.icon; return <article key={benefit.title} className="mt-landing-benefit"><span className="mt-landing-benefit__number">٠{index + 1}</span><span className="mt-landing-benefit__icon"><Icon size={23} strokeWidth={1.8} /></span><h3>{benefit.title}</h3><p>{benefit.description}</p></article> })}</div>
      </div></section>

      <section id="products" className="mt-landing-section mt-landing-section--soft"><div className="mt-landing-container">
        <div className="mt-landing-section__intro"><span className="mt-landing-kicker">المنتجات</span><h2>واجهة مناسبة لكل دور</h2><p>لوحة ويب للعيادة والأخصائي، وتطبيق جوال للأسرة.</p></div>
        <div className="mt-landing-products"><article><span className="mt-landing-products__icon"><ClipboardList size={25} /></span><h3>لوحة التحكم</h3><p>إدارة الأطفال والخطط والتمارين، ومراجعة ما يصل من الأسرة في مساحة عمل واحدة.</p><ul><li><Check size={16} /> تنظيم الخطط العلاجية</li><li><Check size={16} /> مراجعة التنفيذ والملاحظات</li><li><Check size={16} /> متابعة الأهداف والتقدم</li></ul><button type="button" onClick={() => setContactOpen(true)}>استفسر عن لوحة التحكم <ArrowLeft size={17} /></button></article>
          <article><span className="mt-landing-products__icon mt-landing-products__icon--orange"><Smartphone size={25} /></span><h3>تطبيق الجوال</h3><p>تعليمات التمارين ومواعيدها في متناول الأسرة، مع تسجيل التنفيذ والملاحظات بسهولة.</p><ul><li><Check size={16} /> تمارين اليوم بخطوات واضحة</li><li><Check size={16} /> توثيق الإنجاز والملاحظات</li><li><Check size={16} /> رؤية التقدم والأهداف</li></ul><button type="button" onClick={() => setContactOpen(true)}>استفسر عن التطبيق <ArrowLeft size={17} /></button></article></div>
      </div></section>

      <section className="mt-landing-cta"><div className="mt-landing-container mt-landing-cta__inner"><div><span className="mt-landing-kicker">خطوة تالية</span><h2>متابعة أوضح لكل طفل</h2><p>تواصل معنا لمعرفة كيف يناسب متابع طريقة عمل عيادتك.</p></div><div><Button type="button" onClick={() => setContactOpen(true)}>تواصل معنا <ArrowLeft size={18} /></Button><Button variant="secondary" type="button" onClick={() => navigate('/login')}>تسجيل الدخول</Button></div></div></section>
    </main>

    <footer className="mt-landing-footer"><div className="mt-landing-container"><div className="mt-landing-footer__top"><div className="mt-landing-brand"><img src={logo} alt="" /><span>متابع</span></div><p>متابعة العلاج بين العيادة والمنزل.</p><button type="button" onClick={() => setContactOpen(true)}>تواصل معنا <ArrowLeft size={16} /></button></div><div className="mt-landing-footer__bottom"><span>© {new Date().getFullYear()} متابع</span><span>جميع الحقوق محفوظة</span></div></div></footer>
  </div>
}

export default function LandingPage() {
  return <ThemeProvider><LandingContent /></ThemeProvider>
}
