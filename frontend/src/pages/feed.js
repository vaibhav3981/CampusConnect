import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'

export default function Feed() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [activeTag, setActiveTag] = useState(null)

  // Announcement form state
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [pages, setPages] = useState([])
  const [announcement, setAnnouncement] = useState({
    textContent: '',
    pageId: '',
    scope: 'all',
    years: [],
    programs: '',
  })
  const [announcing, setAnnouncing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userData)
    setUser(parsed)
    fetchFeed()
    fetchTrending()
    if (parsed.role === 'professor') fetchMyPages()
  }, [])

  const fetchFeed = async (tag = null) => {
    setLoading(true)
    setActiveTag(tag)
    try {
      const url = tag ? `/posts?hashtag=${tag}` : '/posts'
      const res = await api.get(url)
      setPosts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      const res = await api.get('/posts/trending')
      setTrending(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyPages = async () => {
    try {
      const res = await api.get('/pages/my')
      setPages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    try {
      const res = await api.post('/posts', { textContent: newPost, type: 'post' })
      setPosts([res.data, ...posts])
      setNewPost('')
      fetchTrending()
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const handleAnnouncement = async (e) => {
    e.preventDefault()
    if (!announcement.textContent.trim()) return
    setAnnouncing(true)
    try {
      const payload = {
        textContent: announcement.textContent,
        type: 'announcement',
        pageId: announcement.pageId || null,
        audience: {
          scope: announcement.scope,
          years: announcement.years.map(Number),
          programs: announcement.programs ? [announcement.programs] : [],
          courseCodes: [],
        },
      }
      const res = await api.post('/posts', payload)
      setPosts([res.data, ...posts])
      setAnnouncement({ textContent: '', pageId: '', scope: 'all', years: [], programs: '' })
      setShowAnnouncement(false)
      fetchTrending()
    } catch (err) {
      console.error(err)
    } finally {
      setAnnouncing(false)
    }
  }

  const toggleYear = (year) => {
    setAnnouncement((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year],
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const inputClass = "w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-blue-400">CampusConnect</h1>
        <div className="flex items-center gap-4">
          {user?.role === 'professor' && (
            <button
              onClick={() => setShowAnnouncement(!showAnnouncement)}
              className="text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full hover:bg-amber-500/30 transition"
            >
              + Announcement
            </button>
          )}
          {/* Nav links */}
          <Link href="/feed" className="text-sm text-gray-400 hover:text-white transition">
            Feed
          </Link>
          <Link href="/profile" className="text-sm text-gray-400 hover:text-white transition">
            {user?.name}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 flex gap-8">

        {/* Main feed */}
        <div className="flex-1">

          {/* Professor announcement form */}
          {user?.role === 'professor' && showAnnouncement && (
            <form
              onSubmit={handleAnnouncement}
              className="bg-gray-900 rounded-2xl p-5 mb-6 border border-amber-500/30"
            >
              <h2 className="text-sm font-semibold text-amber-400 mb-4">
                Create Announcement
              </h2>

              {pages.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-1 block">Post from page</label>
                  <select
                    value={announcement.pageId}
                    onChange={(e) => setAnnouncement({ ...announcement, pageId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select a page (optional)</option>
                    {pages.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <textarea
                value={announcement.textContent}
                onChange={(e) => setAnnouncement({ ...announcement, textContent: e.target.value })}
                placeholder="Write your announcement... Use #hashtags"
                className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 resize-none h-24 mb-4"
              />

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Audience</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, scope: 'all' })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                      announcement.scope === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, scope: 'targeted' })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                      announcement.scope === 'targeted'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Targeted
                  </button>
                </div>
              </div>

              {announcement.scope === 'targeted' && (
                <div className="space-y-4 mb-4 p-4 bg-gray-800 rounded-xl">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Target years</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => toggleYear(year)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            announcement.years.includes(year)
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          Year {year}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Target program</label>
                    <input
                      type="text"
                      value={announcement.programs}
                      onChange={(e) => setAnnouncement({ ...announcement, programs: e.target.value })}
                      placeholder="e.g. Data Analysis"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncement(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={announcing || !announcement.textContent.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {announcing ? 'Posting...' : 'Post announcement'}
                </button>
              </div>
            </form>
          )}

          {/* Create post box — students always, professors when announcement form is hidden */}
          {(user?.role !== 'professor' || !showAnnouncement) && (
            <form onSubmit={handlePost} className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={user?.role === 'professor' ? 'Share something with everyone... Use #hashtags' : "What's on your mind? Use #hashtags"}
                className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 resize-none h-24"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={posting || !newPost.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Active hashtag filter */}
          {activeTag && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-blue-400">#{activeTag}</span>
              <button
                onClick={() => fetchFeed(null)}
                className="text-xs text-gray-500 hover:text-red-400 transition"
              >
                ✕ clear filter
              </button>
            </div>
          )}

          {/* Posts list */}
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 text-sm mt-12">No posts yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className={`bg-gray-900 rounded-2xl p-5 border ${
                    post.type === 'announcement' ? 'border-amber-500/30' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      post.authorId?.role === 'professor' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {post.authorId?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post.authorId?.name}</p>
                      <p className="text-xs text-gray-500">
                        {post.authorId?.role} · {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {post.type === 'announcement' && (
                      <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">
                        Announcement
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{post.textContent}</p>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.hashtags.map((tag) => (
                        <button
                          key={tag._id}
                          onClick={() => fetchFeed(tag.label)}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          #{tag.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending sidebar */}
        <div className="w-64 hidden md:block">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 sticky top-24">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Trending</h2>
            {trending.length === 0 ? (
              <p className="text-xs text-gray-500">No trending topics yet</p>
            ) : (
              <div className="space-y-3">
                {trending.map((tag) => (
                  <div
                    key={tag._id}
                    className="flex items-center justify-between cursor-pointer hover:opacity-75 transition"
                    onClick={() => fetchFeed(tag.label)}
                  >
                    <span className="text-sm text-blue-400">#{tag.label}</span>
                    <span className="text-xs text-gray-500">{tag.postCount} posts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
