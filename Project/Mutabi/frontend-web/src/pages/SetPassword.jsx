import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import logo from '../assets/logo-mark.svg';


export default function SetPassword() {
	const navigate = useNavigate()
	const [tempPassword, setTempPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
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
			const res = await fetch('/api/v1/auth/set_password', {
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
								type="password"
								value={tempPassword}
								onChange={(e) => setTempPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
							/>
							</div>
						</div>
							<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">
							كلمة المرور الجديدة
							</label>
							<div className='relative'>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700 text-sm transition"
							/>
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