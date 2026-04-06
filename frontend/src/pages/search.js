import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, UserCheck, Users, GraduationCap, BookOpen, ChevronRight } from 'lucide-react'
import api from '../utils/api'

const Avatar = ({ user: u, size = 12 }) => {
  const roleColor = u?.role === 'professor' ? 'bg-amber-600' : 'bg-indigo-600'
  if (u?.avatarUrl) return <img src={u.avatarUrl} alt={u.name} className={`w-${size} h-${size} rounded-2xl object-cover shrink-0 shadow-md`} />
  return <div className={`w-${size} h-${size} rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-md ${roleColor}`}>{u?.name?.[0]}</div>
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('student') 
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [connectionStatuses, setConnectionStatuses] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    setResults([]); setConnectionStatuses({})
    if (query.trim()) doSearch(query)
  }, [mode])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => doSearch(query), 300)
  }, [query])

  const doSearch = async (q) => {
    setLoading(true)
    try {
      const res = await api.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
      const filtered = res.data.filter(u => mode === 'student' ? u.role === 'student' : u.role === 'professor')
      setResults(filtered)
      filtered.forEach(u => fetchStatus(u))
    } catch {} finally { setLoading(false) }
  }

  const fetchStatus = async (targetUser) => {
    try {
      if (targetUser.role === 'professor') {
        const r = await api.get(`/follows/status/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: r.data.isFollowing ? 'following' : 'none' }))
      } else {
        const r = await api.get(`/connections/status/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: r.data.status }))
      }
    } catch {}
  }

  const handleFollow = async (targetUser) => {
    setActionLoading(prev => ({ ...prev, [targetUser._id]: true }))
    try {
      const isFollowing = connectionStatuses[targetUser._id] === 'following'
      if (isFollowing) {
         await api.delete(`/follows/${targetUser._id}`); setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'none' }))
      } else {
         await api.post(`/follows/${targetUser._id}`); setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'following' }))
      }
    } catch (err) {} finally { setActionLoading(prev => ({ ...prev, [targetUser._id]: false })) }
  }

  const handleConnect = async (targetUser) => {
    setActionLoading(prev => ({ ...prev, [targetUser._id]: true }))
    try {
      const status = connectionStatuses[targetUser._id]
      if (status === 'none' || !status) {
        await api.post(`/connections/request/${targetUser._id}`); setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'pending_sent' }))
      } else if (status === 'pending_received') {
        await api.put(`/connections/accept/${targetUser._id}`); setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'connected' }))
      } else if (status === 'connected') {
        await api.delete(`/connections/remove/${targetUser._id}`); setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'none' }))
      }
    } catch (err) {} finally { setActionLoading(prev => ({ ...prev, [targetUser._id]: false })) }
  }

  const renderActionButton = (targetUser) => {
    if (targetUser._id === user?.id) return <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">You</span>
    
    const status = connectionStatuses[targetUser._id]
    const busy = actionLoading[targetUser._id]

    if (targetUser.role === 'professor') {
      const isFollowing = status === 'following'
      return (
        <button onClick={(e) => { e.stopPropagation(); handleFollow(targetUser) }} disabled={busy}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 w-32 ${
            isFollowing ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}>
          {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
        </button>
      )
    }

    const config = {
      none:             { label: 'Connect',     icon: <UserPlus size={14} />,  style: 'bg-indigo-600 text-white hover:bg-indigo-500' },
      pending_sent:     { label: 'Requested',   icon: <UserCheck size={14} />, style: 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed' },
      pending_received: { label: 'Accept',      icon: <UserCheck size={14} />, style: 'bg-emerald-600 text-white hover:bg-emerald-500' },
      connected:        { label: 'Connected',   icon: <Users size={14} />,     style: 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' },
    }
    const c = config[status || 'none']
    return (
      <button onClick={(e) => { e.stopPropagation(); handleConnect(targetUser) }} disabled={busy || status === 'pending_sent'}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 w-32 ${c.style}`}>
        {c.icon} {c.label}
      </button>
    )
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full text-center space-y-6 pt-10 pb-12">
        <h1 className="text-4xl font-black text-white tracking-tight">Directory Search</h1>
        
        <div className="relative max-w-2xl mx-auto w-full group">
          <div className="absolute inset-x-0 -bottom-2 h-10 bg-indigo-500/20 blur-xl rounded-full transition-opacity opacity-0 group-focus-within:opacity-100" />
          <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-3xl p-2 shadow-2xl backdrop-blur-md transition-all group-focus-within:border-indigo-500/50 group-focus-within:bg-zinc-900">
            <div className="pl-4 pr-3">
              <Search size={22} className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder={mode === 'student' ? 'Search students by name or matricola...' : 'Search professors...'}
              className="w-full bg-transparent border-none text-[15px] font-medium text-white focus:ring-0 placeholder-zinc-600 focus:outline-none py-3"
            />
            {loading && <div className="pr-4"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => { setMode('student'); setQuery(''); setResults([]) }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              mode === 'student' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white'
            }`}>
            <GraduationCap size={16} /> Students
          </button>
          <button onClick={() => { setMode('professor'); setQuery(''); setResults([]) }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              mode === 'professor' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-transparent text-zinc-500 hover:bg-white/5 hover:text-white'
            }`}>
            <BookOpen size={16} /> Professors
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        {!query && (
          <div className="glass border-dashed border-2 border-white/10 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search size={24} className="text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Start typing to search</h2>
            <p className="text-zinc-500">Find connections across the university database.</p>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
            <p className="text-zinc-500">We couldn&apos;t find any {mode}s matching &quot;{query}&quot;</p>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 mb-2">Results ({results.length})</p>
            <AnimatePresence>
              {results.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/profile/${u._id}`)}
                  className="glass rounded-3xl p-4 flex items-center justify-between border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar user={u} size={12} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{u.name}</p>
                      <p className="text-[13px] text-zinc-400 truncate mt-0.5 max-w-[300px]">
                        {mode === 'student' ? (u.program || 'Programme not set') : (u.department || 'Department not set')}
                      </p>
                      {mode === 'student' && u.matricola && (
                        <p className="text-[11px] font-mono text-zinc-600 mt-1">ID: #{u.matricola}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    {renderActionButton(u)}
                    <ChevronRight size={18} className="text-zinc-700 group-hover:text-zinc-500 transition-colors hidden sm:block" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}