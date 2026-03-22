import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Home, MapPin, LayoutGrid, Bell, 
  BookOpen, UtensilsCrossed, Building2, 
  FlaskConical, Car, GraduationCap, 
  X, Search, BedDouble, BookMarked,
  Microscope, ChevronRight, Navigation
} from 'lucide-react'

// Updated coordinates for accurate building alignment at Papardo Campus
const campusLocations = [
  {
    id: 1,
    name: 'Facoltà di Ingegneria',
    type: 'faculty',
    lat: 38.2588,
    lng: 15.5971,
    description: 'Main Engineering block. Houses DIECII departments and central lecture halls.',
    floor: 'Floor 0-3',
  },
  {
    id: 2,
    name: 'Dipartimento DIECII — Sezione Industriale',
    type: 'lab',
    lat: 38.2595,
    lng: 15.5962,
    description: 'Industrial engineering section, specialized labs and faculty offices.',
    floor: 'Floor 1-2',
  },
  {
    id: 3,
    name: 'Edificio Scienze — Corpo Principale',
    type: 'faculty',
    lat: 38.2604,
    lng: 15.5978,
    description: 'Main Science complex for Mathematics, Physics, and Natural Sciences.',
    floor: 'Multiple Blocks',
  },
  {
    id: 4,
    name: 'Biblioteca SBA — Polo Papardo',
    type: 'library',
    lat: 38.2612,
    lng: 15.5972,
    description: 'Main campus library and quiet study areas.',
    floor: 'Ground Floor',
  },
  {
    id: 6,
    name: 'Mensa Papardo Campus',
    type: 'cafeteria',
    lat: 38.2621,
    lng: 15.5976,
    description: 'Student canteen and bar. Open for lunch and quick breaks.',
    floor: 'Main Hall',
  },
  {
    id: 7,
    name: 'ERSU Residence Papardo',
    type: 'residence',
    lat: 38.2629,
    lng: 15.5957,
    description: 'On-campus student housing and administrative offices.',
    floor: '4 Levels',
  },
  {
    id: 8,
    name: 'Block B — Aule Didattiche',
    type: 'classroom',
    lat: 38.2623,
    lng: 15.5969,
    description: 'Dedicated lecture hall building for large core classes.',
    floor: 'Ground & 1st',
  },
  {
    id: 10,
    name: 'Parcheggio Principale',
    type: 'parking',
    lat: 38.2592,
    lng: 15.5982,
    description: 'Largest parking area, accessible via the main gate.',
    floor: 'Outdoor',
  },
]

const typeConfig = {
  faculty:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   label: 'Faculty',    color: '#3b82f6', Icon: GraduationCap },
  library:   { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Library',    color: '#a855f7', Icon: BookOpen },
  cafeteria: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Mensa',      color: '#f59e0b', Icon: UtensilsCrossed },
  residence: { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  label: 'Residence',  color: '#10b981', Icon: BedDouble },
  classroom: { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   label: 'Aule',       color: '#06b6d4', Icon: BookMarked },
  lab:       { bg: 'bg-rose-500/10',   text: 'text-rose-400',   border: 'border-rose-500/20',   label: 'Lab',        color: '#f43f5e', Icon: Microscope },
  parking:   { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   label: 'Parking',    color: '#94a3b8', Icon: Car },
}

export default function MapPage() {
  const router = useRouter()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      // FIX: Guard Clause to prevent double initialization
      if (mapInstanceRef.current || L.DomUtil.get(mapRef.current)?._leaflet_id) return

      const map = L.map(mapRef.current, {
        center: [38.2605, 15.5972],
        zoom: 17,
        zoomControl: false,
      })

      // Dark Mode Map Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO',
        maxZoom: 20,
      }).addTo(map)

      campusLocations.forEach((loc) => {
        const cfg = typeConfig[loc.type]
        
        // Render Lucide Icon to SVG string for Leaflet markers
        const iconHTML = renderToStaticMarkup(
          <div style={{ 
            backgroundColor: cfg.color,
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <cfg.Icon size={18} strokeWidth={2.5} />
          </div>
        )

        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-container">${iconHTML}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon }).addTo(map)
        marker.on('click', () => {
          setSelected(loc)
          map.flyTo([loc.lat, loc.lng], 18, { duration: 1 })
        })
      })

      mapInstanceRef.current = map
    }

    initMap()

    // FIX: Cleanup Function
    return () => { 
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const filtered = campusLocations.filter(loc => 
    (filter === 'all' || loc.type === filter) && 
    loc.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-screen bg-[#0a0a0b] text-gray-200 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <nav className="h-14 border-b border-white/5 bg-[#0a0a0b] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <Link href="/feed" className="text-xs font-black tracking-tighter uppercase text-white">CampusConnect</Link>
          <div className="flex items-center gap-1">
            <Link href="/feed" className="nav-link"><Home size={14} /> Feed</Link>
            <Link href="/map" className="nav-link active"><MapPin size={14} /> Find a Place</Link>
            <Link href="/services" className="nav-link"><LayoutGrid size={14} /> Services</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[10px] font-bold uppercase text-gray-500 hover:text-white transition">{user?.name || 'Profile'}</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Search Sidebar */}
        <aside className="w-80 bg-[#0d0d0f] border-r border-white/5 flex flex-col">
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Navigation</p>
              <h1 className="text-lg font-bold text-white leading-none">Papardo Campus</h1>
            </div>
            
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search buildings or labs..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'faculty', 'library', 'cafeteria', 'classroom'].map(t => (
                <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                    filter === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
            {filtered.map(loc => {
              const cfg = typeConfig[loc.type]
              return (
                <button 
                  key={loc.id}
                  onClick={() => {
                    setSelected(loc)
                    mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 18)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 hover:bg-white/5 group ${selected?.id === loc.id ? 'bg-white/5 ring-1 ring-white/10' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border} group-hover:scale-110 transition-transform`}>
                    <cfg.Icon size={16} className={cfg.text} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-gray-200 truncate">{loc.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{cfg.label} • {loc.floor}</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-gray-700" />
                </button>
              )
            })}
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative bg-[#0a0a0b]">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Detail Overlay Card */}
          {selected && (
            <div className="absolute bottom-8 left-8 right-8 md:left-1/2 md:-translate-x-1/2 md:w-[450px] z-[1000] animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#111113]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${typeConfig[selected.type].bg} border ${typeConfig[selected.type].border}`}>
                  {(() => {
                    const Icon = typeConfig[selected.type].Icon
                    return <Icon size={28} className={typeConfig[selected.type].text} />
                  })()}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${typeConfig[selected.type].text}`}>{typeConfig[selected.type].label}</span>
                    <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1 leading-tight">{selected.name}</h2>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{selected.description}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-white text-black text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                      <Navigation size={14} /> Get Directions
                    </button>
                    <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400">
                      {selected.floor}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #666;
          transition: all 0.2s;
          border-radius: 8px;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.05); }
        .leaflet-container { background: #0a0a0b !important; }
        .marker-container { transition: transform 0.2s ease; }
        .marker-container:hover { transform: scale(1.15) translateY(-4px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}