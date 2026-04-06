import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { programmeOptions, departments } from '../utils/unime_data'
import { User, Mail, Lock, Info, GraduationCap, Building2 } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', year: '',
    degreeType: '', program: '', department: '', graduationYear: '', degree: '', matricola: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'degreeType') setForm({ ...form, degreeType: value, program: '', year: '' })
    else setForm({ ...form, [name]: value })
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all basic fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (form.role === 'student' && form.matricola) {
      if (!/^\d{6}$/.test(form.matricola)) {
        toast.error('Matricola must be exactly 6 digits')
        setLoading(false)
        return
      }
    }

    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: form.role,
        year: form.year ? Number(form.year) : null, program: form.program || null,
        department: form.department || null, graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        degree: form.degree || null, matricola: form.role === 'student' ? (form.matricola || null) : null,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Account created successfully!')
      router.push('/feed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const getProgrammeOptions = () => form.degreeType ? (programmeOptions[form.degreeType] || []) : []
  
  const getYearOptions = () => {
    if (form.degreeType === 'masters') return [1,2].map(v => ({ value: v, label: `Year ${v}` })).concat([{value: '3', label: '1st yr FC'}, {value: '4', label: '2nd yr FC'}])
    if (form.degreeType === 'phd') return [1,2,3].map(v => ({ value: v, label: `Year ${v}` })).concat([{value: '4', label: 'FC'}])
    if (form.degreeType === 'singleCycle') return [1,2,3,4,5,6].map(v => ({ value: v, label: `Year ${v}` })).concat([{value: '7', label: '1st yr FC'}, {value: '8', label: '2nd yr FC'}])
    return [1,2,3].map(v => ({ value: v, label: `Year ${v}` })).concat([{value: '4', label: '1st yr FC'}, {value: '5', label: '2nd yr FC'}])
  }

  const papardoDepts = departments.filter(d => d.campus === 'Papardo')
  const otherDepts = departments.filter(d => d.campus !== 'Papardo')

  const inputClass = "w-full bg-zinc-950/50 text-white pl-12 pr-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all"
  const selectClass = inputClass.replace('pl-12', 'pl-4')

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 mt-10 mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <User className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Join the UniMeConnect network</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl relative">
          
          <div className="mb-8">
            <div className="flex gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-indigo-600" />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-white/10'}`} />
            </div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-4">
              Step {step} of 2 — {step === 1 ? 'Credentials' : 'Academics'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNext} className="space-y-5"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="text-zinc-500" size={18} />
                  </div>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Full Name" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="text-zinc-500" size={18} />
                  </div>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@studenti.unime.it" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="text-zinc-500" size={18} />
                  </div>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className={inputClass} placeholder="Password (Min. 6 chars)" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all mt-4">
                  Continue Form
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} className="space-y-5"
              >
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'professor', 'alumni'].map(r => (
                    <button
                      key={r} type="button"
                      onClick={() => setForm({ ...form, role: r, program: '', department: '', year: '', degreeType: '', matricola: '' })}
                      className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        form.role === r ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50' : 'bg-transparent border border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {r === 'student' ? <GraduationCap size={16}/> : r === 'professor' ? <Building2 size={16}/> : <User size={16}/>}
                      <span className="capitalize">{r}</span>
                    </button>
                  ))}
                </div>

                {form.role === 'student' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                    <select name="degreeType" value={form.degreeType} onChange={handleChange} className={selectClass}>
                      <option value="">Degree Type</option>
                      <option value="bachelors">Bachelors (3 years)</option>
                      <option value="singleCycle">Single-Cycle (5–6 years)</option>
                      <option value="masters">Masters (2 years)</option>
                      <option value="phd">PhD</option>
                    </select>
                    {form.degreeType && (
                      <select name="program" value={form.program} onChange={handleChange} className={selectClass}>
                        <option value="">Programme</option>
                        {getProgrammeOptions().map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    )}
                    {form.degreeType && (
                      <select name="year" value={form.year} onChange={handleChange} className={selectClass}>
                        <option value="">Academic Year</option>
                        {getYearOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    )}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Info className="text-zinc-500" size={18} />
                      </div>
                      <input type="text" name="matricola" value={form.matricola} onChange={handleChange} maxLength={6} className={inputClass} placeholder="Matricola (Optional)" />
                    </div>
                  </motion.div>
                )}

                {form.role === 'professor' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                    <select name="department" value={form.department} onChange={handleChange} className={selectClass}>
                      <option value="">Department</option>
                      <optgroup label="Papardo Campus">{papardoDepts.map(d => <option key={d.id} value={d.shortName}>{d.name}</option>)}</optgroup>
                      <optgroup label="Other">{otherDepts.map(d => <option key={d.id} value={d.shortName}>{d.name}</option>)}</optgroup>
                    </select>
                  </motion.div>
                )}
                
                {form.role === 'alumni' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
                     <select name="degreeType" value={form.degreeType} onChange={handleChange} className={selectClass}>
                        <option value="">Degree Type</option>
                        <option value="bachelors">Bachelors</option>
                        <option value="masters">Masters</option>
                      </select>
                      {form.degreeType && (
                        <select name="degree" value={form.degree} onChange={handleChange} className={selectClass}>
                          <option value="">Programme</option>
                          {getProgrammeOptions().map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      )}
                      <select name="graduationYear" value={form.graduationYear} onChange={handleChange} className={selectClass}>
                        <option value="">Graduation Year</option>
                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 rounded-2xl text-zinc-400 font-semibold hover:text-white transition-colors bg-white/5 hover:bg-white/10">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50">
                    {loading ? 'Creating...' : 'Initialize'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <div className="mt-8 text-center text-zinc-500 text-sm font-medium">
              Existing member? <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors ml-1">Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}