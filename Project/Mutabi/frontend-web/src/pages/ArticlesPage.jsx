import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config';
import useAuthStore from '../store/authStore'

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const EMPTY_FORM = { title: '', description: '', article_url: '', image_url: '' }

export default function ArticlesPage() {
  const { user }  = useAuthStore()
  const canEdit   = user?.role === 'admin' || user?.role === 'doctor'

  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/articles/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!form.title.trim() || !form.article_url.trim()) {
      setError('Title and article URL are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res  = await fetch(`${API_BASE_URL}/api/v1/articles/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title.trim(),
          description: form.description.trim(),
          article_url: form.article_url.trim(),
          image_url:   form.image_url.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to publish'); return }
      setArticles(prev => [{ ...data, summary: data.description }, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setError('Connection error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return
    await fetch(`${API_BASE_URL}/api/v1/articles/${id}`, { method: 'DELETE', credentials: 'include' })
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.summary || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Awareness Articles</h1>
              <p className="text-sm text-gray-400 mt-1">
                Share educational resources with parents and guardians.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => { setShowForm(v => !v); setError('') }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Article
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">

          {/* Add form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <h3 className="text-base font-bold text-gray-800 mb-4">New Article</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Article title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Summary
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description shown to parents..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                      placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Article URL *
                  </label>
                  <input
                    value={form.article_url}
                    onChange={e => setForm(f => ({ ...f, article_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Cover Image URL <span className="text-gray-400 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 mt-5 justify-end">
                <button
                  onClick={() => { setShowForm(false); setError(''); setForm(EMPTY_FORM) }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition"
                  style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                  {saving ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
                  bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
              />
            </div>
          </div>

          {/* Articles grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <svg className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm font-medium">
                {articles.length === 0 ? 'No articles published yet' : 'No articles match your search'}
              </p>
              {articles.length === 0 && canEdit && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm font-semibold text-blue-600 hover:underline mt-1"
                >
                  Add your first article
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(article => (
                <div key={article.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col
                    hover:shadow-md transition-shadow">
                  {/* Cover */}
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-40 object-cover"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #EEF3FA, #dbeafe)' }}>
                      <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-800 mb-1.5 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
                      <div className="flex items-center gap-3">
                        <a
                          href={article.article_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold hover:underline transition"
                          style={{ color: '#0F4C81' }}
                        >
                          Read Article →
                        </a>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
