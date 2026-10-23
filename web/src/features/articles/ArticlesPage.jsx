import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import useAuthStore from '../../store/authStore'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import ArticlesView from './components/ArticlesView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'
import '../../design-system/articles.css'

function ArticlesContent() {
  const { user } = useAuthStore()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    document.title = 'المقالات | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/articles/`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setArticles(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setLoadError('تعذر تحميل المقالات. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])
  const addArticle = async form => {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), article_url: form.article_url.trim(), image_url: form.image_url.trim() || null }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر نشر المقال. حاول مجددًا.')
    setArticles(current => [{ ...data, summary: data.summary || data.description }, ...current])
  }
  const deleteArticle = async id => {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر حذف المقال. حاول مجددًا.') }
    setArticles(current => current.filter(article => article.id !== id))
  }
  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main"><ArticlesView articles={articles} loading={loading} loadError={loadError} canPublish={user?.role === 'admin' || user?.role === 'doctor'} canDelete={user?.role === 'admin'} onAddArticle={addArticle} onDeleteArticle={deleteArticle} /></main></div>
}
export default function ArticlesPage() { return <ThemeProvider><ArticlesContent /></ThemeProvider> }
