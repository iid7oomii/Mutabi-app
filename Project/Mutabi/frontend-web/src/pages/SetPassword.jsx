import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { API_BASE_URL } from '../config';
import logo from '../assets/logo-mark.svg';


const EyeIcon = ({ show }) => show ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function SetPassword() {
	const navigate = useNavigate()
	const [tempPassword, setTempPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [showTemp, setShowTemp] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { fetchUser, user } = useAuthStore()

	useEffect(() => {
			if (user && user.active === true) {
				navigate('/dashboard', { replace: true })
			}
		}, [user, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError('')



		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/auth/set_password`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ tempPassword, newPassword })
			})
			
			const data = await res.json()

			if (!res.ok)  {
				setError(data.error || 'حدث خطأ')
				return
			}

			await fetchUser()
            navigate('/dashboard', { replace: true })

		} catch {
			setError('تعذر الاتصال بالخادم')
		} finally {
			setLoading(false)
		}
	}
	return (
<div className="min-h-screen flex items-center justify-center" dir="rtl">
			<div className="w-full max-w-md">

				{/* Logo */}
				<div className="text-center mb-10">
					<img src={logo} alt="Logo"  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"/>
					<h1 className="text-3xl font-bold text-gray-800">متابع</h1>
					<p className="text-gray-400 mt-1 text-sm">منصة متابعة العلاج</p>
				</div>

				{/* Card */}
				<div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
					<h2 className="text-xl font-bold text-gray-800 mb-6">تفعيل الحساب</h2>

					{error && (
						<div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">


						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
								كلمة المرور المؤقتة
							</label>
							<div className='relative'>
							<input
								type={showTemp ? 'text' : 'password'}
								value={tempPassword}
								onChange={(e) => setTempPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="w-full pr-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
							/>
							<button
								type="button"
								onClick={() => setShowTemp(p => !p)}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
							>
								<EyeIcon show={showTemp} />
							</button>
							</div>
						</div>
							<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
							كلمة المرور الجديدة
							</label>
							<div className='relative'>
							<input
								type={showNew ? 'text' : 'password'}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="w-full pr-4 pl-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
							/>
							<button
								type="button"
								onClick={() => setShowNew(p => !p)}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
							>
								<EyeIcon show={showNew} />
							</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
							style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
						>
							{loading ? 'جاري التحميل...' : 'تفعيل'}
						</button>

					</form>
				</div>

			</div>
		</div>
	)
}