import { useState } from 'react'
import ArticlesView from './components/ArticlesView'
import '../../design-system/notes.css'
import '../../design-system/articles.css'
const sampleArticles = [
  { id: 'article-1', title: 'أنشطة منزلية لتنمية التوازن', summary: 'خطوات بسيطة يمكن للأسرة تنفيذها في المنزل لدعم مهارات التوازن تدريجيًا.', article_url: 'https://example.com/balance', created_at: '2026-10-15T10:00:00Z' },
  { id: 'article-2', title: 'كيف نشجع الطفل على الاستمرار في التمارين؟', summary: 'أفكار عملية لتنظيم وقت التمرين وإضافة التشجيع واللعب إلى الروتين اليومي.', article_url: 'https://example.com/exercises', created_at: '2026-10-08T10:00:00Z' },
  { id: 'article-3', title: 'الاستعداد لجلسة المتابعة', summary: 'ما الذي يفيد الأسرة تدوينه قبل موعد المتابعة مع الأخصائي؟', article_url: 'https://example.com/follow-up', created_at: '2026-09-30T10:00:00Z' },
]
export default function ArticlesDesignPreview({ filled, role }) {
  const [articles, setArticles] = useState(filled ? sampleArticles : [])
  return <ArticlesView articles={articles} canPublish canDelete={role === 'admin'} onAddArticle={async form => setArticles(current => [{ id: `article-${Date.now()}`, ...form, summary: form.description, created_at: new Date().toISOString() }, ...current])} onDeleteArticle={async id => setArticles(current => current.filter(article => article.id !== id))} />
}
