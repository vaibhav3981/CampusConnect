import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  const roleColor = profileUser?.role === 'professor' ? 'bg-amber-600' : profileUser?.role === 'alumni' ? 'bg-emerald-600' : 'bg-blue-600'
  const roleBadge = profileUser?.role === 'professor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : profileUser?.role === 'alumni' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  const labelClass = 'text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block font-bold'

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-black tracking-tighter">CAMPUSCONNECT</div>
    </div>
  )

  if (!profileUser) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 text-sm">
      User not found. <Link href="/feed" className="text-blue-400 ml-2">← Back to feed</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <nav className="bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/feed" className="text-xl font-black tracking-tighter text-white hover:text-blue-500 transition-colors">
          CAMPUS<span className="text-blue-500">CONNECT</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/feed" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Feed</Link>
          {currentUser && (
            <Link href="/profile" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">My Profile</Link>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest mb-8 transition">
          <ArrowLeft size={13} /> Back
        </button>

        {/* Profile Header */}
        <div className="bg-[#111] rounded-3xl p-8 border border-white/5 shadow-2xl mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl shrink-0 ${roleColor} ring-4 ring-black overflow-hidden`}>
              {profileUser.avatarUrl
                ? <img src={profileUser.avatarUrl} alt={profileUser.name} className="w-full h-full object-cover" />
                : profileUser.name?.[0]
              }
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight">{profileUser.name}</h1>
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
                <div className={`inline-block px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${roleBadge}`}>
                  {profileUser.role}
                </div>
                <span className="text-[10px] px-3 py-1 rounded-lg border border-white/10 bg-white/5 font-black uppercase tracking-tighter text-gray-300">
                  {profileUser.isPrivate ? 'Private Account' : 'Public Account'}
                </span>
                <span className="text-[10px] text-gray-500 font-bold">
                  {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
                </span>
              </div>
              {currentUser && currentUser.id !== id && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`mt-4 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
                      : hasRequested
                      ? 'bg-white/10 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Unfollow' : hasRequested ? 'Requested' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            <div>
              <h3 className={labelClass}>Biography</h3>
              <p className="text-gray-300 leading-relaxed text-sm">{profileUser.bio || 'No biography provided yet.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {profileUser.role === 'student' && (
                <>
                  <div>
                    <h3 className={labelClass}>Academic Program</h3>
                    <p className="text-sm font-bold text-white">{profileUser.program || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className={labelClass}>Current Year</h3>
                    <p className="text-sm font-bold text-white">{profileUser.year ? `Year ${profileUser.year}` : 'Not set'}</p>
                  </div>
                  {profileUser.matricola && (
                    <div>
                      <h3 className={labelClass}>Matricola</h3>
                      <p className="text-sm font-bold font-mono text-white">#{profileUser.matricola}</p>
                    </div>
                  )}
                </>
              )}
              {profileUser.role === 'professor' && (
                <div>
                  <h3 className={labelClass}>Department</h3>
                  <p className="text-sm font-bold text-white">{profileUser.department || 'Not set'}</p>
                </div>
              )}
              {profileUser.role === 'alumni' && (
                <>
                  <div>
                    <h3 className={labelClass}>Degree</h3>
                    <p className="text-sm font-bold text-white">{profileUser.degree || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className={labelClass}>Graduation Year</h3>
                    <p className="text-sm font-bold text-white">{profileUser.graduationYear || 'Not set'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Posts</h2>
            <div className="h-px bg-white/5 flex-1 mx-4"></div>
            <span className="text-[10px] font-mono text-gray-600">{posts.length} posts</span>
          </div>

          {posts.length === 0 && (
            <p className="text-center text-[11px] text-gray-700 italic py-8">
              {profileUser.canViewPosts ? 'No posts yet.' : 'This account is private. Follow them to see their posts.'}
            </p>
          )}

          {profileUser.canViewPosts && posts.map((post) => (
            <div key={post._id} onClick={() => router.push(`/post/${post._id}`)} className="bg-[#111] hover:bg-[#151515] rounded-3xl p-6 border border-white/5 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                {post.type === 'announcement' && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase">Announcement</span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.textContent}</p>
              {post.mediaUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                  {post.mediaType === 'video'
                    ? <video src={post.mediaUrl} className="w-full max-h-[400px] object-contain" controls />
                    : <img src={post.mediaUrl} className="w-full max-h-[400px] object-contain" alt="" />
                  }
                </div>
              )}
              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {post.hashtags.map((tag) => (
                    <span key={tag._id} className="text-xs font-bold text-blue-500">#{tag.label}</span>
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