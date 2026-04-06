import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, MapPin, LayoutGrid, Bell, Search, User, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function Sidebar({ unreadCount = 0 }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const navItems = [
    { label: 'Feed', href: '/feed', icon: Home },
    { label: 'Map', href: '/map', icon: MapPin },
    { label: 'Services', href: '/timetable', icon: LayoutGrid },
    { label: 'Alerts', href: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Search', href: '/search', icon: Search },
  ]

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <>
      <div className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 pt-8 pb-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.45)] shrink-0">
            <span className="text-[13px] font-black text-white leading-none">U</span>
            <span className="text-[7px] font-black text-indigo-200 tracking-widest leading-none mt-0.5">NM</span>
          </div>
          <span className="font-bold text-zinc-100 tracking-tight text-lg">UniMeConnect</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = router.pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className="relative group">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
                  <item.icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-indigo-500/10 rounded-xl mix-blend-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 group">
            <User size={20} className="group-hover:text-indigo-400 transition-colors" />
            <span className="font-medium text-sm flex-1 truncate">{user?.name || 'Profile'}</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 mt-1">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-6 py-3 z-50 flex justify-between items-center safe-area-bottom">
        {navItems.map((item) => {
          const isActive = router.pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 p-2">
              <item.icon size={22} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute -bottom-2 w-1 h-1 bg-indigo-500 rounded-full"
                />
              )}
            </Link>
          )
        })}
        <Link href="/profile" className="flex flex-col items-center gap-1 p-2">
           <User size={22} className={router.pathname.startsWith('/profile') ? 'text-indigo-400' : 'text-zinc-500'} />
        </Link>
      </div>
    </>
  )
}
