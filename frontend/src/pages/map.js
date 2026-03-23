import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Home, MapPin, LayoutGrid, Bell,
  BookOpen, UtensilsCrossed, Building2,
  Car, GraduationCap, X, Search,
  BedDouble, BookMarked, Microscope,
  ChevronRight, Navigation, Clock, Euro
} from 'lucide-react'
import { mensaLocations, libraries, residences } from '../utils/unime_data'

// ── Static Papardo buildings ──
const papardoBuildings = [
  { id: 'b1', name: 'Facoltà di Ingegneria',               type: 'faculty',   lat: 38.2588, lng: 15.5971, description: 'Main Engineering block. Houses DIECII departments and central lecture halls.', floor: 'Floor 0–3',       campus: 'papardo' },
  { id: 'b2', name: 'Dipartimento DIECII — Industriale',   type: 'lab',       lat: 38.2595, lng: 15.5962, description: 'Industrial engineering section, specialized labs and faculty offices.',          floor: 'Floor 1–2',       campus: 'papardo' },
  { id: 'b3', name: 'Edificio Scienze — Corpo Principale', type: 'faculty',   lat: 38.2604, lng: 15.5978, description: 'Main Science complex for Mathematics, Physics, and Natural Sciences.',           floor: 'Multiple Blocks',  campus: 'papardo' },
  { id: 'b4', name: 'Block B — Aule Didattiche',           type: 'classroom', lat: 38.2623, lng: 15.5969, description: 'Dedicated lecture hall building for large core classes.',                       floor: 'Ground & 1st',    campus: 'papardo' },
  { id: 'b5', name: 'Parcheggio Principale',               type: 'parking',   lat: 38.2592, lng: 15.5982, description: 'Largest parking area, accessible via the main gate.',                          floor: 'Outdoor',          campus: 'papardo' },
  { id: 'b6', name: 'Segreteria Studenti',                  type: 'admin',     lat: 38.2608, lng: 15.5973, description: 'Student admin office — enrolment, certificates, exam bookings.',               floor: 'Ground Floor',     campus: 'papardo' },
]

// ── Annunziata buildings ──
const annunziataBuildings = [
  { id: 'a1', name: 'Dipartimento ChiBioFarAm',            type: 'faculty',   lat: 38.26016076603155, lng: 15.599080794906943, description: 'Chemical, Biological, Pharmaceutical & Environmental Sciences department.',     floor: 'Multiple floors',  campus: 'papardo' },
  { id: 'a2', name: 'Facoltà di Veterinaria',              type: 'faculty',   lat: 38.23103543214268, lng: 15.551669787337943, description: 'Veterinary Sciences — clinics, labs and lecture halls.',                        floor: 'Multiple floors',  campus: 'annunziata' },
  { id: 'a3', name: 'Parcheggio Annunziata',               type: 'parking',   lat: 38.226778699625186, lng: 15.551182892477037, description: 'Main parking area at Annunziata campus.',                                      floor: 'Outdoor',          campus: 'annunziata' },
  { id: 'a4', name: 'Dipartimento DICAM',                    type: 'faculty',   lat: 38.23092899514196, lng: 15.551055572982621, description: 'Department of Ancient & Modern Civilisations.', floor: 'Multiple floors', campus: 'annunziata' },
]

// ── Central buildings ──
const centralBuildings = [
  { id: 'c1', name: 'Dipartimento di Economia',            type: 'faculty',   lat: 38.18945574154299, lng: 15.553718397679216, description: 'Department of Economics — lectures, exams and administrative offices.',         floor: 'Multiple floors',  campus: 'central' },
  { id: 'c2', name: "Dipartimento di Giurisprudenza",      type: 'faculty',   lat: 38.189128372847506, lng: 15.553524512374954, description: "Law Department — 'Salvatore Pugliatti', Dept. of Excellence 2023–27.",         floor: 'Multiple floors',  campus: 'central' },
  { id: 'c3', name: 'Dipartimento SCIPOG',                 type: 'faculty',   lat: 38.19271753044791, lng: 15.5472482417162, description: 'Political & Juridical Sciences department.',                                    floor: 'Multiple floors',  campus: 'central' },
  { id: 'c4', name: 'Biblioteca di Giurisprudenza',          type: 'library',   lat: 38.217223778333306, lng: 15.547109750661265, description: 'Central campus library — Giurisprudenza branch.', floor: 'Ground Floor', campus: 'central' },
]

// ── Policlinico buildings ──
const policlinicoBuildings = [
  { id: 'p1', name: 'Policlinico G. Martino — Medicina',  type: 'faculty',   lat: 38.16566514629457, lng: 15.537164367181518, description: 'Clinical & Experimental Medicine — main medical faculty building.',              floor: 'Multiple floors',  campus: 'policlinico' },
  { id: 'p2', name: 'Facoltà di Medicina e Chirurgia',    type: 'faculty',   lat: 38.1428506006919, lng: 15.527926525717856, description: 'Medicine & Surgery — single-cycle 6-year programme.',                           floor: 'Multiple floors',  campus: 'policlinico' },
]

const buildAllLocations = () => {
  const locs = [
    ...papardoBuildings,
    ...annunziataBuildings,
    ...centralBuildings,
    ...policlinicoBuildings,
  ]

  libraries.forEach((lib, i) => locs.push({
    id: `lib_${i}`, name: lib.name, type: 'library',
    lat: lib.lat, lng: lib.lng,
    description: 'SBA library — study rooms, lending, digital resources (IEEE, Scopus, Web of Science).',
    floor: 'Ground Floor', campus: lib.campus.toLowerCase(), url: lib.url,
  }))

  mensaLocations.forEach((m, i) => locs.push({
    id: `mensa_${i}`, name: m.name, type: 'cafeteria',
    lat: m.lat, lng: m.lng,
    description: `${m.address}`,
    floor: 'Main Hall', campus: m.campus.toLowerCase(),
    price: m.price, days: m.days, hours: m.hours,
  }))

  residences.forEach((r, i) => locs.push({
    id: `res_${i}`, name: r.name, type: 'residence',
    lat: r.lat, lng: r.lng,
    description: r.description,
    floor: 'Multiple floors', campus: r.campus.toLowerCase(),
  }))

  return locs
}

const allLocations = buildAllLocations()

const typeConfig = {
  faculty:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   label: 'Faculty',    color: '#3b82f6', Icon: GraduationCap },
  library:   { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Library',    color: '#a855f7', Icon: BookOpen },
  cafeteria: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Mensa',      color: '#f59e0b', Icon: UtensilsCrossed },
  residence: { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  label: 'Residence',  color: '#10b981', Icon: BedDouble },
  classroom: { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   label: 'Classroom',  color: '#06b6d4', Icon: BookMarked },
  lab:       { bg: 'bg-rose-500/10',   text: 'text-rose-400',   border: 'border-rose-500/20',   label: 'Lab',        color: '#f43f5e', Icon: Microscope },
  parking:   { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   label: 'Parking',    color: '#94a3b8', Icon: Car },
  admin:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: 'Admin',      color: '#f97316', Icon: Building2 },
}

const campusConfig = {
  papardo:     { label: 'Papardo',     center: [38.2605, 15.5972], zoom: 17 },
  annunziata:  { label: 'Annunziata',  center: [38.2295, 15.5505], zoom: 16 },
  central:     { label: 'Central',     center: [38.1894, 15.5535], zoom: 16 },
  policlinico: { label: 'Policlinico', center: [38.1657, 15.5372], zoom: 16 },
}

export default function MapPage() {
  const router = useRouter()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [activeCampus, setActiveCampus] = useState('papardo')

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return }
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (mapInstanceRef.current || L.DomUtil.get(mapRef.current)?._leaflet_id) return

      const map = L.map(mapRef.current, {
        center: campusConfig.papardo.center,
        zoom: campusConfig.papardo.zoom,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO', maxZoom: 20,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Styles
      const style = document.createElement('style')
      style.textContent = `
        .campus-tooltip { background:#111113!important; border:1px solid rgba(255,255,255,0.1)!important; color:#e5e7eb!important; font-size:11px!important; font-weight:600!important; border-radius:8px!important; padding:4px 10px!important; box-shadow:0 4px 12px rgba(0,0,0,0.5)!important; white-space:nowrap!important; }
        .campus-tooltip::before { border-top-color:rgba(255,255,255,0.1)!important; }
        .leaflet-container { background:#0a0a0b!important; }
        .marker-container { transition:transform 0.2s ease; }
        .marker-container:hover { transform:scale(1.15) translateY(-4px); }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
      `
      document.head.appendChild(style)

      allLocations.forEach((loc) => {
        const cfg = typeConfig[loc.type]
        const iconHTML = renderToStaticMarkup(
          <div style={{ backgroundColor: cfg.color, width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)' }}>
            <cfg.Icon size={18} strokeWidth={2.5} />
          </div>
        )
        const markerIcon = L.divIcon({ className: 'custom-marker', html: `<div class="marker-container">${iconHTML}</div>`, iconSize: [32, 32], iconAnchor: [16, 16] })
        const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon }).addTo(map)
        marker.bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -20], className: 'campus-tooltip' })
        marker.on('click', () => { setSelected(loc); map.flyTo([loc.lat, loc.lng], 18, { duration: 1 }) })
      })

      mapInstanceRef.current = map
    }

    initMap()
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [])

  const switchCampus = (id) => {
    setActiveCampus(id)
    setSelected(null)
    setSearch('')
    setFilter('all')
    const cfg = campusConfig[id]
    mapInstanceRef.current?.flyTo(cfg.center, cfg.zoom, { duration: 1 })
  }

  const filtered = allLocations.filter(loc =>
    loc.campus === activeCampus &&
    (filter === 'all' || loc.type === filter) &&
    loc.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-screen bg-[#0a0a0b] text-gray-200 flex flex-col overflow-hidden">

      {/* Navbar — matches feed.js exactly */}
      <nav className="h-14 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <Link href="/feed" className="text-xs font-black tracking-tighter uppercase text-white">CampusConnect</Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/feed',          icon: <Home size={13} />,     label: 'Feed' },
              { href: '/map',           icon: <MapPin size={13} />,   label: 'Find a Place', active: true },
              { href: '/timetable',     icon: <LayoutGrid size={13} />,label: 'Services' },
              { href: '/notifications', icon: <Bell size={13} />,     label: 'Notifications' },
            ].map(({ href, icon, label, active }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest transition ${
                  active ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/profile" className="text-[10px] font-bold uppercase text-gray-500 hover:text-white transition">
          {user?.name?.split(' ')[0] || 'Profile'}
        </Link>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — original design restored */}
        <aside className="w-80 bg-[#0d0d0f] border-r border-white/5 flex flex-col">

          {/* Header */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Navigation</p>
              <h1 className="text-lg font-bold text-white leading-none">{campusConfig[activeCampus].label} Campus</h1>
            </div>

            {/* Campus switcher */}
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(campusConfig).map(([id, cfg]) => (
                <button key={id} onClick={() => switchCampus(id)}
                  className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-wide transition ${
                    activeCampus === id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}>
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search buildings or labs..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'faculty', 'library', 'cafeteria', 'residence', 'classroom', 'lab', 'admin', 'parking'].map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                    filter === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Location list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
            {filtered.length === 0 ? (
              <p className="text-[10px] text-gray-600 italic text-center py-8">No places found</p>
            ) : filtered.map(loc => {
              const cfg = typeConfig[loc.type]
              return (
                <button key={loc.id} onClick={() => { setSelected(loc); mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 18) }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 hover:bg-white/5 group ${selected?.id === loc.id ? 'bg-white/5 ring-1 ring-white/10' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border} group-hover:scale-110 transition-transform`}>
                    <cfg.Icon size={16} className={cfg.text} />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="text-xs font-bold text-gray-200 truncate">{loc.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{cfg.label}{loc.floor ? ` · ${loc.floor}` : ''}</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-gray-700 group-hover:text-gray-400 transition" />
                </button>
              )
            })}
          </div>

          <div className="px-4 py-2 border-t border-white/5">
            <p className="text-[9px] text-gray-700 font-mono">{filtered.length} place{filtered.length !== 1 ? 's' : ''} · {campusConfig[activeCampus].label}</p>
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative bg-[#0a0a0b]">
          <div ref={mapRef} className="w-full h-full" />

          {selected && (() => {
            const cfg = typeConfig[selected.type]
            return (
              <div className="absolute bottom-8 left-8 right-8 md:left-1/2 md:-translate-x-1/2 md:w-[450px] z-[1000]">
                <div className="bg-[#111113]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <cfg.Icon size={28} className={cfg.text} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                      <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-full transition"><X size={16} /></button>
                    </div>
                    <h2 className="text-base font-bold text-white mb-1 leading-tight">{selected.name}</h2>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{selected.description}</p>

                    {selected.type === 'cafeteria' && (
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-[10px] text-amber-400"><Euro size={10} />{selected.price}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><Clock size={10} />{selected.days}</div>
                        {selected.hours?.lunch && <div className="flex items-center gap-1 text-[10px] text-gray-500"><Clock size={10} />{selected.hours.lunch}</div>}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`, '_blank')}
                        className="flex-1 bg-white text-black text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                        <Navigation size={14} /> Get Directions
                      </button>
                      {selected.floor && (
                        <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400">{selected.floor}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </main>
      </div>
    </div>
  )
}