import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Upload, AlertCircle, CheckCircle, ExternalLink,
  BookOpen, Laptop, Utensils, Bus, GraduationCap, BookMarked,
  Mail, Calendar, Clock, UserCheck, Plus, Trash2, Search, CalendarCheck, X, Activity, Award
} from 'lucide-react'
import api from '../utils/api'
import { serviceLinks, academicCalendar, programmes } from '../utils/unime_data'

const programmeYearLookup = [...programmes.bachelors, ...programmes.masters, ...programmes.singleCycle]
  .reduce((acc, p) => ({ ...acc, [p.name]: p.years }), {})

const serviceIcons = {
  'ESSE3': Laptop, 'Moodle': BookOpen, 'Email': Mail,
  'ERSU App': Utensils, 'SBA': BookMarked, 'ESN': GraduationCap,
  'Bus Pass': Bus, 'Apply': ExternalLink,
}

const SERVICE_SECTIONS = [
  { id: 'timetable',   title: 'Lesson Timetable',      description: 'Your weekly schedule by year and semester.', color: 'text-indigo-400',   bg: 'bg-indigo-500/10',   border: 'border-indigo-500/30',   icon: Clock        },
  { id: 'calendar',    title: 'Academic Calendar',     description: 'Dates, exam sessions and public holidays.',     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Calendar     },
  { id: 'appointment', title: 'Book an Appointment',   description: 'Book a slot with a professor or manage your schedule.',  color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   icon: CalendarCheck},
  { id: 'online',      title: 'Online Services',       description: 'ESSE3, Moodle, institutional email and more.',           color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30',  icon: Laptop       },
  { id: 'support',     title: 'Student Support',       description: 'ERSU canteen, bus pass, ESN and housing.',               color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: GraduationCap},
]

const parseDate = (str) => { if (!str) return null; return new Date(str.split('–')[0].trim()) }
const isUpcoming = (dateStr) => { const d = parseDate(dateStr); return d ? d >= new Date() : false }
const isActive = (startStr, endStr) => {
  if (!startStr) return false
  const start = parseDate(startStr), end = endStr ? parseDate(endStr) : start, now = new Date()
  return start <= now && now <= end
}
const CAL_TABS = [{ id: 'lessons', label: 'Lessons' }, { id: 'exams', label: 'Exam Sessions' }, { id: 'holidays', label: 'Holidays' }]

// Academic Progress Tracker Component
function AcademicTracker({ user }) {
  if (user?.role !== 'student') return null;

  // Mock progress data for visual effect
  const totalCredits = 180;
  const earnedCredits = 112;
  const percentage = Math.round((earnedCredits / totalCredits) * 100);
  
  return (
    <div className="glass rounded-3xl p-6 mb-8 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" size={20} /> Academic Progress
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Track your degree completion status.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">GPA Est.</p>
          <p className="text-xl font-black text-white">28.4 <span className="text-xs text-zinc-500 font-medium">/ 30</span></p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="40" fill="transparent" 
              stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{percentage}%</span>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Completed</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-white">CFU Accumulation</span>
              <span className="text-zinc-500">{earnedCredits} / {totalCredits} Credits</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><BookOpen size={12}/> Exams Passed</p>
              <p className="text-lg font-bold text-white">14 <span className="text-xs text-zinc-600 font-medium ml-1">/ 22</span></p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Award size={12}/> Next Milestone</p>
              <p className="text-sm font-bold text-white mt-1 truncate">Thesis Proposal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarSection() {
  const [calTab, setCalTab] = useState('lessons')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/5 shadow-inner">
        {CAL_TABS.map(t => (
          <button key={t.id} onClick={() => setCalTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${calTab === t.id ? 'bg-indigo-600 shadow-md text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {calTab === 'lessons' && academicCalendar?.semesters?.map((sem, i) => {
          const active = isActive(sem.start, sem.end), upcoming = !active && isUpcoming(sem.start)
          return (
            <div key={i} className={`rounded-2xl p-4 border transition-all ${active ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : upcoming ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {active && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />}
                  <p className={`text-sm font-bold ${active ? 'text-indigo-300' : 'text-white'}`}>{sem.name}</p>
                </div>
                {active && <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Ongoing</span>}
                {upcoming && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 border border-white/5 px-3 py-1 rounded-full">Upcoming</span>}
                {!active && !upcoming && <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Completed</span>}
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-medium ml-5">{sem.start} → {sem.end}</p>
            </div>
          )
        })}
        {calTab === 'exams' && academicCalendar?.examSessions?.map((s, i) => {
          const active = isActive(s.start, s.end), upcoming = !active && isUpcoming(s.start)
          return (
            <div key={i} className={`rounded-2xl p-4 border ${active ? 'bg-purple-500/10 border-purple-500/30' : upcoming ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {active && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />}
                  <p className={`text-sm font-bold ${active ? 'text-purple-300' : 'text-white'}`}>{s.name}</p>
                </div>
                {active && <span className="text-[10px] font-black text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Now</span>}
                {upcoming && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 border border-white/5 px-3 py-1 rounded-full">Upcoming</span>}
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-medium ml-5">{s.start} → {s.end}</p>
            </div>
          )
        })}
        {calTab === 'holidays' && academicCalendar?.holidays?.map((h, i) => {
          const upcoming = isUpcoming(h.date)
          return (
            <div key={i} className={`rounded-2xl px-5 py-4 border flex items-center justify-between ${upcoming ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
              <p className={`text-sm font-bold ${upcoming ? 'text-zinc-200' : 'text-zinc-600'}`}>{h.name}</p>
              <p className={`text-xs font-semibold ${upcoming ? 'text-zinc-400' : 'text-zinc-700'}`}>{h.date}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function AppointmentSection({ user }) {
  const isProfessor = user?.role === 'professor'

  // Professor state
  const [mySlots, setMySlots] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSlots, setNewSlots] = useState([{ date: '', startTime: '', endTime: '', note: '' }])
  const [creating, setCreating] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState({})

  // Student state
  const [profSearch, setProfSearch] = useState('')
  const [professors, setProfessors] = useState([])
  const [selectedProf, setSelectedProf] = useState(null)
  const [profSlots, setProfSlots] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [bookingLoading, setBookingLoading] = useState({})
  const [cancelLoading, setCancelLoading] = useState({})

  useEffect(() => {
    if (isProfessor) {
      api.get('/appointments/slots/mine').then(r => setMySlots(r.data)).catch(() => {})
    } else {
      api.get('/appointments/my-bookings').then(r => setMyBookings(r.data)).catch(() => {})
      api.get('/appointments/professors').then(r => setProfessors(r.data)).catch(() => {})
    }
  }, [isProfessor])

  // ── Professor handlers ──
  const updateSlotRow = (i, field, val) =>
    setNewSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const handleCreateSlots = async () => {
    if (newSlots.some(s => !s.date || !s.startTime || !s.endTime)) return
    setCreating(true)
    try {
      const res = await api.post('/appointments/slots', { slots: newSlots })
      setMySlots(prev => [...prev, ...res.data].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)))
      setNewSlots([{ date: '', startTime: '', endTime: '', note: '' }])
      setShowCreateForm(false)
    } catch (err) { alert(err.response?.data?.message || 'Failed to create slots') }
    finally { setCreating(false) }
  }

  const handleDeleteSlot = async (slotId) => {
    setDeleteLoading(prev => ({ ...prev, [slotId]: true }))
    try {
      await api.delete(`/appointments/slots/${slotId}`)
      setMySlots(prev => prev.filter(s => s._id !== slotId))
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete slot') }
    finally { setDeleteLoading(prev => ({ ...prev, [slotId]: false })) }
  }

  // ── Student handlers ──
  const handleSelectProf = async (prof) => {
    setSelectedProf(prof); setProfSlots([])
    try {
      const res = await api.get(`/appointments/slots/${prof._id}`)
      setProfSlots(res.data)
    } catch {}
  }

  const handleBook = async (slotId) => {
    setBookingLoading(prev => ({ ...prev, [slotId]: true }))
    try {
      await api.post(`/appointments/book/${slotId}`)
      setProfSlots(prev => prev.filter(s => s._id !== slotId))
      const bookingsRes = await api.get('/appointments/my-bookings')
      setMyBookings(bookingsRes.data)
    } catch (err) { alert(err.response?.data?.message || 'Booking failed') }
    finally { setBookingLoading(prev => ({ ...prev, [slotId]: false })) }
  }

  const handleCancelBooking = async (slotId) => {
    setCancelLoading(prev => ({ ...prev, [slotId]: true }))
    try {
      await api.delete(`/appointments/book/${slotId}`)
      setMyBookings(prev => prev.filter(s => s._id !== slotId))
    } catch (err) { alert(err.response?.data?.message || 'Cancel failed') }
    finally { setCancelLoading(prev => ({ ...prev, [slotId]: false })) }
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 14)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const filteredProfs = professors.filter(p =>
    p.name.toLowerCase().includes(profSearch.toLowerCase()) ||
    (p.department || '').toLowerCase().includes(profSearch.toLowerCase())
  )

  // ── Professor UI ──
  if (isProfessor) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Your Available Slots</p>
          <p className="text-xs text-zinc-500 mt-0.5">{mySlots.filter(s => !s.isBooked).length} open · {mySlots.filter(s => s.isBooked).length} booked</p>
        </div>
        <button onClick={() => setShowCreateForm(v => !v)}
          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
          {showCreateForm ? '✕ Cancel' : '+ Add Slots'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">New Slots — next 14 days only</p>
          {newSlots.map((slot, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <input type="date" min={today} max={maxDateStr} value={slot.date}
                onChange={e => updateSlotRow(i, 'date', e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/50" />
              <input type="time" value={slot.startTime} onChange={e => updateSlotRow(i, 'startTime', e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/50 w-28" />
              <input type="time" value={slot.endTime} onChange={e => updateSlotRow(i, 'endTime', e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/50 w-28" />
              {newSlots.length > 1 && (
                <button onClick={() => setNewSlots(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
              )}
            </div>
          ))}
          <button onClick={() => setNewSlots(prev => [...prev, { date: '', startTime: '', endTime: '', note: '' }])}
            className="text-xs text-zinc-500 hover:text-white transition-colors">+ Add another slot</button>
          <button onClick={handleCreateSlots} disabled={creating || newSlots.some(s => !s.date || !s.startTime || !s.endTime)}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40">
            {creating ? 'Saving…' : `Save ${newSlots.length} Slot${newSlots.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {mySlots.length === 0 ? (
        <p className="text-xs text-zinc-600 italic text-center py-6">No upcoming slots. Add some above.</p>
      ) : (
        <div className="space-y-2">
          {mySlots.map(slot => (
            <div key={slot._id} className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${slot.isBooked ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/[0.02] border-white/5'}`}>
              <div>
                <p className="text-xs font-bold text-white">{slot.date} · {slot.startTime}–{slot.endTime}</p>
                {slot.isBooked && slot.bookedBy && (
                  <p className="text-[10px] text-rose-400 mt-0.5">Booked by {slot.bookedBy.name} ({slot.bookedBy.program || slot.bookedBy.email})</p>
                )}
              </div>
              {!slot.isBooked && (
                <button onClick={() => handleDeleteSlot(slot._id)} disabled={deleteLoading[slot._id]}
                  className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors font-bold disabled:opacity-40">
                  {deleteLoading[slot._id] ? '…' : 'Delete'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Student UI ──
  return (
    <div className="space-y-6">
      {/* My Bookings */}
      {myBookings.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Bookings</p>
          {myBookings.map(b => (
            <div key={b._id} className="flex items-center justify-between bg-rose-500/5 border border-rose-500/20 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs font-bold text-white">{b.professorId?.name}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{b.date} · {b.startTime}–{b.endTime} · {b.professorId?.department}</p>
              </div>
              <button onClick={() => handleCancelBooking(b._id)} disabled={cancelLoading[b._id]}
                className="text-[10px] text-zinc-600 hover:text-red-400 font-bold transition-colors disabled:opacity-40">
                {cancelLoading[b._id] ? '…' : 'Cancel'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Professor search */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Book an Appointment</p>
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search professor by name or department…"
            className="w-full bg-black/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-rose-500/50 placeholder-zinc-600"
            value={profSearch} onChange={e => { setProfSearch(e.target.value); setSelectedProf(null); setProfSlots([]) }} />
        </div>

        {/* Professor list */}
        {!selectedProf && filteredProfs.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredProfs.map(p => (
              <button key={p._id} onClick={() => handleSelectProf(p)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-rose-500/5 hover:border-rose-500/20 transition-all text-left">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {p.avatarUrl ? <img src={p.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" /> : p.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-zinc-500">{p.department}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected professor's slots */}
        {selectedProf && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">{selectedProf.name}&apos;s available slots</p>
              <button onClick={() => { setSelectedProf(null); setProfSlots([]) }}
                className="text-[10px] text-zinc-500 hover:text-white transition-colors">← Back</button>
            </div>
            {profSlots.length === 0 ? (
              <p className="text-xs text-zinc-600 italic py-4 text-center">No available slots from this professor.</p>
            ) : (
              <div className="space-y-2">
                {profSlots.map(slot => (
                  <div key={slot._id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white">{slot.date}</p>
                      <p className="text-[10px] text-zinc-400">{slot.startTime}–{slot.endTime}</p>
                    </div>
                    <button onClick={() => handleBook(slot._id)} disabled={bookingLoading[slot._id]}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold transition-colors disabled:opacity-40">
                      {bookingLoading[slot._id] ? '…' : 'Book'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [user, setUser] = useState(null)
  const [openSection, setOpenSection] = useState('timetable')
  const [selectedYear, setSelectedYear] = useState(1)
  const [selectedSemester, setSelectedSemester] = useState(2)
  const [timetable, setTimetable] = useState(null)
  const [timetableLoading, setTimetableLoading] = useState(false)
  const [myProgrammes, setMyProgrammes] = useState([])

  // Upload panel state (professors only)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadYear, setUploadYear] = useState(1)
  const [uploadSemester, setUploadSemester] = useState(1)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      if (parsed.role === 'professor') {
        api.get('/timetables/my-programmes').then(res => setMyProgrammes(res.data)).catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (openSection === 'timetable' && programme) fetchTimetable()
  }, [openSection, selectedYear, selectedSemester, user])

  const programme = !user ? null : user.role === 'student' ? user.program : myProgrammes[0] || null
  const programmeYearCount = programme ? (programmeYearLookup[programme] || 3) : 3

  const fetchTimetable = async () => {
    if (!programme) return
    setTimetableLoading(true); setTimetable(null)
    try {
      const res = await api.get(`/timetables/${encodeURIComponent(programme)}/${selectedYear}/${selectedSemester}`)
      setTimetable(res.data)
    } catch (err) {} finally { setTimetableLoading(false) }
  }

  const handleUpload = async () => {
    if (!uploadFile || !programme) return
    setUploading(true); setUploadMsg(null)
    try {
      const formData = new FormData()
      formData.append('media', uploadFile)
      const uploadRes = await api.post('/upload', formData)
      await api.post('/timetables', {
        programme, year: uploadYear, semester: uploadSemester, academicYear: '2025-2026',
        mediaUrl: uploadRes.data.url, mediaPublicId: uploadRes.data.publicId || null,
        mediaType: uploadFile.type === 'application/pdf' ? 'pdf' : 'image',
      })
      setUploadMsg({ ok: true, text: 'Uploaded successfully!' })
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (selectedYear === uploadYear && selectedSemester === uploadSemester) fetchTimetable()
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || 'Upload failed.' })
    } finally { setUploading(false) }
  }

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)

  const renderTimetableContent = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Professor upload panel */}
      {user?.role === 'professor' && programme && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
          <button onClick={() => { setShowUpload(v => !v); setUploadMsg(null) }}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-amber-400 hover:bg-amber-500/5 transition-colors">
            <span>{showUpload ? '✕ Cancel Upload' : '↑ Upload Timetable'}</span>
            <span className="text-zinc-600 font-normal">{programme}</span>
          </button>
          {showUpload && (
            <div className="px-5 pb-5 space-y-4 border-t border-amber-500/10">
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Year</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: programmeYearCount }, (_, i) => i + 1).map(y => (
                      <button key={y} onClick={() => setUploadYear(y)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${uploadYear === y ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>
                        Y{y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Semester</p>
                  <div className="flex gap-1.5">
                    {[1, 2].map(s => (
                      <button key={s} onClick={() => setUploadSemester(s)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${uploadSemester === s ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>
                        S{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${uploadFile ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}>
                {uploadFile
                  ? <p className="text-xs font-bold text-amber-400">{uploadFile.name}</p>
                  : <p className="text-xs text-zinc-600">Click to select PDF or image</p>}
              </div>
              <input ref={fileInputRef} type="file" hidden accept="image/*,application/pdf"
                onChange={e => { setUploadFile(e.target.files[0] || null); setUploadMsg(null) }} />
              {uploadMsg && (
                <p className={`text-xs font-bold ${uploadMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{uploadMsg.text}</p>
              )}
              <button onClick={handleUpload} disabled={uploading || !uploadFile}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-30">
                {uploading ? 'Uploading…' : `Upload Year ${uploadYear} Sem ${uploadSemester}`}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Year of Study</p>
          <div className="flex gap-2">
            {Array.from({ length: programmeYearCount }, (_, i) => i + 1).map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedYear === y ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                Year {y}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Semester</p>
          <div className="flex gap-2">
            {[1,2].map(s => (
              <button key={s} onClick={() => setSelectedSemester(s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedSemester === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                Sem {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black/50 border border-white/5 rounded-2xl min-h-[400px] overflow-hidden flex items-center justify-center relative shadow-inner">
        {timetableLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Syncing via ESSE3...</p>
          </div>
        ) : timetable ? (
          <div className="w-full h-full relative group">
             {timetable.mediaType === 'pdf' 
               ? <iframe src={timetable.mediaUrl} className="w-full h-[600px] bg-white rounded-2xl" /> 
               : <img src={timetable.mediaUrl} className="w-full h-auto max-h-[800px] object-contain" />
             }
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={timetable.mediaUrl} target="_blank" className="bg-zinc-900/90 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/10 hover:bg-zinc-800 transition-colors">
                  <ExternalLink size={14} /> View Full
                </a>
             </div>
          </div>
        ) : (
          <div className="text-center p-8">
             <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
               <Calendar className="text-zinc-600" size={24} />
             </div>
             <p className="text-sm font-bold text-white mb-1">No Schedule Available</p>
             <p className="text-xs text-zinc-500 max-w-[250px] mx-auto">The teaching department hasn&apos;t published the timetable for this selection yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Student Dashboard</h1>
        <p className="text-zinc-400 font-medium">Manage your academic life and university services.</p>
      </header>

      <AcademicTracker user={user} />

      <div className="space-y-4">
        {SERVICE_SECTIONS.map(section => {
          const Icon = section.icon
          const isOpen = openSection === section.id
          
          return (
            <div key={section.id} className={`glass rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-white/10 ring-1 ring-white/5 shadow-2xl' : 'border-white/5 hover:border-white/10'}`}>
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-5 p-6 transition-colors hover:bg-white/[0.02]">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${section.bg} border ${section.border} shadow-inner`}>
                  <Icon size={22} className={section.color} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[17px] font-bold text-white">{section.title}</p>
                  <p className="text-[13px] text-zinc-400 font-medium mt-0.5">{section.description}</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/10' : ''}`}>
                   <ChevronDown size={18} className={isOpen ? 'text-white' : 'text-zinc-500'} />
                </div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-white/5">
                    <div className="p-6 bg-black/20">
                      {section.id === 'timetable'   && renderTimetableContent()}
                      {section.id === 'calendar'    && <CalendarSection />}
                      {section.id === 'appointment' && <AppointmentSection user={user} />}
                      {section.id === 'online' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {serviceLinks?.filter(s => ['ESSE3','Moodle','Email','SBA','Apply'].includes(s.name)).map((s, i) => {
                            const SIcon = serviceIcons[s.name] || ExternalLink
                            return (
                              <a key={i} href={s.url} target="_blank" className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-colors group shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><SIcon size={18} className="text-emerald-400" /></div>
                                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{s.name}</p></div>
                                <ExternalLink size={14} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                              </a>
                            )
                          })}
                        </div>
                      )}
                      {section.id === 'support' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {serviceLinks?.filter(s => ['ERSU App','ESN','Bus Pass'].includes(s.name)).map((s, i) => {
                            const SIcon = serviceIcons[s.name] || ExternalLink
                            return (
                              <a key={i} href={s.url} target="_blank" className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-colors group shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><SIcon size={18} className="text-amber-400" /></div>
                                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{s.name}</p></div>
                                <ExternalLink size={14} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}