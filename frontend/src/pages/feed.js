import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { Home, MapPin, LayoutGrid, Bell } from 'lucide-react'

const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return new Date(date).toLocaleDateString()
}

// Reusable avatar — shows photo if available, else initial letter
const Avatar = ({ user: u, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[9px]' : size === 'xs' ? 'w-5 h-5 text-[9px]' : 'w-8 h-8 text-xs'
  const roleColor = u?.role === 'professor' ? 'bg-amber-600' : u?.role === 'alumni' ? 'bg-green-700' : 'bg-blue-600'
  if (u?.avatarUrl) {
    return <img src={u.avatarUrl} alt={u.name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${roleColor}`}>
      {u?.name?.[0]}
    </div>
  )
}

const renderWithMentions = (text) => {
  if (!text) return null
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-blue-400 font-medium cursor-pointer hover:underline">{part}</span>
      : part
  )
}

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
    const spaceAfter = value.indexOf(' ', lastAtIndex)
    const prefix = value.slice(0, lastAtIndex)
    const suffix = spaceAfter !== -1 ? value.slice(spaceAfter) : ''
    setValue(`${prefix}@${name.replace(/\s+/g, '')} ${suffix}`)
    setShowMentions(false)
    setMentionResults([])
  }

  return { handleChange, showMentions, mentionResults, selectMention, setShowMentions }
}

export default function Feed() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const profileDropdownRef = useRef(null)

  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [newPost, setNewPost] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [posting, setPosting] = useState(false)

  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [pages, setPages] = useState([])
  const [announcement, setAnnouncement] = useState({
    textContent: '', pageId: '', scope: 'all', years: [], programs: ''
  })

  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const [commentMentionState, setCommentMentionState] = useState({})

  const postMention = useMentionInput(newPost, setNewPost)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    const parsed = JSON.parse(userData)
    setUser(parsed)
    fetchFeed()
    fetchTrending()
    if (parsed.role === 'professor') fetchMyPages()
    // Fetch unread notification count
    api.get('/notifications/unread').then(res => setUnreadCount(res.data.count)).catch(() => {})

    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchFeed = async (tag = null) => {
    setLoading(true)
    try {
      const res = await api.get(tag ? `/posts?hashtag=${tag}` : '/posts')
      setPosts(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
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
      fetchTrending()
    } catch (err) { console.error(err) } finally { setPosting(false) }
  }

  const handleAnnouncement = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      const payload = {
        textContent: announcement.textContent,
        type: 'announcement',
        pageId: announcement.pageId || null,
        audience: {
          scope: announcement.scope,
          years: announcement.years.map(Number),
          programs: announcement.programs ? [announcement.programs] : []
        }
      }
      const res = await api.post('/posts', payload)
      setPosts([res.data, ...posts])
      setAnnouncement({ textContent: '', pageId: '', scope: 'all', years: [], programs: '' })
      setShowAnnouncement(false)
    } catch (err) { console.error(err) } finally { setPosting(false) }
  }

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`)
      setPosts(posts.map(p =>
        p._id === postId
          ? { ...p, votes: { ...p.votes, upvotes: res.data.upvotes.map(id => ({ _id: id })), score: res.data.score } }
          : p
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
      setCommentMentionState(prev => ({ ...prev, [postId]: { show: false, results: [] } }))
    } catch (err) { console.error(err) }
  }

  const handleCommentChange = async (postId, val) => {
    setCommentText(prev => ({ ...prev, [postId]: val }))
    const lastAt = val.lastIndexOf('@')
    if (lastAt !== -1) {
      const query = val.slice(lastAt + 1).split(' ')[0]
      if (query.length > 0) {
        try {
          const res = await api.get(`/auth/users/search?q=${query}`)
          setCommentMentionState(prev => ({ ...prev, [postId]: { show: true, results: res.data } }))
        } catch { }
      } else {
        setCommentMentionState(prev => ({ ...prev, [postId]: { show: false, results: [] } }))
      }
    } else {
      setCommentMentionState(prev => ({ ...prev, [postId]: { show: false, results: [] } }))
    }
  }

  const selectCommentMention = (postId, name) => {
    const val = commentText[postId] || ''
    const lastAt = val.lastIndexOf('@')
    setCommentText(prev => ({ ...prev, [postId]: val.slice(0, lastAt) + `@${name.replace(/\s+/g, '')} ` }))
    setCommentMentionState(prev => ({ ...prev, [postId]: { show: false, results: [] } }))
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err) { console.error(err) }
  }

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      const res = await api.delete(`/posts/${postId}/comments/${commentId}`)
      setPosts(posts.map(p => p._id === postId ? res.data : p))
    } catch (err) { console.error(err) }
  }

  const copyToClipboard = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
    alert('Link copied!')
  }

  const isPostOwner = (post) => {
    const authorId = post.authorId?._id || post.authorId
    return authorId === user?.id
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading && posts.length === 0) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-gray-500">Loading...</div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold text-white uppercase tracking-tighter cursor-pointer shrink-0" onClick={() => fetchFeed()}>
          CampusConnect
        </h1>

        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => fetchFeed()} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
            <Home size={13} /> Feed
          </button>
          <Link href="/map" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
            <MapPin size={13} /> Find a Place
          </Link>
          <Link href="/timetable" className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
            <LayoutGrid size={13} /> Services
          </Link>
          <Link href="/notifications" className="relative flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
            <Bell size={13} /> Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'professor' && (
            <button onClick={() => setShowAnnouncement(!showAnnouncement)} className="text-[10px] font-bold text-amber-500 border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 rounded-full hover:bg-amber-500 hover:text-black transition">
              {showAnnouncement ? '✕ CANCEL' : '+ ANNOUNCEMENT'}
            </button>
          )}

          <div className="relative" ref={profileDropdownRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
              <Avatar user={user} size="sm" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
              <span className="text-gray-600 text-[10px]">▾</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#111113] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-xs text-gray-300 hover:bg-white/5 transition">
                  👤 Your Profile
                </Link>
                <div className="border-t border-white/5" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-500/80 hover:bg-red-500/5 hover:text-red-400 transition">
                  → Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        <main>
          {/* Announcement Form */}
          {user?.role === 'professor' && showAnnouncement && (
            <div className="bg-[#111113] border border-amber-500/30 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-4">Targeted Announcement</h2>
              <div className="space-y-4">
                <select className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-amber-500/50" onChange={(e) => setAnnouncement({...announcement, pageId: e.target.value})}>
                  <option value="">Post from Profile</option>
                  {pages.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
                <textarea className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none min-h-[100px] resize-none" placeholder="Official details..." value={announcement.textContent} onChange={(e) => setAnnouncement({...announcement, textContent: e.target.value})} />
                <div className="flex items-center gap-4 py-2 border-y border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Audience</span>
                  <div className="flex gap-2">
                    {['all', 'targeted'].map(s => (
                      <button key={s} onClick={() => setAnnouncement({...announcement, scope: s})} className={`text-[10px] px-4 py-1 rounded-full transition ${announcement.scope === s ? 'bg-amber-500 text-black font-bold' : 'text-gray-500 bg-white/5'}`}>
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {announcement.scope === 'targeted' && (
                  <div className="p-4 bg-black/40 rounded-xl">
                    <div className="flex gap-2">
                      {[1,2,3].map(y => (
                        <button key={y} onClick={() => setAnnouncement(prev => ({...prev, years: prev.years.includes(y) ? prev.years.filter(i=>i!==y) : [...prev.years, y]}))} className={`flex-1 py-2 text-[10px] rounded border transition ${announcement.years.includes(y) ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-white/5 text-gray-600'}`}>
                          Year {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleAnnouncement} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-[11px] transition">PUBLISH ANNOUNCEMENT</button>
              </div>
            </div>
          )}

          {/* Post Composer */}
          {(!showAnnouncement || user?.role !== 'professor') && (
            <div className="bg-[#111113] border border-white/5 rounded-2xl p-4 mb-8 relative">
              <textarea className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder-gray-600 min-h-[60px] resize-none outline-none" placeholder={user?.role === 'professor' ? "Share a general update... Use # or @" : "What's on your mind? Use #hashtags or @mention"} value={newPost} onChange={postMention.handleChange} onBlur={() => setTimeout(() => postMention.setShowMentions(false), 150)} />

              {postMention.showMentions && postMention.mentionResults.length > 0 && (
                <div className="absolute left-4 top-20 z-50 w-56 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {postMention.mentionResults.map(u => (
                    <button key={u._id} onMouseDown={() => postMention.selectMention(u.name)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left">
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white ${u.role === 'professor' ? 'bg-amber-600' : u.role === 'alumni' ? 'bg-green-700' : 'bg-blue-600'}`}>
                        {u.name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-200">{u.name}</p>
                        <p className="text-[9px] text-gray-500 uppercase">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {mediaPreview && (
                <div className="relative mb-4 rounded-xl overflow-hidden max-h-60 border border-white/10">
                  <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => {setMediaPreview(null); setMediaFile(null)}} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-xs">✕</button>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-white/5 rounded-lg transition grayscale hover:grayscale-0">🖼️</button>
                <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) { setMediaFile(file); setMediaPreview(URL.createObjectURL(file)) }
                }} />
                <button onClick={handlePost} disabled={posting || (!newPost.trim() && !mediaFile)} className="bg-white text-black px-6 py-1.5 rounded-full text-[11px] font-bold hover:bg-gray-200 disabled:opacity-20 transition">
                  {posting ? 'POSTING...' : 'POST'}
                </button>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className={`bg-[#111113] border rounded-2xl p-5 transition-all ${post.type === 'announcement' ? 'border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.03)]' : 'border-white/5'}`}>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={post.authorId} size="md" />
                    <div>
                      <p className="text-xs font-bold">{post.authorId?.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-tighter">{post.authorId?.role} • {formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.type === 'announcement' && <span className="text-[9px] font-black text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">Official</span>}
                    {isPostOwner(post) && <button onClick={() => handleDeletePost(post._id)} className="text-[9px] text-gray-600 hover:text-red-500 transition px-1">🗑</button>}
                  </div>
                </div>

                {post.textContent && <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{renderWithMentions(post.textContent)}</p>}

                {post.mediaUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black">
                    {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full max-h-[400px] object-contain" controls /> : <img src={post.mediaUrl} className="w-full max-h-[400px] object-contain" alt="" />}
                  </div>
                )}

                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map(tag => (
                      <button key={tag._id} onClick={() => fetchFeed(tag.label)} className="text-[11px] text-blue-400 hover:underline">#{tag.label}</button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button onClick={() => handleLike(post._id)} className={`text-[11px] flex items-center gap-1.5 transition ${post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-white'}`}>
                    {post.votes?.upvotes?.some(v => (v._id || v) === user?.id) ? '❤️' : '🤍'} {post.votes?.upvotes?.length || 0}
                  </button>
                  <button onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })} className="text-[11px] text-gray-500 hover:text-white flex items-center gap-1.5 transition">
                    💬 {post.comments?.length || 0}
                  </button>
                  <button onClick={() => copyToClipboard(post._id)} className="text-[11px] text-gray-500 hover:text-blue-400 flex items-center gap-1.5 transition ml-auto">🔗 Share</button>
                </div>

                {expandedComments[post._id] && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="space-y-3 mb-4">
                      {post.comments?.map((c) => (
                        <div key={c._id} className="flex gap-2 group">
                          <div className="w-5 h-5 rounded bg-gray-800 text-[8px] flex items-center justify-center shrink-0">{c.authorName?.[0]}</div>
                          <div className="bg-white/5 p-2 rounded-lg flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-[10px] font-bold text-gray-400">{c.authorName}</p>
                              {(c.authorId === user?.id || isPostOwner(post)) && <button onClick={() => handleDeleteComment(post._id, c._id)} className="text-[9px] text-gray-700 hover:text-red-500 transition opacity-0 group-hover:opacity-100">🗑</button>}
                            </div>
                            <p className="text-xs text-gray-300">{renderWithMentions(c.textContent)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Write a reply..." className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500/50" value={commentText[post._id] || ''} onChange={(e) => handleCommentChange(post._id, e.target.value)} onBlur={() => setTimeout(() => setCommentMentionState(prev => ({ ...prev, [post._id]: { show: false, results: [] } })), 200)} onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)} />
                        <button onClick={() => handleComment(post._id)} className="text-[10px] font-bold text-blue-500">SEND</button>
                      </div>

                      {commentMentionState[post._id]?.show && commentMentionState[post._id]?.results?.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-0 z-50 w-56 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                          {commentMentionState[post._id].results.map(u => (
                            <button key={u._id} onMouseDown={() => selectCommentMention(post._id, u.name)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left">
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white ${u.role === 'professor' ? 'bg-amber-600' : u.role === 'alumni' ? 'bg-green-700' : 'bg-blue-600'}`}>
                                {u.name?.[0]}
                              </div>
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
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Trending Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 mb-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Trending Now
              </h3>
              <div className="space-y-4">
                {trending.length === 0 ? <p className="text-[10px] text-gray-600 italic">No trends yet...</p> : trending.map(tag => (
                  <div key={tag._id} onClick={() => fetchFeed(tag.label)} className="group flex justify-between items-center py-1 cursor-pointer">
                    <span className="text-xs text-gray-400 group-hover:text-blue-400 transition">#{tag.label}</span>
                    <span className="text-[10px] font-mono text-gray-700">{tag.postCount} posts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 text-[9px] text-gray-700 flex flex-wrap gap-x-4 gap-y-2 uppercase font-bold">
              <Link href="/profile" className="hover:text-gray-400">Profile</Link>
              <span>© 2026 CampusConnect</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}