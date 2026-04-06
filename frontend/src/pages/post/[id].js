import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import api from '../../utils/api'

const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

const Avatar = ({ user: u, size = 9 }) => {
  const roleColor = u?.role === 'professor' ? 'bg-amber-600' : u?.role === 'alumni' ? 'bg-green-700' : 'bg-blue-600'
  
  // Dynamic tailwind classes for size
  const sizeClass = `w-${size} h-${size}`

  if (u?.avatarUrl) {
    return <img src={u.avatarUrl} alt={u.name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${roleColor} text-[10px]`}>
      {u?.name?.[0]}
    </div>
  )
}

const renderWithMentions = (text, onMentionClick) => {
  if (!text) return null
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-blue-400 font-medium cursor-pointer hover:underline" onClick={() => onMentionClick?.(part)}>{part}</span>
      : part
  )
}

// @ mention hook — same as feed.js
function useMentionInput(value, setValue) {
  const [mentionResults, setMentionResults] = useState([])
  const [showMentions, setShowMentions] = useState(false)
  const debounceRef = useRef(null)

  const handleChange = (e) => {
    const val = e.target.value
    setValue(val)
    const lastAtIndex = val.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const query = val.slice(lastAtIndex + 1).split(' ')[0]
      if (query.length > 0) {
        setShowMentions(true)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await api.get(`/auth/users/search?q=${query}`)
            setMentionResults(res.data)
          } catch { setMentionResults([]) }
        }, 300)
      } else { setShowMentions(false) }
    } else { setShowMentions(false) }
  }

  const selectMention = (name) => {
    const lastAtIndex = value.lastIndexOf('@')
    const prefix = value.slice(0, lastAtIndex)
    setValue(`${prefix}@${name.replace(/\s+/g, '')} `)
    setShowMentions(false)
    setMentionResults([])
  }

  return { handleChange, showMentions, mentionResults, selectMention, setShowMentions }
}

export default function PostPage() {
  const router = useRouter()
  const { id, scrollComments } = router.query
  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newCommentId, setNewCommentId] = useState(null)
  const commentsRef = useRef(null)
  const commentRefs = useRef({})

  const mention = useMentionInput(commentText, setCommentText)

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    if (!id) return
    fetchPost()
  }, [id])

  useEffect(() => {
    if (!scrollComments || !post) return
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }, [scrollComments, post])

  useEffect(() => {
    if (!newCommentId) return
    const el = commentRefs.current[newCommentId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('comment-blink')
      setTimeout(() => el.classList.remove('comment-blink'), 2000)
    }
    setNewCommentId(null)
  }, [newCommentId, post])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/posts/${id}`)
      setPost(res.data)
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setPost(null)
      setErrorMessage(err.response?.data?.message || 'Post not found.')
    } finally { setLoading(false) }
  }

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`)
      setPost(prev => ({ ...prev, votes: { ...prev.votes, upvotes: res.data.upvotes, score: res.data.score } }))
    } catch (err) { console.error(err) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { textContent: commentText })
      setPost(res.data)
      const lastComment = res.data.comments?.[res.data.comments.length - 1]
      if (lastComment?._id) setNewCommentId(lastComment._id)
      setCommentText('')
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      const res = await api.delete(`/posts/${post._id}/comments/${commentId}`)
      setPost(res.data)
    } catch (err) { console.error(err) }
  }

  const isPostOwner = post && (post.authorId?._id === user?.id || post.authorId === user?.id)

  const handleMentionClick = async (mention) => {
    const handle = mention.slice(1).toLowerCase()
    try {
      const res = await api.get(`/auth/users/mention/${handle}`)
      router.push(`/profile/${res.data._id}`)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.4)] shrink-0">
            <span className="text-[10px] font-black text-white leading-none">U</span>
            <span className="text-[5.5px] font-black text-indigo-200 tracking-widest leading-none mt-0.5">NM</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">UniMeConnect</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest mb-6 transition">
          <ArrowLeft size={13} /> Back
        </button>

        {loading && (
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/5" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-white/5 rounded w-1/3" />
                <div className="h-2 bg-white/5 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        )}

        {!loading && !post && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">{errorMessage || 'Post not found.'}</p>
            <Link href="/feed" className="text-blue-400 text-xs mt-2 inline-block">← Back to feed</Link>
          </div>
        )}

        {!loading && post && (
          <>
            {/* Post card */}
            <div className={`bg-[#111113] border rounded-2xl p-5 mb-4 ${post.type === 'announcement' ? 'border-amber-500/20' : 'border-white/5'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar user={post.authorId} size={9} />
                <div className="flex-1">
                  <p className="text-sm font-bold">{post.authorId?.name}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-tighter">{post.authorId?.role} · {formatTime(post.createdAt)}</p>
                </div>
                {post.type === 'announcement' && (
                  <span className="text-[9px] font-black text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase">Official</span>
                )}
              </div>

              {post.textContent && (
                <p className="text-sm text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap">{renderWithMentions(post.textContent, handleMentionClick)}</p>
              )}

              {post.mediaUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black">
                  {post.mediaType === 'video'
                    ? <video src={post.mediaUrl} className="w-full max-h-[400px] object-contain" controls />
                    : <img src={post.mediaUrl} className="w-full max-h-[400px] object-contain" alt="" />
                  }
                </div>
              )}

              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.hashtags.map(tag => <span key={tag._id} className="text-[11px] text-blue-400">#{tag.label}</span>)}
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <button onClick={handleLike} className={`text-[11px] flex items-center gap-1.5 transition ${post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-white'}`}>
                  {post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? '❤️' : '🤍'} {post.votes?.upvotes?.length || 0}
                </button>
                <button onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] text-gray-500 hover:text-white flex items-center gap-1.5 transition">
                  💬 {post.comments?.length || 0}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }} className="text-[11px] text-gray-500 hover:text-blue-400 flex items-center gap-1.5 transition ml-auto">
                  🔗 Share
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div ref={commentsRef} className="bg-[#111113] border border-white/5 rounded-2xl p-5">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                {post.comments?.length || 0} {post.comments?.length === 1 ? 'Reply' : 'Replies'}
              </h2>

              {post.comments?.length === 0 && (
                <p className="text-[11px] text-gray-700 italic text-center py-4 mb-4">No replies yet — be the first!</p>
              )}

              {post.comments?.length > 0 && (
                <div className="space-y-3 mb-5">
                  {post.comments.map((c) => (
                    <div key={c._id} ref={el => commentRefs.current[c._id] = el} className="flex gap-3 group rounded-xl p-1.5 transition-all">
                      {/* Fixed: Wrapped comment avatar in the circular Avatar component */}
                      <Avatar user={{ name: c.authorName, role: c.authorRole, avatarUrl: c.authorAvatarUrl }} size={8} />
                      <div className="bg-white/5 p-2.5 rounded-xl flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-gray-300">{c.authorName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] text-gray-700">{formatTime(c.createdAt)}</p>
                            {(c.authorId === user?.id || isPostOwner) && (
                              <button onClick={() => handleDeleteComment(c._id)} className="text-[9px] text-gray-700 hover:text-red-500 transition opacity-0 group-hover:opacity-100">🗑</button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-300">{renderWithMentions(c.textContent, handleMentionClick)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input with @ mention — BELOW comments */}
              <div className="relative pt-4 border-t border-white/5">
                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply... Use @mention"
                    value={commentText}
                    onChange={mention.handleChange}
                    onBlur={() => setTimeout(() => mention.setShowMentions(false), 150)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment(e)}
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500/40 placeholder-gray-600"
                  />
                  <button type="submit" disabled={submitting || !commentText.trim()} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition disabled:opacity-30">
                    SEND
                  </button>
                </form>

                {/* @ mention dropdown */}
                {mention.showMentions && mention.mentionResults.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 z-50 w-56 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {mention.mentionResults.map(u => (
                      <button key={u._id} onMouseDown={() => mention.selectMention(u.name)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left">
                        <Avatar user={u} size={5} />
                        <div>
                          <p className="text-xs font-medium text-gray-200">{u.name}</p>
                          <p className="text-[9px] text-gray-500 uppercase">{u.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes commentBlink {
          0%   { background: rgba(59,130,246,0); }
          25%  { background: rgba(59,130,246,0.15); }
          50%  { background: rgba(59,130,246,0); }
          75%  { background: rgba(59,130,246,0.15); }
          100% { background: rgba(59,130,246,0); }
        }
        .comment-blink {
          animation: commentBlink 1.2s ease-in-out;
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}