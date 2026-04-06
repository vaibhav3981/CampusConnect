import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, Camera, Trash2, LogOut, CheckCircle, Navigation, Settings } from 'lucide-react'
import api from '../utils/api'

const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Profile() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [socialCounts, setSocialCounts] = useState(null)
  
  const [form, setForm] = useState({
    bio: '', program: '', year: '', department: '', degree: '', graduationYear: '', isPrivate: false,
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const [profileRes, countsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/connections/counts'),
      ])
      setUser(profileRes.data)
      setSocialCounts(countsRes.data)
      setForm({
        bio: profileRes.data.bio || '',
        program: profileRes.data.program || '',
        year: profileRes.data.year || '',
        department: profileRes.data.department || '',
        degree: profileRes.data.degree || '',
        graduationYear: profileRes.data.graduationYear || '',
        isPrivate: Boolean(profileRes.data.isPrivate),
      })
      fetchMyPosts(profileRes.data._id)
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPosts = async (userId) => {
    try {
      const res = await api.get(`/posts/user/${userId}`)
      setPosts(res.data)
    } catch (err) {}
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', {
        bio: form.bio,
        year: form.year ? Number(form.year) : null,
        department: form.department || null,
        degree: form.degree || null,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        isPrivate: form.isPrivate,
      })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify({
        id: res.data._id, name: res.data.name, email: res.data.email,
        role: res.data.role, isVerified: res.data.isVerified,
        avatarUrl: res.data.avatarUrl, isPrivate: res.data.isPrivate,
        program: res.data.program || null, department: res.data.department || null,
        matricola: res.data.matricola || null,
      }))
      setEditing(false)
    } catch (err) {} finally { setSaving(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPic(true)
    try {
      const formData = new FormData()
      formData.append('media', file)
      const uploadRes = await api.post('/upload', formData)
      const res = await api.put('/auth/profile', { avatarUrl: uploadRes.data.url })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify({
        id: res.data._id, name: res.data.name, email: res.data.email,
        role: res.data.role, isVerified: res.data.isVerified,
        avatarUrl: res.data.avatarUrl, isPrivate: res.data.isPrivate
      }))
    } catch (err) {} finally { setUploadingPic(false) }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err) {}
  }

  const handleLogout = () => { localStorage.clear(); router.push('/login') }

  const inputClass = "w-full bg-black/40 text-white px-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all text-sm placeholder-zinc-600 shadow-inner"
  const labelClass = "text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block font-bold"
  
  const roleColor = user?.role === 'professor' ? 'bg-amber-600' : user?.role === 'alumni' ? 'bg-emerald-600' : 'bg-indigo-600'
  const roleBadge = user?.role === 'professor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : user?.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Profile</h1>
          <p className="text-zinc-400 font-medium">Manage your personal information and posts.</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="glass rounded-3xl p-8 shadow-2xl mb-10 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
          <div className="relative shrink-0 group">
            <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-2 border-white/10 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${!user?.avatarUrl ? roleColor : ''}`}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
            </div>
            <button onClick={() => fileInputRef.current.click()} disabled={uploadingPic} className="absolute inset-0 rounded-[2rem] bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity flex items-center justify-center border-2 border-indigo-500/50">
              {uploadingPic ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={24} className="text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1 text-center sm:text-left pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight">{user?.name}</h1>
              {user?.isVerified && <span className="flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-sm"><CheckCircle size={12}/> Verified</span>}
            </div>
            <p className="text-zinc-400 text-sm mb-4 font-medium">{user?.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
              <span className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest shadow-sm ${roleBadge}`}>{user?.role}</span>
              <span className="inline-block px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-zinc-300 shadow-sm">{user?.isPrivate ? 'Private Profile' : 'Public Profile'}</span>
            </div>

            {socialCounts && (
              <div className="flex items-center justify-center sm:justify-start gap-8 bg-black/20 border border-white/5 rounded-2xl p-4 inline-flex shadow-inner">
                {user?.role === 'student' ? (
                  <>
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{socialCounts.connectionsCount}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Connections</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{socialCounts.followingCount}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Following</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{socialCounts.followersCount}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Followers</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{socialCounts.followingCount}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Following</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setEditing(!editing)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 ${editing ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'}`}>
            {editing ? 'Cancel Editing' : <><Settings size={14} /> Edit Profile</>}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-black/20 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h3 className={labelClass}>Biography</h3>
                  <p className="text-zinc-300 leading-relaxed text-sm font-medium">{user?.bio || <span className="italic text-zinc-600">No biography provided yet.</span>}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user?.role === 'student' && (
                    <>
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Programme</h3><p className="text-sm font-bold text-white">{user.program || 'Not set'}</p></div>
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Year</h3><p className="text-sm font-bold text-white">{user.year ? `Year ${user.year}` : 'Not set'}</p></div>
                      {user?.matricola && (
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Matricola</h3><p className="text-sm font-bold font-mono text-indigo-400">#{user.matricola}</p></div>
                      )}
                    </>
                  )}
                  {user?.role === 'professor' && (
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Department</h3><p className="text-sm font-bold text-white">{user.department || 'Not set'}</p></div>
                  )}
                  {user?.role === 'alumni' && (
                    <>
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Degree</h3><p className="text-sm font-bold text-white">{user.degree || 'Not set'}</p></div>
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner"><h3 className={labelClass}>Graduated</h3><p className="text-sm font-bold text-white">{user.graduationYear || 'Not set'}</p></div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputClass} min-h-[100px] resize-none`} maxLength={200} placeholder="Tell people about yourself..." />
                  <p className="text-[10px] font-medium text-zinc-600 text-right mt-1">{form.bio.length}/200</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className={labelClass}>Programme</label>
                        <div className="w-full bg-black/20 text-zinc-500 px-4 py-3.5 rounded-xl border border-white/5 text-sm cursor-not-allowed select-none">
                          {user.program || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Year</label>
                        <input type="number" min="1" max="10" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} placeholder="e.g. 2" />
                      </div>
                    </>
                  )}
                  {user?.role === 'professor' && (
                    <div className="col-span-full"><label className={labelClass}>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} placeholder="e.g. DIECII" /></div>
                  )}
                  {user?.role === 'alumni' && (
                    <>
                      <div><label className={labelClass}>Degree</label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className={inputClass} placeholder="e.g. BSc Data Analysis" /></div>
                      <div><label className={labelClass}>Graduation Year</label><input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} className={inputClass} placeholder="e.g. 2022" /></div>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-4 flex items-center justify-between shadow-inner">
                  <div>
                    <label className="text-sm font-bold text-white block mb-1">Private Account</label>
                    <p className="text-xs text-zinc-500">Only approved followers can see your posts.</p>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })} className={`relative h-7 w-14 rounded-full transition-colors focus:outline-none ${form.isPrivate ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all shadow-sm ${form.isPrivate ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>
                
                <div className="pt-4">
                  <button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                    {saving ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">My Posts</h2>
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">{posts.length}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl ml-4 shadow-inner">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="glass border-dashed border-2 border-white/10 rounded-3xl p-16 text-center">
            <h2 className="text-lg font-bold text-white mb-2">No posts yet</h2>
            <p className="text-zinc-500 text-sm">When you share updates, they will appear here.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} onClick={() => router.push(`/post/${post._id}`)} className="glass border border-white/5 rounded-3xl p-6 transition-all hover:border-indigo-500/30 hover:bg-white/[0.04] cursor-pointer group shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{formatTime(post.createdAt)}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id) }} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 rounded-lg p-2 transition-all"><Trash2 size={14} /></button>
                </div>
                {post.textContent && <p className="text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">{post.textContent}</p>}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-white/5 mb-4 bg-black/40 shadow-inner">
                    {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full max-h-[400px] object-contain" /> : <img src={post.mediaUrl} className="w-full max-h-[400px] object-contain" alt="" />}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">❤️ <span className="text-zinc-200">{post.votes?.upvotes?.length || 0}</span></span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">💬 <span className="text-zinc-200">{post.comments?.length || 0}</span></span>
                  {post.hashtags?.length > 0 && <span className="text-xs font-bold text-indigo-400 ml-auto">{post.hashtags.slice(0,3).map(t => `#${t.label}`).join(' ')}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {posts.map((post) => (
              <div key={post._id} onClick={() => router.push(`/post/${post._id}`)} className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 cursor-pointer relative group shadow-sm">
                {post.mediaUrl ? (
                  post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 to-zinc-900"><p className="text-[11px] text-zinc-400 line-clamp-4 font-medium leading-snug">{post.textContent}</p></div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold flex items-center gap-2">❤️ {post.votes?.upvotes?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}