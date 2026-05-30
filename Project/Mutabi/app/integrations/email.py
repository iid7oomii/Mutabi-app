import os
import resend

class ResendEmailClient:

    def __init__(self):
        resend.api_key = os.getenv("RESEND_API_KEY")

    def send_password_reset(self, to_email: str, user_name: str, reset_link: str) -> None:
        resend.Emails.send({
            "from": "Mutabi <noreply@mutabi.app>",
            "to": to_email,
            "subject": "إعادة تعيين كلمة المرور — مُتابِع",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">

                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #0F4C81, #2c78bb); padding: 12px 24px; border-radius: 12px;">
                        <span style="color: white; font-size: 20px; font-weight: bold;">مُتابِع</span>
                    </div>
                </div>

                <h2 style="color: #1a1a2e; font-size: 22px; margin-bottom: 8px;">أهلاً {user_name}</h2>
                <p style="color: #666; font-size: 15px; line-height: 1.8; margin-bottom: 24px;">
                    تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة <strong style="color: #0F4C81;">مُتابِع</strong>.
                    إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد وستبقى كلمة مرورك كما هي.
                </p>

                <div style="text-align: center; margin-bottom: 28px;">
                    <a href="{reset_link}"
                    style="display: inline-block; background: linear-gradient(135deg, #0F4C81, #2c78bb); color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                        إعادة تعيين كلمة المرور
                    </a>
                </div>

                <div style="background: #FFF3E8; border-right: 4px solid #FF7A00; border-radius: 8px 0 0 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.8;">
                        <strong style="color: #FF7A00;">تنبيه:</strong>
                        هذا الرابط صالح لمدة ساعة واحدة فقط. بعد انتهاء مدته ستحتاج إلى طلب رابط جديد.
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
                    إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.<br>
                    &copy; 2025 منصة مُتابِع للعلاج الوظيفي
                </p>
            </div>
            """
        })

    def send_parent_invitation(self, to_email: str, parent_name: str, password: str, clinic_name: str = '') -> None:
        resend.Emails.send({
            "from": "Mutabi <noreply@mutabi.app>",
            "to": to_email,
            "subject": "مرحباً بك في Mutabi — تم إنشاء حسابك",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">

                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #0F4C81, #2c78bb); padding: 12px 24px; border-radius: 12px;">
                        <span style="color: white; font-size: 20px; font-weight: bold;">مُتابِع</span>
                    </div>
                </div>

                <h2 style="color: #1a1a2e; font-size: 22px; margin-bottom: 8px;">أهلاً {parent_name}</h2>
                <p style="color: #666; font-size: 15px; line-height: 1.8; margin-bottom: 24px;">
                    تم إنشاء حسابك في عيادة <strong style="color: #0F4C81;">{clinic_name}</strong> على تطبيق <strong>مُتابِع</strong> لمتابعة العلاج الوظيفي.
                    يمكنك الآن تسجيل الدخول عبر تطبيق الجوال لمتابعة تقدم طفلك.
                </p>

                <div style="background: #f8f9fb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">بيانات تسجيل الدخول</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666; font-size: 14px; width: 160px;">البريد الإلكتروني</td>
                            <td style="padding: 10px 0; color: #1a1a2e; font-weight: 600; font-size: 14px;">{to_email}</td>
                        </tr>
                        <tr style="border-top: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666; font-size: 14px;">كلمة المرور</td>
                            <td style="padding: 10px 0;">
                                <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #0F4C81; background: #EEF3FA; padding: 4px 12px; border-radius: 6px; letter-spacing: 2px;">{password}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background: #FFF3E8; border-right: 4px solid #FF7A00; border-radius: 8px 0 0 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.8;">
                        <strong style="color: #FF7A00;">توصية:</strong>
                        يُنصح بتغيير كلمة المرور بعد أول تسجيل دخول من داخل التطبيق للحفاظ على أمان حسابك.
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
                    إذا لم تكن تتوقع هذا البريد، يرجى التواصل مع مدير العيادة.<br>
                    &copy; 2025 منصة مُتابِع للعلاج الوظيفي
                </p>
            </div>
            """
        })

    def send_doctor_invitation(self, to_email: str, doctor_name: str, temp_password: str, clinic_name: str = '') -> None:
        resend.Emails.send({
            "from": "Mutabi <noreply@mutabi.app>",
            "to": to_email,
            "subject": "مرحباً بك في Mutabi — فعّل حسابك الآن",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">

                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #0F4C81, #2c78bb); padding: 12px 24px; border-radius: 12px;">
                        <span style="color: white; font-size: 20px; font-weight: bold;">Mutabi</span>
                    </div>
                </div>

                <h2 style="color: #1a1a2e; font-size: 22px; margin-bottom: 8px;">أهلاً دكتور {doctor_name}</h2>
                <p style="color: #666; font-size: 15px; line-height: 1.8; margin-bottom: 24px;">
                    تم إنشاء حسابك في عيادة <strong style="color: #0F4C81;">{clinic_name}</strong> على منصة Mutabi للعلاج الوظيفي بنجاح.
                    للبدء، يرجى تسجيل الدخول باستخدام البيانات المؤقتة أدناه وتفعيل حسابك.
                </p>

                <div style="background: #f8f9fb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">بيانات تسجيل الدخول</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666; font-size: 14px; width: 160px;">رابط تسجيل الدخول</td>
                            <td style="padding: 10px 0;">
                                <a href="https://mutabi.app" style="color: #0F4C81; font-weight: 600; text-decoration: none;">mutabi.app</a>
                            </td>
                        </tr>
                        <tr style="border-top: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666; font-size: 14px;">البريد الإلكتروني</td>
                            <td style="padding: 10px 0; color: #1a1a2e; font-weight: 600; font-size: 14px;">{to_email}</td>
                        </tr>
                        <tr style="border-top: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666; font-size: 14px;">كلمة المرور المؤقتة</td>
                            <td style="padding: 10px 0;">
                                <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #0F4C81; background: #EEF3FA; padding: 4px 12px; border-radius: 6px; letter-spacing: 2px;">{temp_password}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background: #FFF3E8; border-right: 4px solid #FF7A00; border-radius: 8px 0 0 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.8;">
                        <strong style="color: #FF7A00;">إجراء مطلوب:</strong>
                        يرجى تسجيل الدخول باستخدام البيانات أعلاه وتغيير كلمة المرور فوراً لتفعيل حسابك.
                        لن يكون بإمكانك استخدام المنصة حتى تكتمل هذه الخطوة.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="https://mutabi.app"
                    style="display: inline-block; background: linear-gradient(135deg, #0F4C81, #2c78bb); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                        تسجيل الدخول وتفعيل الحساب
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
                    إذا لم تكن تتوقع هذا البريد، يرجى التواصل مع مدير العيادة.<br>
                    &copy; 2025 منصة Mutabi للعلاج الوظيفي
                </p>
            </div>
            """
        })