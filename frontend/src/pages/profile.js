import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bio: '',
    program: '',
    year: '',
    department: '',
    degree: '',
    graduationYear: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
      setForm({
        bio: res.data.bio || '',
        program: res.data.program || '',
        year: res.data.year || '',
        department: res.data.department || '',
        degree: res.data.degree || '',
        graduationYear: res.data.graduationYear || '',
      })
      fetchMyPosts(res.data._id)
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPosts = async (userId) => {
    try {
      const res = await api.get('/posts')
      const mine = res.data.filter((post) => post.authorId?._id === userId)
      setPosts(mine)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', {
        bio: form.bio,
        program: form.program || null,
        year: form.year ? Number(form.year) : null,
        department: form.department || null,
        degree: form.degree || null,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
      })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        isVerified: res.data.isVerified,
      }))
      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Refined UI Classes
  const inputClass = "w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
  const labelClass = "text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block font-bold"

  const roleColor = user?.role === 'professor' ? 'bg-amber-600' : user?.role === 'alumni' ? 'bg-emerald-600' : 'bg-blue-600'
  const roleBadge = user?.role === 'professor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : user?.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-black tracking-tighter">CAMPUSCONNECT</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Premium Navbar */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/feed" className="text-xl font-black tracking-tighter text-white hover:text-blue-500 transition-colors">
          CAMPUS<span className="text-blue-500">CONNECT</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/feed" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Feed</Link>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500 underline underline-offset-8">Profile</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-[#111] rounded-3xl p-8 border border-white/5 shadow-2xl mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl shrink-0 ${roleColor} ring-4 ring-black`}>
              {user?.name?.[0]}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight">{user?.name}</h1>
                {user?.isVerified && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-400/20 px-3 py-1 rounded-full uppercase font-black tracking-widest">Verified</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              <div className={`mt-3 inline-block px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${roleBadge}`}>
                {user?.role}
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-all active:scale-95 shrink-0"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            {!editing ? (
              <div className="space-y-6">
                <div>
                  <h3 className={labelClass}>Biography</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {user?.bio || "No biography provided yet."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <h3 className={labelClass}>Academic Program</h3>
                        <p className="text-sm font-bold text-white">{user.program || 'Not set'}</p>
                      </div>
                      <div>
                        <h3 className={labelClass}>Current Year</h3>
                        <p className="text-sm font-bold text-white">{user.year ? `Year ${user.year}` : 'Not set'}</p>
                      </div>
                    </>
                  )}
                  {/* ... other roles follow same pattern ... */}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className={`${inputClass} h-24 resize-none`}
                    maxLength={200}
                  />
                  <p className="text-[10px] text-gray-600 text-right mt-1">{form.bio.length}/200</p>
                </div>
                {/* Inputs for role-specific data using your logic */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {saving ? 'Saving...' : 'Confirm Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Recent Activity</h2>
            <div className="h-px bg-white/5 flex-1 mx-4"></div>
            <span className="text-[10px] font-mono text-gray-600">{posts.length} Posts</span>
          </div>

          {posts.map((post) => (
            <div key={post._id} className="bg-[#111] hover:bg-[#151515] rounded-3xl p-6 border border-white/5 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                {post.type === 'announcement' && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase">Announcement</span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.textContent}</p>
              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {post.hashtags.map((tag) => (
                    <span key={tag._id} className="text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition">#{tag.label}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}