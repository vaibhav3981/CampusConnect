import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Heart, MessageCircle, AtSign, Megaphone, Check, UserPlus, Trash2 } from 'lucide-react'
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

const Avatar = ({ user: u, size = 10 }) => {
  const roleColor = u?.role === 'professor' ? 'bg-indigo-600' : u?.role === 'alumni' ? 'bg-emerald-600' : 'bg-blue-600'
  if (u?.avatarUrl) return <img src={u.avatarUrl} alt={u.name} className={`w-${size} h-${size} rounded-full object-cover shrink-0 shadow-md`} />
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md ${roleColor}`}>
      {u?.name?.[0]}
    </div>
  )
}

const typeConfig = {
  like:               { icon: Heart,         color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30'    },
  comment:            { icon: MessageCircle, color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30'  },
  mention:            { icon: AtSign,        color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30'  },
  announcement:       { icon: Megaphone,     color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  connection_request: { icon: UserPlus,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  follow_request:     { icon: UserPlus,      color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
}

export default function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleClick = async (n) => {
    if (n.type === 'connection_request') return

    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`)
        setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif))
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

  const handleAccept = async (n) => {
    setActionLoading(prev => ({ ...prev, [n._id]: 'accept' }))
    try {
      const senderId = n.senderId?._id || n.senderId
      if (n.type === 'follow_request') await api.put(`/auth/users/${senderId}/follow/accept`)
      else await api.put(`/connections/accept/${senderId}`)
      setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true, _resolved: 'accepted' } : notif))
    } catch (err) {} finally { setActionLoading(prev => ({ ...prev, [n._id]: null })) }
  }

  const handleDecline = async (n) => {
    setActionLoading(prev => ({ ...prev, [n._id]: 'decline' }))
    try {
      const senderId = n.senderId?._id || n.senderId
      if (n.type === 'follow_request') await api.delete(`/auth/users/${senderId}/follow/decline`)
      else await api.delete(`/connections/decline/${senderId}`)
      setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true, _resolved: 'declined' } : notif))
    } catch (err) {} finally { setActionLoading(prev => ({ ...prev, [n._id]: null })) }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Alerts</h1>
          <p className="text-zinc-400 font-medium">Updates and activity on your profile.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
            <Check size={14} /> Mark all read ({unreadCount})
          </button>
        )}
      </header>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass border border-white/5 rounded-3xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-white/10">
          <div className="w-20 h-20 rounded-full bg-zinc-900 mx-auto flex items-center justify-center mb-6 shadow-inner">
            <Bell size={32} className="text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">You&apos;re all caught up!</h2>
          <p className="text-zinc-500">When someone interacts with you or your posts, you&apos;ll see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map(n => {
              const cfg = typeConfig[n.type] || typeConfig.comment
              const Icon = cfg.icon
              const isConnectionRequest = n.type === 'connection_request' || n.type === 'follow_request'
              const resolved = n._resolved
              const busy = actionLoading[n._id]

              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleClick(n)}
                  className={`glass border rounded-3xl p-5 transition-all overflow-hidden relative ${
                    isConnectionRequest ? 'cursor-default' : 'cursor-pointer hover:bg-white/[0.04]'
                  } ${!n.isRead ? 'border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_20px_rgba(79,70,229,0.05)]' : 'border-white/5'}`}
                >
                  {!n.isRead && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />}

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar user={n.senderId} />
                      <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center ${cfg.bg} border-2 border-[#18181b] shadow-sm`}>
                        <Icon size={12} className={cfg.color} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-zinc-300 leading-snug">
                        <span className="font-bold text-white mr-1.5">{n.senderId?.name}</span>
                        {n.message}
                      </p>

                      {n.postId?.textContent && (
                        <div className="mt-3 bg-black/40 border border-white/5 rounded-2xl p-3">
                          <p className="text-xs text-zinc-400 italic line-clamp-2">&quot;{n.postId.textContent}&quot;</p>
                        </div>
                      )}

                      {/* Connection request actions */}
                      {isConnectionRequest && !resolved && (
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAccept(n) }}
                            disabled={!!busy}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <Check size={14} /> {busy === 'accept' ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDecline(n) }}
                            disabled={!!busy}
                            className="bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-transparent hover:border-red-500/30 px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> {busy === 'decline' ? 'Declining...' : 'Decline'}
                          </button>
                        </div>
                      )}

                      {/* Resolved state */}
                      {isConnectionRequest && resolved && (
                        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          resolved === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {resolved === 'accepted' ? <Check size={12}/> : <Trash2 size={12}/>}
                          {resolved === 'accepted' ? 'Request Accepted' : 'Request Declined'}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs text-zinc-600 font-medium">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}