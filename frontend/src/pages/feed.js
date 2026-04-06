import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { programmes } from '../utils/unime_data'

const programmeYearLookup = [...programmes.bachelors, ...programmes.masters, ...programmes.singleCycle]
  .reduce((acc, p) => ({ ...acc, [p.name]: p.years }), {})
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Skeleton } from '../components/ui/Skeleton'
import { Heart, MessageCircle, Share2, Trash2, Image as ImageIcon, Send, Sparkles } from 'lucide-react'

// Reusable avatar
const Avatar = ({ user: u, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'xs' ? 'w-5 h-5 text-[9px]' : 'w-10 h-10 text-sm'
  const roleColor = u?.role === 'professor' ? 'bg-indigo-600' : u?.role === 'alumni' ? 'bg-emerald-600' : 'bg-blue-600'
  if (u?.avatarUrl) {
    return <img src={u.avatarUrl} alt={u.name} className={`${sizeClass} rounded-full object-cover shrink-0 shadow-md`} />
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md ${roleColor}`}>
      {u?.name?.[0]}
    </div>
  )
}

const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

const renderWithMentions = (text, onMentionClick) => {
  if (!text) return null
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-indigo-400 font-medium cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); onMentionClick?.(part) }}>{part}</span>
      : part
  )
}

export default function Feed() {
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [newPost, setNewPost] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [posting, setPosting] = useState(false)

  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [pages, setPages] = useState([])
  const [announcement, setAnnouncement] = useState({ textContent: '', pageId: '', scope: 'all', years: [], programs: '' })

  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    const parsed = JSON.parse(userData)
    setUser(parsed)
    fetchFeed()
    fetchTrending()
    if (parsed.role === 'professor') fetchMyPages()
  }, [])

  const fetchFeed = async (tag = null) => {
    setLoading(true)
    try {
      const res = await api.get(tag ? `/posts?hashtag=${tag}` : '/posts')
      setPosts(res.data)
    } catch (err) { toast.error('Failed to load feed') } finally { setLoading(false) }
  }

  const fetchTrending = async () => {
    try {
      const res = await api.get('/posts/trending')
      setTrending(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchMyPages = async () => {
    try {
      const res = await api.get('/pages/my')
      setPages(res.data)
    } catch (err) { console.error(err) }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim() && !mediaFile) return
    setPosting(true)
    try {
      let mediaData = {}
      if (mediaFile) {
        const formData = new FormData()
        formData.append('media', mediaFile)
        const uploadRes = await api.post('/upload', formData)
        mediaData = { mediaUrl: uploadRes.data.url, mediaType: uploadRes.data.mediaType }
      }
      const res = await api.post('/posts', { textContent: newPost, type: 'post', ...mediaData })
      setPosts([res.data, ...posts])
      setNewPost(''); setMediaFile(null); setMediaPreview(null)
      toast.success('Posted successfully')
      fetchTrending()
    } catch (err) { toast.error('Failed to post') } finally { setPosting(false) }
  }

  const handleAnnouncement = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      const payload = {
        textContent: announcement.textContent,
        type: 'announcement',
        pageId: announcement.pageId || null,
        audience: { scope: announcement.scope, years: announcement.years.map(Number), programs: announcement.programs ? [announcement.programs] : [] }
      }
      const res = await api.post('/posts', payload)
      setPosts([res.data, ...posts])
      setAnnouncement({ textContent: '', pageId: '', scope: 'all', years: [], programs: '' })
      setShowAnnouncement(false)
      toast.success('Announcement published')
    } catch (err) { toast.error('Failed to publish announcement') } finally { setPosting(false) }
  }

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`)
      setPosts(posts.map(p =>
        p._id === postId ? { ...p, votes: { ...p.votes, upvotes: res.data.upvotes.map(id => ({ _id: id })), score: res.data.score } } : p
      ))
    } catch (err) { console.error(err) }
  }

  const handleComment = async (postId) => {
    const text = commentText[postId]
    if (!text?.trim()) return
    try {
      const res = await api.post(`/posts/${postId}/comments`, { textContent: text })
      setPosts(posts.map(p => p._id === postId ? res.data : p))
      setCommentText({ ...commentText, [postId]: '' })
      toast.success('Comment added')
    } catch (err) { toast.error('Failed to comment') }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
      toast.success('Post deleted')
    } catch (err) { toast.error('Failed to delete post') }
  }

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      const res = await api.delete(`/posts/${postId}/comments/${commentId}`)
      setPosts(posts.map(p => p._id === postId ? res.data : p))
    } catch (err) { console.error(err) }
  }

  const handleMentionClick = async (mention) => {
    const handle = mention.slice(1).toLowerCase()
    try {
      const res = await api.get(`/auth/users/mention/${handle}`)
      router.push(`/profile/${res.data._id}`)
    } catch {}
  }

  const copyToClipboard = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
    toast.success('Link copied!')
  }

  const isPostOwner = (post) => {
    const authorId = post.authorId?._id || post.authorId
    return authorId === user?.id
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <main className="space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Community Feed</h1>
          <p className="text-zinc-400">See what&apos;s happening around campus.</p>
        </header>

        {/* Announcement Form Toggle for Professors */}
        {user?.role === 'professor' && (
          <div className="flex justify-end mb-4">
             <button onClick={() => setShowAnnouncement(!showAnnouncement)} className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full transition-colors">
               <Sparkles size={14} />
               {showAnnouncement ? 'Cancel Announcement' : 'New Announcement'}
             </button>
          </div>
        )}

        <AnimatePresence>
          {showAnnouncement && user?.role === 'professor' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass rounded-3xl p-6 shadow-2xl overflow-hidden mb-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Targeted Announcement</h2>
              <div className="space-y-4">
                <select className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/50" onChange={(e) => setAnnouncement({...announcement, pageId: e.target.value})}>
                  <option value="">Post from Profile</option>
                  {pages.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
                <textarea className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none min-h-[120px] resize-none focus:border-indigo-500/50" placeholder="Official details..." value={announcement.textContent} onChange={(e) => setAnnouncement({...announcement, textContent: e.target.value})} />
                <div className="flex flex-wrap items-center gap-4 py-3 border-y border-white/5">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Audience Scope:</span>
                  <div className="flex gap-2">
                    {['all', 'targeted'].map(s => (
                      <button key={s} onClick={() => setAnnouncement({...announcement, scope: s})} className={`text-xs px-4 py-1.5 rounded-full transition-all font-semibold ${announcement.scope === s ? 'bg-indigo-600 text-white' : 'text-zinc-400 bg-white/5 hover:bg-white/10'}`}>
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {announcement.scope === 'targeted' && (() => {
                  const selPage = pages.find(p => p._id === announcement.pageId)
                  const yCount = programmeYearLookup[selPage?.targetProgram] || 3
                  return (
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase">
                        Target Years {selPage?.targetProgram ? `— ${selPage.targetProgram}` : ''}
                      </p>
                      <div className="flex gap-2">
                        {Array.from({ length: yCount }, (_, i) => i + 1).map(y => (
                          <button key={y} onClick={() => setAnnouncement(prev => ({...prev, years: prev.years.includes(y) ? prev.years.filter(i=>i!==y) : [...prev.years, y]}))} className={`flex-1 py-2 text-xs rounded-lg transition-all font-semibold ${announcement.years.includes(y) ? 'bg-indigo-500 border border-indigo-400 text-white' : 'border border-white/5 text-zinc-500 hover:bg-white/5'}`}>
                            Year {y}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <button onClick={handleAnnouncement} disabled={posting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50">PUBLISH ANNOUNCEMENT</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post Composer */}
        {(!showAnnouncement || user?.role !== 'professor') && (
          <div className="glass rounded-3xl p-5 shadow-lg relative border border-white/5 mb-8">
            <div className="flex gap-4">
              <Avatar user={user} size="md" />
              <div className="flex-1">
                <textarea 
                  className="w-full bg-transparent border-none text-zinc-100 text-[15px] focus:ring-0 placeholder-zinc-500 min-h-[60px] resize-none outline-none leading-relaxed" 
                  placeholder={user?.role === 'professor' ? "Share an update with your students..." : "What's on your mind? Share thoughts, questions, or updates."} 
                  value={newPost} 
                  onChange={(e) => setNewPost(e.target.value)} 
                />
                
                {mediaPreview && (
                  <div className="relative mb-4 mt-2 rounded-2xl overflow-hidden max-h-80 border border-white/10 bg-zinc-950">
                    <img src={mediaPreview} className="w-full h-full object-contain" alt="Preview" />
                    <button onClick={() => {setMediaPreview(null); setMediaFile(null)}} className="absolute top-3 right-3 bg-zinc-900/80 hover:bg-zinc-900 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors">
                      <ImageIcon size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) { setMediaFile(file); setMediaPreview(URL.createObjectURL(file)) }
                    }} />
                  </div>
                  <button onClick={handlePost} disabled={posting || (!newPost.trim() && !mediaFile)} className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all flex items-center gap-2">
                    {posting ? 'Posting...' : <><Send size={16} /> Post</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Posts */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.article 
                  key={post._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass rounded-3xl p-6 transition-all border ${post.type === 'announcement' ? 'border-indigo-500/30 shadow-[0_4px_30px_rgba(79,70,229,0.1)]' : 'border-white/5'} hover:border-white/10`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={post.authorId} size="md" />
                      <div>
                        <Link href={`/profile/${post.authorId?._id}`} className="text-[15px] font-bold text-zinc-100 hover:text-indigo-400 transition-colors">
                          {post.authorId?.name}
                        </Link>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          <span className="capitalize">{post.authorId?.role}</span> • {formatTime(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.type === 'announcement' && (
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Official Announcement
                        </span>
                      )}
                      {isPostOwner(post) && (
                        <button onClick={() => handleDeletePost(post._id)} className="text-zinc-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition border border-transparent">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {post.textContent && (
                    <p className="text-[15px] text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap font-sans">
                      {renderWithMentions(post.textContent, handleMentionClick)}
                    </p>
                  )}

                  {post.mediaUrl && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-white/5 bg-black/50 aspect-video relative">
                      {post.mediaType === 'video' 
                        ? <video src={post.mediaUrl} className="w-full h-full object-cover" controls /> 
                        : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Post attachment" />}
                    </div>
                  )}

                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {post.hashtags.map(tag => (
                        <button key={tag._id} onClick={() => fetchFeed(tag.label)} className="text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full transition-colors">
                          #{tag.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-sm font-medium">
                    <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 transition-colors ${post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-400'}`}>
                      <Heart size={18} fill={post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? 'currentColor' : 'none'} />
                      <span>{post.votes?.upvotes?.length || 0}</span>
                    </button>
                    <button onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })} className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors">
                      <MessageCircle size={18} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    <button onClick={() => copyToClipboard(post._id)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors ml-auto">
                      <Share2 size={18} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments[post._id] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5 pt-5 border-t border-white/5 overflow-hidden">
                        <div className="space-y-4 mb-4">
                          {post.comments?.map((c) => (
                            <div key={c._id} className="flex gap-3 group">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 text-xs flex items-center justify-center font-bold text-white shrink-0 mt-0.5">{c.authorName?.[0]}</div>
                              <div className="bg-white/5 rounded-2xl rounded-tl-none p-3.5 flex-1 relative border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-bold text-zinc-200">{c.authorName}</p>
                                  {(c.authorId === user?.id || isPostOwner(post)) && (
                                    <button onClick={() => handleDeleteComment(post._id, c._id)} className="text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 absolute top-3 right-3">
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed">{renderWithMentions(c.textContent, handleMentionClick)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Avatar user={user} size="sm" />
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              placeholder="Add a comment..." 
                              className="w-full bg-zinc-900/50 border border-white/10 rounded-full px-5 py-2.5 text-sm outline-none focus:border-indigo-500/50 pr-12 transition-colors" 
                              value={commentText[post._id] || ''} 
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))} 
                              onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)} 
                            />
                            <button onClick={() => handleComment(post._id)} disabled={!commentText[post._id]?.trim()} className="absolute right-2 top-1.5 bottom-1.5 p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-full disabled:opacity-50 transition-colors">
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              ))}
            </AnimatePresence>
            {!loading && posts.length === 0 && (
              <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-white/5 rounded-3xl">
                No posts to show yet. Be the first to start a conversation!
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Trending Sidebar */}
      <aside className="hidden lg:block relative z-0">
        <div className="sticky top-8">
          <div className="glass rounded-3xl p-6 mb-6">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.8)]"></span> Trending Topics
            </h3>
            <div className="space-y-1">
              {trending.length === 0 ? <p className="text-sm text-zinc-500 italic">No trends yet...</p> : trending.map((tag, idx) => (
                <button key={tag._id} onClick={() => fetchFeed(tag.label)} className="w-full group flex justify-between items-center py-2 px-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-bold text-xs">{idx + 1}</span>
                    <span className="text-[15px] font-semibold text-zinc-300 group-hover:text-indigo-400 transition-colors">#{tag.label}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-600 bg-black/30 px-2 py-0.5 rounded-md">{tag.postCount}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-2 uppercase font-semibold">
            <Link href="/profile" className="hover:text-zinc-300">Profile Settings</Link>
            <span>© 2026 UniMeConnect</span>
          </div>
        </div>
      </aside>
    </div>
  )
}