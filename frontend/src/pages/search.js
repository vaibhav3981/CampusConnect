import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Home, MapPin, LayoutGrid, Bell, Search, UserPlus, UserCheck, Users, GraduationCap, BookOpen } from 'lucide-react'
import api from '../utils/api'

const Avatar = ({ user: u, size = 9 }) => {
  const roleColor = u?.role === 'professor' ? 'bg-amber-600' : 'bg-blue-600'
  if (u?.avatarUrl) return <img src={u.avatarUrl} alt={u.name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />
  return <div className={`w-${size} h-${size} rounded-full flex items-center justify-center font-bold text-white shrink-0 text-sm ${roleColor}`}>{u?.name?.[0]}</div>
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('student') // 'student' | 'professor'
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

  // Re-search when mode changes if there's already a query
  useEffect(() => {
    setResults([])
    setConnectionStatuses({})
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
      // Search by name + filter by role on backend via separate param
      const isMatricola = /^\d{4,6}$/.test(q.trim())
      const res = await api.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
      // Filter client-side by mode
      const filtered = res.data.filter(u =>
        mode === 'student' ? u.role === 'student' : u.role === 'professor'
      )
      setResults(filtered)
      // Fetch relationship status for each
      filtered.forEach(u => fetchStatus(u))
    } catch { setResults([]) }
    finally { setLoading(false) }
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
        await api.delete(`/follows/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'none' }))
      } else {
        await api.post(`/follows/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'following' }))
      }
    } catch (err) { alert(err.response?.data?.message || 'Action failed') }
    finally { setActionLoading(prev => ({ ...prev, [targetUser._id]: false })) }
  }

  const handleConnect = async (targetUser) => {
    setActionLoading(prev => ({ ...prev, [targetUser._id]: true }))
    try {
      const status = connectionStatuses[targetUser._id]
      if (status === 'none' || !status) {
        await api.post(`/connections/request/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'pending_sent' }))
      } else if (status === 'pending_received') {
        await api.put(`/connections/accept/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'connected' }))
      } else if (status === 'connected') {
        await api.delete(`/connections/remove/${targetUser._id}`)
        setConnectionStatuses(prev => ({ ...prev, [targetUser._id]: 'none' }))
      }
    } catch (err) { alert(err.response?.data?.message || 'Action failed') }
    finally { setActionLoading(prev => ({ ...prev, [targetUser._id]: false })) }
  }

  const renderActionButton = (targetUser) => {
    if (targetUser._id === user?.id) return <span className="text-[9px] text-gray-600 uppercase tracking-widest">You</span>
    const status = connectionStatuses[targetUser._id]
    const busy = actionLoading[targetUser._id]

    if (targetUser.role === 'professor') {
      const isFollowing = status === 'following'
      return (
        <button onClick={(e) => { e.stopPropagation(); handleFollow(targetUser) }} disabled={busy}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${
            isFollowing ? 'bg-white/10 text-gray-300 border border-white/10 hover:bg-red-500/10 hover:text-red-400' : 'bg-white text-black hover:bg-gray-200'
          }`}>
          {isFollowing ? <><UserCheck size={10} /> Following</> : <><UserPlus size={10} /> Follow</>}
        </button>
      )
    }

    const config = {
      none:             { label: 'Add Friend',  icon: <UserPlus size={10} />,  style: 'bg-white text-black hover:bg-gray-200' },
      pending_sent:     { label: 'Requested',   icon: <UserCheck size={10} />, style: 'bg-white/10 text-gray-400 border border-white/10 cursor-not-allowed' },
      pending_received: { label: 'Accept',      icon: <UserCheck size={10} />, style: 'bg-blue-600 text-white hover:bg-blue-500' },
      connected:        { label: 'Connected',   icon: <Users size={10} />,     style: 'bg-white/10 text-gray-300 border border-white/10 hover:bg-red-500/10 hover:text-red-400' },
    }
    const c = config[status || 'none']
    return (
      <button onClick={(e) => { e.stopPropagation(); handleConnect(targetUser) }}
        disabled={busy || status === 'pending_sent'}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${c.style}`}>
        {c.icon} {c.label}
      </button>
    )
  }

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
            { href: '/notifications', icon: <Bell size={13} />,       label: 'Notifications' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition uppercase tracking-widest">
              {icon} {label}
            </Link>
          ))}
        </div>
        <Link href="/profile" className="text-[10px] font-bold uppercase text-gray-500 hover:text-white transition">
          {user?.name?.split(' ')[0] || 'Profile'}
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Search box — top centre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-6">Find People</h1>
          <div className="relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={mode === 'student' ? 'Search student name or matricola…' : 'Search professor name…'}
              className="w-full bg-[#111113] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/40 placeholder-gray-600 transition"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* Mode toggle — 2 options below search */}
        <div className="flex gap-3 justify-center mb-8">
          <button onClick={() => { setMode('student'); setQuery(''); setResults([]) }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition ${
              mode === 'student'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}>
            <GraduationCap size={14} /> Search Students
          </button>
          <button onClick={() => { setMode('professor'); setQuery(''); setResults([]) }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition ${
              mode === 'professor'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}>
            <BookOpen size={14} /> Search Professors
          </button>
        </div>

        {/* Empty state */}
        {!query && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-sm">
              {mode === 'student'
                ? 'Type a student name or their 6-digit matricola number'
                : 'Type a professor name to find them'
              }
            </p>
          </div>
        )}

        {/* No results */}
        {query && !loading && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600">No {mode}s found for "{query}"</p>
          </div>
        )}

        {/* ── STUDENT RESULTS — 3 column table ── */}
        {mode === 'student' && results.length > 0 && (
          <div className="bg-[#111113] border border-white/5 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[180px_1fr_110px_130px] gap-0 px-5 py-3 border-b border-white/5">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Name</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Programme</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Matricola</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest"></p>
            </div>
            {/* Table rows */}
            {results.map((u, i) => (
              <div key={u._id}
                onClick={() => router.push(`/profile/${u._id}`)}
                className={`grid grid-cols-[180px_1fr_110px_130px] gap-0 items-center px-5 py-3.5 hover:bg-white/[0.03] transition cursor-pointer ${i !== results.length - 1 ? 'border-b border-white/5' : ''}`}>
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar user={u} size={8} />
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                </div>
                {/* Programme */}
                <p className="text-xs text-gray-400 truncate">{u.program || <span className="text-gray-700 italic">Not set</span>}</p>
                {/* Matricola */}
                <p className="text-xs font-mono text-gray-500">
                  {u.matricola ? `#${u.matricola}` : <span className="text-gray-700">—</span>}
                </p>
                {/* Action */}
                <div onClick={e => e.stopPropagation()}>
                  {renderActionButton(u)}
                </div>
              </div>
            ))}
            <div className="px-5 py-2 border-t border-white/5">
              <p className="text-[9px] text-gray-700 font-mono">{results.length} student{results.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
        )}

        {/* ── PROFESSOR RESULTS — 2 column table ── */}
        {mode === 'professor' && results.length > 0 && (
          <div className="bg-[#111113] border border-white/5 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[180px_1fr_130px] gap-0 px-5 py-3 border-b border-white/5">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Name</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Department</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest"></p>
            </div>
            {/* Table rows */}
            {results.map((u, i) => (
              <div key={u._id}
                onClick={() => router.push(`/profile/${u._id}`)}
                className={`grid grid-cols-[180px_1fr_130px] gap-0 items-center px-5 py-3.5 hover:bg-white/[0.03] transition cursor-pointer ${i !== results.length - 1 ? 'border-b border-white/5' : ''}`}>
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar user={u} size={8} />
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                </div>
                {/* Department */}
                <p className="text-xs text-gray-400 truncate">{u.department || <span className="text-gray-700 italic">Not set</span>}</p>
                {/* Action */}
                <div onClick={e => e.stopPropagation()}>
                  {renderActionButton(u)}
                </div>
              </div>
            ))}
            <div className="px-5 py-2 border-t border-white/5">
              <p className="text-[9px] text-gray-700 font-mono">{results.length} professor{results.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}