import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Home, MapPin, LayoutGrid, Bell, Heart, MessageCircle, AtSign, Megaphone, Check } from 'lucide-react'
import api from '../utils/api'

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

const Avatar = ({ user: u, size = 5 }) => {
  const roleColor = u?.role === 'professor' ? 'bg-amber-600' : u?.role === 'alumni' ? 'bg-green-700' : 'bg-blue-600'
  if (u?.avatarUrl) {
    return <img src={u.avatarUrl} alt={u.name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />
  }
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${roleColor}`}>
      {u?.name?.[0]}
    </div>
  )
}

const typeConfig = {
  like:         { icon: Heart,         color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
  comment:      { icon: MessageCircle, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  mention:      { icon: AtSign,        color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  announcement: { icon: Megaphone,     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
}

export default function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (n) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`)
        setNotifications(prev => prev.map(notif =>
          notif._id === n._id ? { ...notif, isRead: true } : notif
        ))
      } catch (err) { console.error(err) }
    }
    const postId = n.postId?._id || n.postId
    if (postId) {
      const isComment = n.type === 'comment' || n.type === 'mention'
      router.push(`/post/${postId}${isComment ? '?scrollComments=true' : ''}`)
    } else {
      router.push('/feed')
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) { console.error(err) }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <Link href="/feed" className="text-sm font-black text-white uppercase tracking-tighter">CampusConnect</Link>
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/feed',          icon: <Home size={13} />,       label: 'Feed' },
            { href: '/map',           icon: <MapPin size={13} />,     label: 'Find a Place' },
            { href: '/timetable',     icon: <LayoutGrid size={13} />, label: 'Services' },
            { href: '/notifications', icon: <Bell size={13} />,       label: 'Notifications', active: true },
          ].map(({ href, icon, label, active }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest transition ${
                active ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {icon} {label}
            </Link>
          ))}
        </div>
        <Link href="/profile" className="text-[10px] font-bold uppercase text-gray-500 hover:text-white transition">
          {user?.name?.split(' ')[0] || 'Profile'}
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-white transition uppercase tracking-widest"
            >
              <Check size={11} /> Mark all read
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#111113] border border-white/5 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-600" />
            </div>
            <p className="text-sm font-bold text-gray-500">No notifications yet</p>
            <p className="text-[11px] text-gray-700 mt-1">When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map(n => {
              const cfg = typeConfig[n.type] || typeConfig.comment
              const Icon = cfg.icon
              return (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`bg-[#111113] border rounded-2xl p-4 transition cursor-pointer hover:bg-white/[0.03] ${
                    !n.isRead ? 'border-blue-500/20' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">

                    {/* Type icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={15} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                          <Avatar user={n.senderId} size={5} />
                          <p className="text-xs text-gray-200 min-w-0">
                            <span className="font-bold">{n.senderId?.name}</span>
                            {' '}
                            <span className="text-gray-400">{n.message}</span>
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>

                      {n.postId?.textContent && (
                        <p className="text-[11px] text-gray-600 mt-1.5 truncate pl-7">
                          "{n.postId.textContent.slice(0, 80)}{n.postId.textContent.length > 80 ? '...' : ''}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1 pl-7">
                        <p className="text-[10px] text-gray-700">{formatTime(n.createdAt)}</p>
                        <span className="text-[9px] text-gray-700">· tap to view post</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}