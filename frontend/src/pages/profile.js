import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { Home, MapPin, LayoutGrid, List, Bell, Camera, Trash2 } from 'lucide-react'

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
  const [form, setForm] = useState({
    bio: '', program: '', year: '', department: '', degree: '', graduationYear: '', isPrivate: false,
  })
  const [socialCounts, setSocialCounts] = useState(null)

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
    } catch (err) { console.error(err) }
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
    } catch (err) { console.error(err) } finally { setSaving(false) }
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
        avatarUrl: res.data.avatarUrl, isPrivate: res.data.isPrivate,
        program: res.data.program || null, department: res.data.department || null,
        matricola: res.data.matricola || null,
      }))
    } catch (err) { console.error(err) } finally { setUploadingPic(false) }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => { localStorage.clear(); router.push('/login') }

  const inputClass = "w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-gray-600"
  const labelClass = "text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block font-bold"
  const roleColor = user?.role === 'professor' ? 'bg-amber-600' : user?.role === 'alumni' ? 'bg-emerald-600' : 'bg-blue-600'
  const roleBadge = user?.role === 'professor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : user?.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-black tracking-tighter">CAMPUSCONNECT</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <Link href="/feed" className="text-sm font-black text-white uppercase tracking-tighter">CampusConnect</Link>
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/feed',          icon: <Home size={13} />,       label: 'Feed' },
            { href: '/map',           icon: <MapPin size={13} />,     label: 'Find a Place' },
            { href: '/timetable',     icon: <LayoutGrid size={13} />, label: 'Services' },
            { href: '/notifications', icon: <Bell size={13} />,       label: 'Notifications' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
              {icon} {label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="text-[10px] font-bold uppercase text-gray-500 hover:text-red-400 transition">
          Logout
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#111] rounded-3xl p-8 border border-white/5 shadow-2xl mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-black overflow-hidden ${!user?.avatarUrl ? roleColor : ''}`}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
              </div>
              <button onClick={() => fileInputRef.current.click()} disabled={uploadingPic} className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                {uploadingPic ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={20} className="text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
                {user?.isVerified && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-400/20 px-3 py-1 rounded-full uppercase font-black tracking-widest">✓ Verified</span>}
              </div>
              <p className="text-gray-500 text-xs mb-3">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${roleBadge}`}>{user?.role}</span>
                <span className="inline-block px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-tighter text-gray-300">{user?.isPrivate ? 'Private Account' : 'Public Account'}</span>
              </div>

              {socialCounts && (
                <div className="flex items-center gap-5 mt-3">
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <p className="text-sm font-black text-white">{socialCounts.connectionsCount}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Connections</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{socialCounts.followingCount}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Following</p>
                      </div>
                    </>
                  )}
                  {(user?.role === 'professor' || user?.role === 'alumni') && (
                    <>
                      <div>
                        <p className="text-sm font-black text-white">{socialCounts.followersCount}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Followers</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{socialCounts.followingCount}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Following</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setEditing(!editing)} className="px-5 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition shrink-0">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            {!editing ? (
              <div className="space-y-5">
                <div><h3 className={labelClass}>Biography</h3><p className="text-gray-300 leading-relaxed text-sm">{user?.bio || 'No biography yet.'}</p></div>
                <div className="grid grid-cols-2 gap-6">
                  {user?.role === 'student' && (
                    <>
                      <div><h3 className={labelClass}>Programme</h3><p className="text-sm font-bold">{user.program || 'Not set'}</p></div>
                      <div><h3 className={labelClass}>Year</h3><p className="text-sm font-bold">{user.year ? `Year ${user.year}` : 'Not set'}</p></div>
                      {user?.matricola && (
                        <div><h3 className={labelClass}>Matricola</h3><p className="text-sm font-bold font-mono">#{user.matricola}</p></div>
                      )}
                    </>
                  )}
                  {user?.role === 'professor' && (
                    <div><h3 className={labelClass}>Department</h3><p className="text-sm font-bold">{user.department || 'Not set'}</p></div>
                  )}
                  {user?.role === 'alumni' && (
                    <>
                      <div><h3 className={labelClass}>Degree</h3><p className="text-sm font-bold">{user.degree || 'Not set'}</p></div>
                      <div><h3 className={labelClass}>Graduated</h3><p className="text-sm font-bold">{user.graduationYear || 'Not set'}</p></div>
                    </>
                  )}
                </div>
                <div><h3 className={labelClass}>Post Visibility</h3><p className="text-sm font-bold">{user?.isPrivate ? 'Only followers can see your posts.' : 'Anyone on CampusConnect can see your posts.'}</p></div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputClass} h-24 resize-none`} maxLength={200} placeholder="Tell people about yourself..." />
                  <p className="text-[10px] text-gray-600 text-right mt-1">{form.bio.length}/200</p>
                </div>
                {user?.role === 'student' && (
                  <>
                    <div>
                      <label className={labelClass}>Programme</label>
                      <div className="w-full bg-black/20 text-gray-500 px-4 py-3 rounded-xl border border-gray-800 text-sm cursor-not-allowed select-none">
                        {user.program || 'Not set'} <span className="text-[10px] text-gray-700 ml-2">(set at registration)</span>
                      </div>
                    </div>
                    <div><label className={labelClass}>Year</label><input type="number" min="1" max="10" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} placeholder="e.g. 2" /></div>
                    {user?.matricola && (
                      <div>
                        <label className={labelClass}>Matricola</label>
                        <div className="w-full bg-black/20 text-gray-500 px-4 py-3 rounded-xl border border-gray-800 text-sm font-mono cursor-not-allowed select-none">
                          #{user.matricola} <span className="text-[10px] text-gray-700 ml-2">(set at registration)</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {user?.role === 'professor' && (
                  <div><label className={labelClass}>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} placeholder="e.g. DIECII" /></div>
                )}
                {user?.role === 'alumni' && (
                  <>
                    <div><label className={labelClass}>Degree</label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className={inputClass} placeholder="e.g. BSc Data Analysis" /></div>
                    <div><label className={labelClass}>Graduation Year</label><input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} className={inputClass} placeholder="e.g. 2022" /></div>
                  </>
                )}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div><label className={labelClass}>Private Account</label><p className="text-sm text-gray-400">When enabled, only followers can see the posts you publish.</p></div>
                    <button type="button" onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })} className={`relative h-7 w-14 rounded-full transition ${form.isPrivate ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${form.isPrivate ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">My Posts</h2>
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-mono text-gray-600">{posts.length} posts</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl ml-4">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}><List size={14} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}><LayoutGrid size={14} /></button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">No posts yet.</div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} onClick={() => router.push(`/post/${post._id}`)} className="bg-[#111] hover:bg-[#151515] rounded-2xl p-5 border border-white/5 transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">{formatTime(post.createdAt)}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id) }} className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition p-1"><Trash2 size={13} /></button>
                  </div>
                  {post.textContent && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.textContent}</p>}
                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 mb-3 max-h-48 bg-black">
                      {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full max-h-48 object-contain" /> : <img src={post.mediaUrl} className="w-full max-h-48 object-contain" alt="" />}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-[10px] text-gray-600">
                    <span>❤️ {post.votes?.upvotes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    {post.hashtags?.length > 0 && <span className="text-blue-500/60">{post.hashtags.map(t => `#${t.label}`).join(' ')}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div key={post._id} onClick={() => router.push(`/post/${post._id}`)} className="aspect-square bg-[#111] rounded-lg overflow-hidden border border-white/5 cursor-pointer relative group">
                  {post.mediaUrl ? (
                    post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3 text-center"><p className="text-[9px] text-gray-500 line-clamp-4 leading-tight">{post.textContent}</p></div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold">
                    ❤️ {post.votes?.upvotes?.length || 0}
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