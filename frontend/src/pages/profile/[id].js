import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, UserPlus, UserCheck, Lock } from 'lucide-react'
import api from '../../utils/api'

export default function UserProfile() {
  const router = useRouter()
  const { id } = router.query
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) setCurrentUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    if (!id) return
    fetchUserProfile()
  }, [id])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const userRes = await api.get(`/auth/users/${id}`)
      setProfileUser(userRes.data)
      setIsFollowing(userRes.data.isFollowing)
      setHasRequested(userRes.data.hasRequested ?? false)
      setFollowersCount(userRes.data.followersCount ?? 0)
      if (userRes.data.canViewPosts) {
        const postsRes = await api.get(`/posts/user/${id}`)
        setPosts(postsRes.data)
      } else {
        setPosts([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      const res = await api.put(`/auth/users/${id}/follow`)
      setIsFollowing(res.data.following)
      setHasRequested(res.data.requested ?? false)
      setFollowersCount(res.data.followersCount)
      setProfileUser(prev => prev ? { ...prev, canViewPosts: res.data.canViewPosts } : prev)
      if (res.data.canViewPosts) {
        const postsRes = await api.get(`/posts/user/${id}`)
        setPosts(postsRes.data)
      } else {
        setPosts([])
      }
    } catch (err) {} finally { setFollowLoading(false) }
  }

  const roleColor = profileUser?.role === 'professor' ? 'bg-amber-600' : profileUser?.role === 'alumni' ? 'bg-emerald-600' : 'bg-indigo-600'
  const roleBadge = profileUser?.role === 'professor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : profileUser?.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  const labelClass = 'text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block font-bold'

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profileUser) return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-sm glass rounded-3xl mx-auto max-w-lg mt-10">
      <p className="mb-4 text-white font-bold">User not found or unavailable.</p>
      <button onClick={() => router.back()} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors uppercase tracking-widest text-xs flex items-center gap-2">
        <ArrowLeft size={14} /> Go Back
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto relative">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest mb-6 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl sticky top-4 z-40 w-max shadow-sm backdrop-blur-md">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 border border-white/5 shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
          <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-2 border-white/10 shrink-0 ${roleColor} overflow-hidden`}>
            {profileUser.avatarUrl
              ? <img src={profileUser.avatarUrl} alt={profileUser.name} className="w-full h-full object-cover" />
              : profileUser.name?.[0]
            }
          </div>

          <div className="flex-1 text-center sm:text-left pt-2">
            <h1 className="text-3xl font-black tracking-tight text-white mb-3">{profileUser.name}</h1>
            <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap mb-5">
              <span className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest shadow-sm ${roleBadge}`}>
                {profileUser.role}
              </span>
              <span className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 font-bold uppercase tracking-widest text-zinc-300 shadow-sm flex items-center gap-1.5">
                {profileUser.isPrivate && <Lock size={10} />}
                {profileUser.isPrivate ? 'Private Profile' : 'Public Profile'}
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-white/5 font-bold uppercase tracking-widest shadow-sm">
                {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
              </span>
            </div>
            
            {currentUser && currentUser.id !== id && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`mt-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center sm:justify-start gap-2 disabled:opacity-50 mx-auto sm:mx-0 w-full sm:w-auto ${
                  isFollowing
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/30'
                    : hasRequested
                    ? 'bg-zinc-800 text-zinc-400 border border-white/5 cursor-not-allowed hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                }`}
              >
                {followLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" /> : null}
                {!followLoading && isFollowing && <UserCheck size={14} />}
                {!followLoading && !isFollowing && !hasRequested && <UserPlus size={14} />}
                {isFollowing ? 'Unfollow' : hasRequested ? 'Requested' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-6 relative z-10">
          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 shadow-inner">
            <h3 className={labelClass}>Biography</h3>
            <p className="text-zinc-300 leading-relaxed text-sm font-medium">{profileUser.bio || <span className="italic text-zinc-600">No biography provided.</span>}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileUser.role === 'student' && (
              <>
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner">
                  <h3 className={labelClass}>Programme</h3>
                  <p className="text-sm font-bold text-white">{profileUser.program || 'Not set'}</p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner">
                  <h3 className={labelClass}>Year</h3>
                  <p className="text-sm font-bold text-white">{profileUser.year ? `Year ${profileUser.year}` : 'Not set'}</p>
                </div>
              </>
            )}
            {profileUser.role === 'professor' && (
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner">
                <h3 className={labelClass}>Department</h3>
                <p className="text-sm font-bold text-white">{profileUser.department || 'Not set'}</p>
              </div>
            )}
            {profileUser.role === 'alumni' && (
              <>
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner">
                  <h3 className={labelClass}>Degree</h3>
                  <p className="text-sm font-bold text-white">{profileUser.degree || 'Not set'}</p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 shadow-inner">
                  <h3 className={labelClass}>Graduation Year</h3>
                  <p className="text-sm font-bold text-white">{profileUser.graduationYear || 'Not set'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Activity</h2>
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">{posts.length}</span>
          </div>
        </div>

        {posts.length === 0 && (
          <div className="glass border-dashed border-2 border-white/10 rounded-3xl p-16 text-center">
            {profileUser.canViewPosts ? (
              <>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5"><span className="text-2xl opacity-50">✨</span></div>
                <h2 className="text-lg font-bold text-white mb-2">No posts yet</h2>
                <p className="text-zinc-500 text-sm font-medium">When they share updates, you&apos;ll see them here.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5"><Lock className="text-zinc-500" size={24} /></div>
                <h2 className="text-lg font-bold text-white mb-2">Private Account</h2>
                <p className="text-zinc-500 text-sm font-medium">Follow them to see their posts and activity.</p>
              </>
            )}
          </div>
        )}

        <AnimatePresence>
          {profileUser.canViewPosts && posts.map((post, i) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/post/${post._id}`)} 
              className="glass border border-white/5 rounded-3xl p-6 transition-all hover:border-indigo-500/30 hover:bg-white/[0.04] cursor-pointer shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                {post.type === 'announcement' && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Announcement</span>
                )}
              </div>
              
              <p className="text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap mb-4 font-medium">{post.textContent}</p>
              
              {post.mediaUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-inner">
                  {post.mediaType === 'video'
                    ? <video src={post.mediaUrl} className="w-full max-h-[400px] object-contain" onClick={e => Boolean(post.mediaUrl) && e.preventDefault()} />
                    : <img src={post.mediaUrl} className="w-full max-h-[400px] object-contain" alt="" />
                  }
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-white/5 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">❤️ <span className="text-zinc-200">{post.votes?.upvotes?.length || 0}</span></span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">💬 <span className="text-zinc-200">{post.comments?.length || 0}</span></span>
                {post.hashtags?.length > 0 && <span className="text-xs font-bold text-indigo-400 ml-auto">{post.hashtags.slice(0,3).map(t => `#${t.label}`).join(' ')}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}