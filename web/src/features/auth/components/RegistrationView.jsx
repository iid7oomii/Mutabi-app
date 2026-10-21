import { Baby, CircleCheck, Info, UserRound, UserRoundPlus } from 'lucide-react'
import { Button, Message } from '../../../design-system/components'

const relationships = [
  ['mother', 'الأم'], ['father', 'الأب'], ['guardian', 'ولي أمر'],
  ['therapist', 'معالج'], ['doctor', 'طبيب'], ['other', 'أخرى'],
]

function Field({ id, label, required, children, wide = false }) {
  return <div className={`mt-registration-field ${wide ? 'mt-registration-field--wide' : ''}`}>
    <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {children}
  </div>
}

function TextInput({ id, label, value, onChange, placeholder, type = 'text', required = false, wide = false, dir, hint, maxLength, max }) {
  return <Field id={id} label={label} required={required} wide={wide}>
    <input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} dir={dir} maxLength={maxLength} max={max} />
    {hint && <small>{hint}</small>}
  </Field>
}

export default function RegistrationView({ form, onFieldChange, customRelationship, onCustomRelationshipChange, doctors = [], isAdmin, saving = false, error, success, onSubmit, onReset, preview = false }) {
  const change = key => event => onFieldChange(key, event.target.value)

  return <div className="mt-dash-content mt-registration">
    <header className="mt-dash-header">
      <div><span className="mt-dash-eyebrow">إدارة الأطفال</span><h1>تسجيل طفل</h1>
        <p>أضف ملف الطفل وبيانات ولي الأمر لبدء المتابعة العلاجية.</p></div>
    </header>

    <div className="mt-registration-intro"><span><Info size={19} strokeWidth={1.9} /></span>
      <p>سيُنشأ حساب لولي الأمر وتُرسل له دعوة على البريد الإلكتروني بعد إتمام التسجيل.</p></div>

    {error && <div className="mt-registration-message"><Message tone="error">{error}</Message></div>}
    {success && <div className="mt-registration-message"><Message><CircleCheck size={17} />{success}</Message></div>}

    <form onSubmit={onSubmit} noValidate={preview}>
      <section className="mt-registration-card" aria-labelledby="parent-section-title">
        <div className="mt-registration-card__head"><span className="mt-registration-card__icon"><UserRound size={20} strokeWidth={1.9} /></span>
          <div><h2 id="parent-section-title">بيانات ولي الأمر</h2><p>معلومات التواصل وصلة القرابة بالطفل.</p></div><span className="mt-registration-step">01</span></div>
        <div className="mt-registration-grid">
          <TextInput id="parent-first-name" label="الاسم الأول" required maxLength={49} value={form.parent_first_name} onChange={change('parent_first_name')} placeholder="مثال: أحمد" />
          <TextInput id="parent-last-name" label="اسم العائلة" required maxLength={49} value={form.parent_second_name} onChange={change('parent_second_name')} placeholder="مثال: العتيبي" />
          <TextInput id="parent-email" label="البريد الإلكتروني" type="email" dir="ltr" required value={form.parent_email} onChange={change('parent_email')} placeholder="name@gmail.com" hint="البريد المقبول: Gmail، Outlook، Yahoo، iCloud، Hotmail." />
          <TextInput id="parent-phone" label="رقم الجوال" type="tel" dir="ltr" required value={form.parent_phone} onChange={change('parent_phone')} placeholder="05XXXXXXXX" />
          <Field id="parent-relationship" label="صلة القرابة" required>
            <select id="parent-relationship" value={form.parent_relationship} onChange={change('parent_relationship')} required>
              <option value="">اختر صلة القرابة</option>{relationships.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          {form.parent_relationship === 'other' && <TextInput id="parent-custom-relationship" label="توضيح صلة القرابة" required maxLength={100} value={customRelationship} onChange={event => onCustomRelationshipChange(event.target.value)} placeholder="اكتب صلة القرابة" />}
        </div>
      </section>

      <section className="mt-registration-card" aria-labelledby="child-section-title">
        <div className="mt-registration-card__head"><span className="mt-registration-card__icon mt-registration-card__icon--orange"><Baby size={20} strokeWidth={1.9} /></span>
          <div><h2 id="child-section-title">بيانات الطفل</h2><p>المعلومات الأساسية والأخصائي المسؤول.</p></div><span className="mt-registration-step">02</span></div>
        <div className="mt-registration-grid">
          <TextInput id="child-first-name" label="الاسم الأول" required maxLength={50} value={form.child_first_name} onChange={change('child_first_name')} placeholder="مثال: ليان" />
          <TextInput id="child-last-name" label="اسم العائلة" required maxLength={50} value={form.child_second_name} onChange={change('child_second_name')} placeholder="مثال: العتيبي" />
          <TextInput id="child-dob" label="تاريخ الميلاد" type="date" required max={new Date().toISOString().slice(0, 10)} value={form.child_dob} onChange={change('child_dob')} />
          {isAdmin && <Field id="child-doctor" label="الأخصائي المسؤول" required>
            <select id="child-doctor" value={form.doctor_id} onChange={change('doctor_id')} required>
              <option value="">اختر أخصائيًا</option>{doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.second_name}{doctor.specialty ? ` · ${doctor.specialty}` : ''}</option>)}
            </select>
            {doctors.length === 0 && <small>لا يوجد أخصائيون متاحون للتعيين حاليًا.</small>}
          </Field>}
          {!isAdmin && <div className="mt-registration-assignee"><UserRound size={18} /><span>سيُسند الطفل إلى حسابك تلقائيًا.</span></div>}
          <Field id="child-diagnosis" label="ملاحظات أولية عن الحالة" wide>
            <textarea id="child-diagnosis" rows="4" value={form.child_diagnosis} onChange={change('child_diagnosis')} placeholder="يمكن إضافة تشخيص سابق أو ملاحظات تساعد الأخصائي على بدء المتابعة..." />
          </Field>
        </div>
      </section>

      <div className="mt-registration-actions"><span>الحقول المميزة بنجمة مطلوبة.</span><div>
        <Button type="button" variant="secondary" onClick={onReset} disabled={saving}>مسح الحقول</Button>
        <Button type="submit" loading={saving} disabled={preview}><UserRoundPlus size={17} />تسجيل الطفل</Button>
      </div></div>
    </form>
  </div>
}
