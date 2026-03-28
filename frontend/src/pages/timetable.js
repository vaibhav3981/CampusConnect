import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Home, MapPin, LayoutGrid, Bell,
  ChevronDown, ChevronRight, Upload, AlertCircle,
  CheckCircle, ExternalLink, BookOpen, Laptop,
  Utensils, Bus, GraduationCap, BookMarked, Mail,
  Calendar, Clock, UserCheck, Plus, Trash2, Search,
  CalendarCheck, X
} from 'lucide-react'
import api from '../utils/api'
import { serviceLinks, academicCalendar } from '../utils/unime_data'

const serviceIcons = {
  'ESSE3': Laptop, 'Moodle': BookOpen, 'Email': Mail,
  'ERSU App': Utensils, 'SBA': BookMarked, 'ESN': GraduationCap,
  'Bus Pass': Bus, 'Apply': ExternalLink,
}

const SERVICE_SECTIONS = [
  { id: 'timetable',   title: 'Timetable',            description: 'Find your weekly lesson schedule by year and semester.', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: Clock        },
  { id: 'calendar',    title: 'Academic Calendar',     description: 'Semester dates, exam sessions and public holidays.',     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Calendar     },
  { id: 'appointment', title: 'Book an Appointment',   description: 'Book a slot with a professor or manage your schedule.',  color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   icon: CalendarCheck},
  { id: 'online',      title: 'Online Services',       description: 'ESSE3, Moodle, institutional email and more.',           color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: Laptop       },
  { id: 'support',     title: 'Student Support',       description: 'ERSU canteen, bus pass, ESN and housing.',               color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: GraduationCap},
]

// ── Calendar helpers ──
const parseDate = (str) => { if (!str) return null; return new Date(str.split('–')[0].trim()) }
const isUpcoming = (dateStr) => { const d = parseDate(dateStr); return d ? d >= new Date() : false }
const isActive = (startStr, endStr) => {
  if (!startStr) return false
  const start = parseDate(startStr), end = endStr ? parseDate(endStr) : start, now = new Date()
  return start <= now && now <= end
}
const CAL_TABS = [{ id: 'lessons', label: 'Lessons' }, { id: 'exams', label: 'Exam Sessions' }, { id: 'holidays', label: 'Holidays' }]

function CalendarSection() {
  const [calTab, setCalTab] = useState('lessons')
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {CAL_TABS.map(t => (
          <button key={t.id} onClick={() => setCalTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition ${calTab === t.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {calTab === 'lessons' && (
        <div className="space-y-2">
          {academicCalendar?.semesters?.map((sem, i) => {
            const active = isActive(sem.start, sem.end), upcoming = !active && isUpcoming(sem.start)
            return (
              <div key={i} className={`rounded-xl p-4 border ${active ? 'bg-blue-500/10 border-blue-500/20' : upcoming ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {active && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />}
                    <p className={`text-xs font-bold ${active ? 'text-blue-300' : 'text-white'}`}>{sem.name}</p>
                  </div>
                  {active && <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">Now</span>}
                  {upcoming && <span className="text-[9px] font-black text-gray-500 uppercase">Upcoming</span>}
                  {!active && !upcoming && <span className="text-[9px] text-gray-700 uppercase">Done</span>}
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5 ml-4">{sem.start} → {sem.end}</p>
              </div>
            )
          })}
        </div>
      )}
      {calTab === 'exams' && (
        <div className="space-y-2">
          {academicCalendar?.examSessions?.map((s, i) => {
            const active = isActive(s.start, s.end), upcoming = !active && isUpcoming(s.start)
            return (
              <div key={i} className={`rounded-xl p-4 border ${active ? 'bg-amber-500/10 border-amber-500/20' : upcoming ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {active && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                    <p className={`text-xs font-bold ${active ? 'text-amber-300' : 'text-white'}`}>{s.name}</p>
                  </div>
                  {active && <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">Now</span>}
                  {upcoming && <span className="text-[9px] font-black text-gray-500 uppercase">Upcoming</span>}
                  {!active && !upcoming && <span className="text-[9px] text-gray-700 uppercase">Done</span>}
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5 ml-4">{s.start} → {s.end}</p>
              </div>
            )
          })}
        </div>
      )}
      {calTab === 'holidays' && (
        <div className="space-y-2">
          {academicCalendar?.holidays?.map((h, i) => {
            const upcoming = isUpcoming(h.date)
            return (
              <div key={i} className={`rounded-xl px-4 py-3 border flex items-center justify-between ${upcoming ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                <p className={`text-xs font-medium ${upcoming ? 'text-gray-200' : 'text-gray-600'}`}>{h.name}</p>
                <p className={`text-[10px] ${upcoming ? 'text-gray-400' : 'text-gray-700'}`}>{h.date}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Appointment Section ──
function AppointmentSection({ user }) {
  const isProfessor = user?.role === 'professor'

  // Professor state
  const [mySlots, setMySlots] = useState([])
  const [newSlots, setNewSlots] = useState([{ date: '', startTime: '', endTime: '', note: '' }])
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(false)

  // Student state
  const [profSearch, setProfSearch] = useState('')
  const [professors, setProfessors] = useState([])
  const [selectedProf, setSelectedProf] = useState(null)
  const [profSlots, setProfSlots] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [bookingId, setBookingId] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 14)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  useEffect(() => {
    if (isProfessor) {
      api.get('/appointments/slots/mine').then(r => setMySlots(r.data)).catch(() => {})
    } else {
      api.get('/appointments/my-bookings').then(r => setMyBookings(r.data)).catch(() => {})
      api.get('/appointments/professors').then(r => setProfessors(r.data)).catch(() => {})
    }
  }, [isProfessor])

  useEffect(() => {
    if (!isProfessor && profSearch.length > 0) {
      api.get(`/appointments/professors?q=${profSearch}`).then(r => setProfessors(r.data)).catch(() => {})
    }
  }, [profSearch])

  const handleSelectProf = async (prof) => {
    setSelectedProf(prof)
    try {
      const r = await api.get(`/appointments/slots/${prof._id}`)
      setProfSlots(r.data)
    } catch { setProfSlots([]) }
  }

  const handleBook = async (slotId) => {
    setBookingId(slotId)
    try {
      await api.post(`/appointments/book/${slotId}`)
      setProfSlots(prev => prev.filter(s => s._id !== slotId))
      const r = await api.get('/appointments/my-bookings')
      setMyBookings(r.data)
    } catch (err) { alert(err.response?.data?.message || 'Booking failed') }
    finally { setBookingId(null) }
  }

  const handleCancelBooking = async (slotId) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await api.delete(`/appointments/book/${slotId}`)
      setMyBookings(prev => prev.filter(b => b._id !== slotId))
    } catch (err) { alert(err.response?.data?.message || 'Cancel failed') }
  }

  const handleCreateSlots = async () => {
    const valid = newSlots
      .map(s => {
        // Normalize DD/MM/YYYY (Safari) → YYYY-MM-DD
        let date = s.date
        if (date && date.includes('/')) {
          const parts = date.split('/')
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts
            date = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
          }
        }
        return { ...s, date }
      })
      .filter(s => s.date && s.startTime && s.endTime)
    if (!valid.length) { setCreateError('Fill in at least one complete slot.'); return }
    setCreating(true); setCreateError(''); setCreateSuccess(false)
    try {
      await api.post('/appointments/slots', { slots: valid })
      setCreateSuccess(true)
      setNewSlots([{ date: '', startTime: '', endTime: '', note: '' }])
      setShowCreateForm(false)
      const r = await api.get('/appointments/slots/mine')
      setMySlots(r.data)
    } catch (err) { setCreateError(err.response?.data?.message || 'Failed to create slots') }
    finally { setCreating(false) }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Delete this slot?')) return
    try {
      await api.delete(`/appointments/slots/${slotId}`)
      setMySlots(prev => prev.filter(s => s._id !== slotId))
    } catch (err) { alert(err.response?.data?.message || 'Delete failed') }
  }

  const addSlotRow = () => setNewSlots(prev => [...prev, { date: '', startTime: '', endTime: '', note: '' }])
  const removeSlotRow = (i) => setNewSlots(prev => prev.filter((_, idx) => idx !== i))
  const updateSlotRow = (i, field, val) => setNewSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const formatSlotDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })

  // Group professor's slots by date
  const slotsByDate = mySlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  // ── PROFESSOR VIEW ──
  if (isProfessor) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Your Appointment Slots</p>
          <p className="text-xs text-gray-400">{mySlots.length} upcoming slot{mySlots.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowCreateForm(v => !v); setCreateSuccess(false); setCreateError('') }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-full hover:bg-rose-500/10 transition">
          <Plus size={11} /> {showCreateForm ? 'Cancel' : 'Add Slots'}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-black/30 border border-rose-500/10 rounded-xl p-4 space-y-4">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">New Appointment Slots</p>
          <div className="space-y-3">
            {newSlots.map((slot, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_2fr_auto] gap-2 items-end">
                <div>
                  {i === 0 && <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Date</p>}
                  <input type="date" min={today} max={maxDateStr} value={slot.date}
                    onChange={e => updateSlotRow(i, 'date', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-rose-500/40" />
                </div>
                <div>
                  {i === 0 && <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Start</p>}
                  <input type="time" value={slot.startTime}
                    onChange={e => updateSlotRow(i, 'startTime', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-rose-500/40" />
                </div>
                <div>
                  {i === 0 && <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">End</p>}
                  <input type="time" value={slot.endTime}
                    onChange={e => updateSlotRow(i, 'endTime', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-rose-500/40" />
                </div>
                <div>
                  {i === 0 && <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Note (optional)</p>}
                  <input type="text" placeholder="e.g. Office hours" value={slot.note}
                    onChange={e => updateSlotRow(i, 'note', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-rose-500/40 placeholder-gray-700" />
                </div>
                <button onClick={() => removeSlotRow(i)} className="text-gray-700 hover:text-red-500 transition mt-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addSlotRow} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition">
            <Plus size={11} /> Add another slot
          </button>
          {createError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {createError}</p>}
          {createSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={11} /> Slots created!</p>}
          <button onClick={handleCreateSlots} disabled={creating}
            className="w-full bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition disabled:opacity-30">
            {creating ? 'Creating...' : 'Create Slots'}
          </button>
        </div>
      )}

      {/* Slots list */}
      {mySlots.length === 0 && !showCreateForm && (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-600">
          <CalendarCheck size={16} />
          <p className="text-sm">No upcoming slots. Add some for students to book!</p>
        </div>
      )}

      {Object.entries(slotsByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
        <div key={date}>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">{formatSlotDate(date)}</p>
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot._id} className={`rounded-xl p-3 border flex items-center justify-between ${slot.isBooked ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${slot.isBooked ? 'bg-green-400' : 'bg-gray-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">{slot.startTime} – {slot.endTime}</p>
                    {slot.note && <p className="text-[10px] text-gray-500">{slot.note}</p>}
                    {slot.isBooked && slot.bookedBy && (
                      <p className="text-[10px] text-green-400 mt-0.5">Booked by {slot.bookedBy.name} · {slot.bookedBy.program || slot.bookedBy.email}</p>
                    )}
                  </div>
                </div>
                {!slot.isBooked && (
                  <button onClick={() => handleDeleteSlot(slot._id)} className="text-gray-700 hover:text-red-500 transition p-1">
                    <Trash2 size={13} />
                  </button>
                )}
                {slot.isBooked && <span className="text-[9px] font-bold text-green-400 uppercase">Booked</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // ── STUDENT VIEW ──
  return (
    <div className="space-y-5">
      {/* My bookings */}
      {myBookings.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Your Appointments</p>
          <div className="space-y-2">
            {myBookings.map(b => (
              <div key={b._id} className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${b.professorId?.avatarUrl ? '' : 'bg-amber-600'}`}>
                    {b.professorId?.avatarUrl
                      ? <img src={b.professorId.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                      : b.professorId?.name?.[0]
                    }
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{b.professorId?.name}</p>
                    <p className="text-[10px] text-gray-500">{formatSlotDate(b.date)} · {b.startTime} – {b.endTime}</p>
                    {b.note && <p className="text-[10px] text-gray-600 italic">{b.note}</p>}
                  </div>
                </div>
                <button onClick={() => handleCancelBooking(b._id)} className="text-[9px] text-gray-600 hover:text-red-400 transition font-bold uppercase">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search professors */}
      <div>
        <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Search Professors</p>
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input type="text" placeholder="Search by name or department..."
            value={profSearch}
            onChange={e => setProfSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white outline-none focus:border-rose-500/30 placeholder-gray-600" />
        </div>
      </div>

      {/* Professor list */}
      {!selectedProf && professors.length > 0 && (
        <div className="space-y-2">
          {professors.map(prof => (
            <button key={prof._id} onClick={() => handleSelectProf(prof)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-amber-600 overflow-hidden`}>
                {prof.avatarUrl ? <img src={prof.avatarUrl} className="w-8 h-8 object-cover" /> : prof.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{prof.name}</p>
                <p className="text-[10px] text-gray-500">{prof.department}</p>
              </div>
              <ChevronRight size={13} className="text-gray-600 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Selected professor slots */}
      {selectedProf && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0">
                {selectedProf.avatarUrl ? <img src={selectedProf.avatarUrl} className="w-7 h-7 object-cover" /> : selectedProf.name?.[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{selectedProf.name}</p>
                <p className="text-[9px] text-gray-500">{selectedProf.department}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedProf(null); setProfSlots([]) }}
              className="text-[9px] text-gray-500 hover:text-white transition uppercase tracking-widest font-bold flex items-center gap-1">
              <X size={11} /> Back
            </button>
          </div>

          {profSlots.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-600">
              <CalendarCheck size={16} />
              <p className="text-sm">No available slots right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Available Slots</p>
              {profSlots.map(slot => (
                <div key={slot._id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-white/10 transition">
                  <div>
                    <p className="text-xs font-bold text-white">{formatSlotDate(slot.date)}</p>
                    <p className="text-[10px] text-gray-500">{slot.startTime} – {slot.endTime}</p>
                    {slot.note && <p className="text-[10px] text-gray-600 italic mt-0.5">{slot.note}</p>}
                  </div>
                  <button onClick={() => handleBook(slot._id)} disabled={bookingId === slot._id}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-rose-500 hover:bg-rose-400 px-3 py-1.5 rounded-full transition disabled:opacity-50">
                    <UserCheck size={11} /> {bookingId === slot._id ? 'Booking...' : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [user, setUser] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const [selectedYear, setSelectedYear] = useState(1)
  const [selectedSemester, setSelectedSemester] = useState(2)
  const [timetable, setTimetable] = useState(null)
  const [timetableLoading, setTimetableLoading] = useState(false)
  const [timetableError, setTimetableError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadYear, setUploadYear] = useState(1)
  const [uploadSemester, setUploadSemester] = useState(2)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [myProgrammes, setMyProgrammes] = useState([])

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

  const programme = !user ? null
    : user.role === 'student' ? (user.program || null)
    : user.role === 'professor' ? (myProgrammes[0] || null)
    : null

  const canUploadTimetable = user?.role === 'professor' && myProgrammes.length > 0

  const fetchTimetable = async () => {
    if (!programme) return
    setTimetableLoading(true); setTimetableError(''); setTimetable(null)
    try {
      const res = await api.get(`/timetables/${encodeURIComponent(programme)}/${selectedYear}/${selectedSemester}`)
      setTimetable(res.data)
    } catch (err) {
      setTimetableError(err.response?.status === 404 ? 'No timetable uploaded yet for this selection.' : 'Failed to load timetable.')
    } finally { setTimetableLoading(false) }
  }

  const handleUpload = async () => {
    if (!uploadFile || !programme) return
    setUploading(true); setUploadError(''); setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('media', uploadFile)
      const uploadRes = await api.post('/upload', formData)
      await api.post('/timetables', { programme, year: uploadYear, semester: uploadSemester, academicYear: '2025-2026', mediaUrl: uploadRes.data.url, mediaPublicId: uploadRes.data.publicId || null, mediaType: uploadFile.type === 'application/pdf' ? 'pdf' : 'image' })
      setUploadSuccess(true); setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (openSection === 'timetable' && selectedYear === uploadYear && selectedSemester === uploadSemester) fetchTimetable()
    } catch (err) { setUploadError(err.response?.data?.message || 'Upload failed.') }
    finally { setUploading(false) }
  }

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)

  const renderTimetableContent = () => {
    if (!programme) return (
      <div className="flex items-center gap-3 py-10 text-gray-600">
        <AlertCircle size={16} className="shrink-0" />
        <p className="text-sm">No programme set on your profile.{' '}<Link href="/profile" className="text-blue-400 hover:underline">Update your profile</Link>{' '}to see your timetable.</p>
      </div>
    )
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Programme</p>
            <p className="text-sm font-bold text-white">{programme}</p>
          </div>
          {canUploadTimetable && (
            <button onClick={() => setShowUpload(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 rounded-full hover:bg-amber-500/10 transition">
              <Upload size={11} /> {showUpload ? 'Cancel' : 'Upload Timetable'}
            </button>
          )}
        </div>
        {showUpload && canUploadTimetable && (
          <div className="bg-black/30 border border-amber-500/10 rounded-xl p-4 space-y-4">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Upload New Timetable</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Year</p>
                <div className="flex gap-1.5">
                  {[1,2,3].map(y => (<button key={y} onClick={() => setUploadYear(y)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${uploadYear === y ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>Y{y}</button>))}
                </div>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Semester</p>
                <div className="flex gap-1.5">
                  {[1,2].map(s => (<button key={s} onClick={() => setUploadSemester(s)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${uploadSemester === s ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>S{s}</button>))}
                </div>
              </div>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${uploadFile ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}>
              {uploadFile ? <p className="text-xs font-bold text-amber-400">{uploadFile.name}</p> : <><Upload size={16} className="text-gray-600 mx-auto mb-1" /><p className="text-xs text-gray-600">Click to select PDF or image</p></>}
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*,application/pdf" onChange={e => { setUploadFile(e.target.files[0] || null); setUploadSuccess(false); setUploadError('') }} />
            {uploadError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={11} /> Uploaded successfully!</p>}
            <button onClick={handleUpload} disabled={uploading || !uploadFile} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition disabled:opacity-30">{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Year</p>
            <div className="flex gap-1.5">{[1,2,3].map(y => (<button key={y} onClick={() => setSelectedYear(y)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${selectedYear === y ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>Y{y}</button>))}</div>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Semester</p>
            <div className="flex gap-1.5">{[1,2].map(s => (<button key={s} onClick={() => setSelectedSemester(s)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${selectedSemester === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>Sem {s}</button>))}</div>
          </div>
        </div>
        <div className="min-h-[120px]">
          {timetableLoading && <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
          {!timetableLoading && timetableError && <div className="flex items-center justify-center gap-2 py-12 text-gray-600"><AlertCircle size={16} /><p className="text-sm">{timetableError}</p></div>}
          {!timetableLoading && timetable && (
            <div>
              {timetable.mediaType === 'pdf' ? <iframe src={timetable.mediaUrl} className="w-full rounded-xl border border-white/5" style={{ height: '560px' }} /> : <img src={timetable.mediaUrl} alt="Timetable" className="w-full rounded-xl border border-white/5" />}
              <div className="flex items-center justify-between mt-2">
                <p className="text-[9px] text-gray-700">Updated by {timetable.uploadedBy?.name} · {new Date(timetable.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <a href={timetable.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 hover:text-blue-400 flex items-center gap-1"><ExternalLink size={9} /> Open full size</a>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <Link href="/feed" className="text-sm font-black text-white uppercase tracking-tighter">CampusConnect</Link>
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/feed',          icon: <Home size={13} />,       label: 'Feed' },
            { href: '/map',           icon: <MapPin size={13} />,     label: 'Find a Place' },
            { href: '/timetable',     icon: <LayoutGrid size={13} />, label: 'Services', active: true },
            { href: '/notifications', icon: <Bell size={13} />,       label: 'Notifications' },
          ].map(({ href, icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest transition ${active ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {icon} {label}
            </Link>
          ))}
        </div>
        <Link href="/profile" className="text-[10px] font-bold uppercase text-gray-500 hover:text-white transition">
          {user?.name?.split(' ')[0] || 'Profile'}
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">University of Messina</p>
          <h1 className="text-2xl font-black text-white">Student Services</h1>
          <p className="text-xs text-gray-500 mt-1">Everything you need in one place</p>
        </div>

        <div className="space-y-2">
          {SERVICE_SECTIONS.map(section => {
            const Icon = section.icon
            const isOpen = openSection === section.id
            return (
              <div key={section.id} className={`bg-[#111113] border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-white/10' : 'border-white/5'}`}>
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.bg} border ${section.border}`}>
                    <Icon size={18} className={section.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{section.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{section.description}</p>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-gray-500 shrink-0" /> : <ChevronRight size={16} className="text-gray-600 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 p-5">
                    {section.id === 'timetable'   && renderTimetableContent()}
                    {section.id === 'calendar'    && <CalendarSection />}
                    {section.id === 'appointment' && <AppointmentSection user={user} />}
                    {section.id === 'online' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {serviceLinks?.filter(s => ['ESSE3','Moodle','Email','SBA','Apply'].includes(s.name)).map((s, i) => {
                          const SIcon = serviceIcons[s.name] || ExternalLink
                          return (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition">
                              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0"><SIcon size={14} className="text-green-400" /></div>
                              <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{s.name}</p><p className="text-[9px] text-gray-600">Open →</p></div>
                            </a>
                          )
                        })}
                      </div>
                    )}
                    {section.id === 'support' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {serviceLinks?.filter(s => ['ERSU App','ESN','Bus Pass'].includes(s.name)).map((s, i) => {
                          const SIcon = serviceIcons[s.name] || ExternalLink
                          return (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><SIcon size={14} className="text-amber-400" /></div>
                              <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{s.name}</p><p className="text-[9px] text-gray-600">Open →</p></div>
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}