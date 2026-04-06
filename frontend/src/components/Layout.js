import { Sidebar } from './Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '../utils/api'

export function Layout({ children }) {
  const router = useRouter()
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register'
  const isHome = router.pathname === '/'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthPage && !isHome) {
      api.get('/notifications/unread')
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {})
    }
  }, [router.pathname, isAuthPage, isHome])

  if (isAuthPage || isHome) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-zinc-950 text-white"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex selection:bg-indigo-500/30">
      <Sidebar unreadCount={unreadCount} />
      
      <main className="flex-1 md:ml-64 relative min-h-screen pb-20 md:pb-0 font-sans">
        {/* Subtle background glow effect globally */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={router.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full p-4 md:p-8 max-w-7xl mx-auto z-10 relative"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
