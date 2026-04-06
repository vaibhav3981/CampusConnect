import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      router.push('/feed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <LogIn className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Enter your credentials to access your dashboard</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="text-zinc-500" size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950/50 text-white pl-12 pr-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all"
                  placeholder="you@studenti.unime.it"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="text-zinc-500" size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950/50 text-white pl-12 pr-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Apply for access
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}