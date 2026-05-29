import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { ChevronDownIcon } from '../components/Icons'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const avatarColor = (name) => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

const STATUS_ICONS = {
  completed: (
    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  skipped: (
    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  partially_completed: (
    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const SENTIMENT_ICONS = {
  completed: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  skipped: (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  partially_completed: (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

export default function Feedback() {
  const navigate = useNavigate()
  const location = useLocation()
  const highlightId = location.state?.highlightId

  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [dateFilter, setDateFilter] = useState(0)

  const load = () => {
    fetch('/api/v1/feedback/doctor/all', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setFeedbacks(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (highlightId && feedbacks.length > 0) {
      setTimeout(() => {
        document.getElementById(`feedback-${highlightId}`)?.scrollIntoView({
          behavior: 'smooth', block: 'center'
        })
      }, 300)
    }
  }, [highlightId, feedbacks])

  const handleReply = async (feedbackId) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      await fetch(`/api/v1/feedback/${feedbackId}/reply`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      })
      setReplyingTo(null)
      setReplyText('')
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setSendingReply(false)
    }
  }

  const filtered = feedbacks.filter(f => {
    if (!dateFilter) return true
    const date = new Date(f.feedback_date)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - dateFilter)
    return date >= cutoff
  })

  const left = filtered.filter((_, i) => i % 2 === 0)
  const right = filtered.filter((_, i) => i % 2 !== 0)

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Feedback</h1>
              <p className="text-sm text-gray-400 mt-1">Recent notes and session updates from parents and guardians.</p>
            </div>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(Number(e.target.value))}
                className="appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
                <option value={365}>Last 12 Months</option>
                <option value={0}>All Time</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDownIcon className="w-3 h-3" />
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-sm text-gray-400">
              {feedbacks.length === 0 ? 'No feedback yet' : 'No feedback in this period'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 items-start">
              <div className="flex flex-col gap-5">
                {left.map(f => (
                  <FeedbackCard
                    key={f.id}
                    f={f}
                    highlightId={highlightId}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    sendingReply={sendingReply}
                    setReplyingTo={setReplyingTo}
                    setReplyText={setReplyText}
                    handleReply={handleReply}
                    navigate={navigate}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-5">
                {right.map(f => (
                  <FeedbackCard
                    key={f.id}
                    f={f}
                    highlightId={highlightId}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    sendingReply={sendingReply}
                    setReplyingTo={setReplyingTo}
                    setReplyText={setReplyText}
                    handleReply={handleReply}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

function FeedbackCard({ f, highlightId, replyingTo, replyText, sendingReply, setReplyingTo, setReplyText, handleReply, navigate }) {
  const initials = f.parent_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const color = avatarColor(f.parent_name || '')
  const isReplying = replyingTo === f.id
  const isHighlighted = f.id === highlightId

  return (
    <div
			id={`feedback-${f.id}`}
			className={`bg-white rounded-2xl border shadow-sm p-5 transition h-[620px] flex flex-col ${
				isHighlighted ? 'border-blue-400 shadow-blue-100' : 'border-gray-100'
			}`}
		>
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: color }}>
        {initials}
        </div>
        <div>
        <p className="text-sm font-semibold text-gray-800">{f.parent_name}</p>
        <p className="text-xs text-gray-400">
            {f.parent_relationship ? f.parent_relationship.charAt(0).toUpperCase() + f.parent_relationship.slice(1) : 'Parent'} of {f.child_name}
        </p>
        </div>
    </div>
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{formatDateTime(f.feedback_date)}</span>
        {SENTIMENT_ICONS[f.completion_status] || (
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        )}
    </div>
    </div>

    {/* Session Activity */}
    <div className="bg-gray-50 rounded-xl p-3 mb-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Session Activity</p>
    <div className="flex items-center gap-2">
        {STATUS_ICONS[f.completion_status]}
        <span className="text-sm font-medium text-gray-700">{f.exercise_title}</span>
        {f.completion_status === 'skipped' && (
        <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs font-semibold rounded-full">SKIPPED</span>
        )}
        {f.completion_status === 'partially_completed' && (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full">PARTIAL</span>
        )}
    </div>
    </div>

      {/* Parent Notes */}
    <div>
    {f.parent_notes && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">
        "{f.parent_notes}"
        </p>
    )}
    </div>

      {/* Media */}
      {f.parent_media_url && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Media Submission</p>
          <div className="rounded-xl overflow-hidden bg-gray-100 h-64">
            {f.parent_media_url.match(/\.(mp4|mov|webm)$/i) ? (
              <video src={f.parent_media_url} className="w-full h-full object-cover" controls />
            ) : f.parent_media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={f.parent_media_url} alt="feedback" className="w-full h-full object-cover" />
            ) : (
              <a href={f.parent_media_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 p-3 text-sm text-blue-600 hover:underline h-full">
                View Attachment
              </a>
            )}
          </div>
        </div>
      )}

      {/* Doctor Reply */}
      {f.doctor_reply && (
        <div className="bg-blue-50 border-l-4 rounded-r-xl p-3 mb-4" style={{ borderColor: '#0F4C81' }}>
          <p className="text-xs font-semibold text-gray-500 mb-1">Your Reply</p>
          <p className="text-sm text-gray-600">{f.doctor_reply}</p>
        </div>
      )}

      {/* Reply Box */}
      {isReplying && (
        <div className="mb-4">
          <textarea
            placeholder="Write your reply..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={() => { setReplyingTo(null); setReplyText('') }}
              className="text-xs text-gray-400 hover:text-gray-600 transition">
              Cancel
            </button>
            <button onClick={() => handleReply(f.id)} disabled={sendingReply}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
			<div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100 mt-auto">
			<button
					onClick={() => { setReplyingTo(f.id); setReplyText(f.doctor_reply || '') }}
					className="text-sm font-medium hover:underline transition"
					style={{ color: '#0F4C81' }}
			>
					{f.doctor_reply ? 'Edit Reply' : 'Reply'}
			</button>
			<button
					onClick={() => navigate(`/patients/${f.child_id}`)}
					className="text-sm font-medium hover:underline transition"
					style={{ color: '#0F4C81' }}
			>
					View Patient File
			</button>
			</div>

			</div>
  )
}