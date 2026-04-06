import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { renderToStaticMarkup } from 'react-dom/server'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, UtensilsCrossed, Building2, Car, GraduationCap, X, Search, 
  BedDouble, BookMarked, Microscope, ChevronRight, Navigation, Clock, Euro 
} from 'lucide-react'
import { mensaLocations, libraries, residences } from '../utils/unime_data'

// ── Shared Data simplified for example ──
const papardoBuildings = [
  { id: 'b1', name: 'Facoltà di Ingegneria', type: 'faculty', lat: 38.2588, lng: 15.5971, description: 'Main Engineering block. Houses DIECII departments.', floor: 'Floor 0–3', campus: 'papardo' },
  { id: 'b2', name: 'Dipartimento DIECII', type: 'lab', lat: 38.2595, lng: 15.5962, description: 'Industrial engineering section, specialized labs.', floor: 'Floor 1–2', campus: 'papardo' },
  { id: 'b3', name: 'Edificio Scienze', type: 'faculty', lat: 38.2604, lng: 15.5978, description: 'Main Science complex.', floor: 'Multiple Blocks', campus: 'papardo' },
]

const annunziataBuildings = [
  { id: 'a1', name: 'Dipartimento ChiBioFarAm', type: 'faculty', lat: 38.26016076603155, lng: 15.599080794906943, description: 'Chemical & Biological Sciences department.', floor: 'Multiple floors', campus: 'papardo' },
  { id: 'a2', name: 'Facoltà di Veterinaria', type: 'faculty', lat: 38.23103543214268, lng: 15.551669787337943, description: 'Veterinary Sciences — clinics, labs.', floor: 'Multiple floors', campus: 'annunziata' },
]

const centralBuildings = [
  { id: 'c1', name: 'Dipartimento di Economia', type: 'faculty', lat: 38.18945574154299, lng: 15.553718397679216, description: 'Department of Economics.', floor: 'Multiple floors', campus: 'central' },
  { id: 'c2', name: "Dipartimento di Giurisprudenza", type: 'faculty', lat: 38.189128372847506, lng: 15.553524512374954, description: "Law Department", floor: 'Multiple floors', campus: 'central' },
]

const policlinicoBuildings = [
  { id: 'p1', name: 'Policlinico G. Martino', type: 'faculty', lat: 38.16566514629457, lng: 15.537164367181518, description: 'Main medical faculty building.', floor: 'Multiple floors', campus: 'policlinico' },
]

const buildAllLocations = () => {
  const locs = [...papardoBuildings, ...annunziataBuildings, ...centralBuildings, ...policlinicoBuildings]
  libraries.forEach((lib, i) => locs.push({ id: `lib_${i}`, name: lib.name, type: 'library', lat: lib.lat, lng: lib.lng, description: 'SBA library.', floor: 'Ground Floor', campus: lib.campus.toLowerCase() }))
  mensaLocations.forEach((m, i) => locs.push({ id: `mensa_${i}`, name: m.name, type: 'cafeteria', lat: m.lat, lng: m.lng, description: `${m.address}`, floor: 'Main Hall', campus: m.campus.toLowerCase(), price: m.price, days: m.days, hours: m.hours }))
  residences.forEach((r, i) => locs.push({ id: `res_${i}`, name: r.name, type: 'residence', lat: r.lat, lng: r.lng, description: r.description, floor: 'Multiple floors', campus: r.campus.toLowerCase() }))
  return locs
}

const allLocations = buildAllLocations()

const typeConfig = {
  faculty:   { bg: 'bg-indigo-500/10',   text: 'text-indigo-400',   border: 'border-indigo-500/30',   label: 'Faculty',    color: '#6366f1', Icon: GraduationCap },
  library:   { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Library',    color: '#a855f7', Icon: BookOpen },
  cafeteria: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  label: 'Mensa',      color: '#f59e0b', Icon: UtensilsCrossed },
  residence: { bg: 'bg-emerald-500/10',  text: 'text-emerald-400',  border: 'border-emerald-500/30',  label: 'Residence',  color: '#10b981', Icon: BedDouble },
  classroom: { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/30',   label: 'Classroom',  color: '#06b6d4', Icon: BookMarked },
  lab:       { bg: 'bg-rose-500/10',   text: 'text-rose-400',   border: 'border-rose-500/30',   label: 'Lab',        color: '#f43f5e', Icon: Microscope },
  parking:   { bg: 'bg-zinc-500/10',   text: 'text-zinc-400',   border: 'border-zinc-500/30',   label: 'Parking',    color: '#71717a', Icon: Car },
  admin:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Admin',      color: '#f97316', Icon: Building2 },
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
  const [activeCampus, setActiveCampus] = useState('papardo')

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
        attributionControl: false
      })

      // Using a highly stylized dark basemap to match the clean-tech aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)

      const style = document.createElement('style')
      style.textContent = `
        .campus-tooltip { background: rgba(24,24,27,0.9)!important; backdrop-filter: blur(8px)!important; border: 1px solid rgba(255,255,255,0.1)!important; color: #fff!important; font-size: 11px!important; font-weight: 600!important; border-radius: 8px!important; padding: 6px 12px!important; box-shadow: 0 4px 20px rgba(0,0,0,0.5)!important; }
        .campus-tooltip::before { display: none !important; }
        .leaflet-container { background: #09090b!important; font-family: var(--font-inter), sans-serif; }
        .marker-container { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .marker-container:hover { transform: scale(1.2) translateY(-4px); z-index: 1000; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `
      document.head.appendChild(style)

      allLocations.forEach((loc) => {
        const cfg = typeConfig[loc.type]
        const iconHTML = renderToStaticMarkup(
          <div style={{ backgroundColor: cfg.color, width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.2)' }}>
            <cfg.Icon size={20} strokeWidth={2.5} />
          </div>
        )
        const markerIcon = L.divIcon({ className: 'custom-marker', html: `<div class="marker-container">${iconHTML}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] })
        const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon }).addTo(map)
        marker.bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -20], className: 'campus-tooltip' })
        marker.on('click', () => { setSelected(loc); map.flyTo([loc.lat, loc.lng], 18, { duration: 1.2, easeLinearity: 0.25 }) })
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
    mapInstanceRef.current?.flyTo(cfg.center, cfg.zoom, { duration: 1.2, easeLinearity: 0.25 })
  }

  const filtered = allLocations.filter(loc =>
    loc.campus === activeCampus &&
    (filter === 'all' || loc.type === filter) &&
    loc.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 relative">
      <aside className="w-full md:w-[340px] flex flex-col gap-4 h-full shrink-0 z-10 pointer-events-auto">
        <div className="glass rounded-3xl p-5 flex flex-col gap-4 w-full shadow-2xl overflow-hidden shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Campus Navigator</h1>
            <p className="text-xs text-zinc-400 mt-1">Select a campus to explore facilities</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(campusConfig).map(([id, cfg]) => (
              <button key={id} onClick={() => switchCampus(id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCampus === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}>
                {cfg.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search buildings or labs..."
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white placeholder-zinc-600 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'faculty', 'library', 'cafeteria', 'classroom', 'lab'].map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filter === t ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-3 flex-1 overflow-y-auto scrollbar-hide shadow-2xl relative">
          {filtered.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-zinc-600 font-medium italic">No locations found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(loc => {
                const cfg = typeConfig[loc.type]
                return (
                  <button key={loc.id} onClick={() => { setSelected(loc); mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 18) }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group text-left ${selected?.id === loc.id ? 'bg-white/10 shadow-md' : 'hover:bg-white/5'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border} shadow-sm group-hover:scale-110 transition-transform`}>
                      <cfg.Icon size={18} className={cfg.text} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-zinc-100 truncate group-hover:text-white transition-colors">{loc.name}</p>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{cfg.label}{loc.floor ? ` · ${loc.floor}` : ''}</p>
                    </div>
                    <ChevronRight size={16} className={`${selected?.id === loc.id ? 'text-white' : 'text-zinc-700 group-hover:text-zinc-500'} transition-colors`} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 relative rounded-3xl overflow-hidden glass shadow-2xl border border-white/5 h-[300px] md:h-full shrink-0 flex">
        <div ref={mapRef} className="absolute inset-0 z-0 bg-transparent" />
        
        <AnimatePresence>
          {selected && (() => {
            const cfg = typeConfig[selected.type]
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-[1000] pointer-events-none"
              >
                <div className="glass bg-zinc-950/90 rounded-3xl p-6 shadow-2xl border border-white/10 pointer-events-auto relative">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg} shadow-inner`}>
                      <cfg.Icon size={24} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block ${cfg.text}`}>{cfg.label}</span>
                        <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white mt-[-4px] mr-[-4px]">
                          <X size={16} />
                        </button>
                      </div>
                      <h2 className="text-lg font-bold text-white leading-tight">{selected.name}</h2>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5">{selected.description}</p>

                  {selected.type === 'cafeteria' && (
                    <div className="flex flex-wrap items-center gap-3 mb-5 bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium"><Euro size={14} />{selected.price}</div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-300"><Clock size={14} />{selected.days}</div>
                      {selected.hours?.lunch && <div className="flex items-center gap-1.5 text-xs text-zinc-300"><Clock size={14} />{selected.hours.lunch}</div>}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`, '_blank')}
                      className="flex-1 bg-white text-black text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg">
                      <Navigation size={16} /> Get Directions
                    </button>
                    {selected.floor && (
                      <div className="px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-xs font-medium text-zinc-400 text-center shadow-inner">
                        {selected.floor}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </main>
    </div>
  )
}