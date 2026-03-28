import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'
import { programmeOptions, departments } from '../utils/unime_data'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    year: '',
    degreeType: '',
    program: '',
    department: '',
    graduationYear: '',
    degree: '',
    matricola: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'degreeType') {
      setForm({ ...form, degreeType: value, program: '', year: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate matricola for students
    if (form.role === 'student' && form.matricola) {
      if (!/^\d{6}$/.test(form.matricola)) {
        setError('Matricola must be exactly 6 digits')
        setLoading(false)
        return
      }
    }

    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        year: form.year ? Number(form.year) : null,
        program: form.program || null,
        department: form.department || null,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        degree: form.degree || null,
        matricola: form.role === 'student' ? (form.matricola || null) : null,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const getProgrammeOptions = () => {
    if (!form.degreeType) return []
    return programmeOptions[form.degreeType] || []
  }

  const getYearOptions = () => {
    if (form.degreeType === 'masters') return [
      { value: '1', label: '1st year' },
      { value: '2', label: '2nd year' },
      { value: '3', label: '1st year Fuori Corso' },
      { value: '4', label: '2nd year Fuori Corso' },
    ]
    if (form.degreeType === 'phd') return [
      { value: '1', label: '1st year' },
      { value: '2', label: '2nd year' },
      { value: '3', label: '3rd year' },
      { value: '4', label: 'Fuori Corso' },
    ]
    if (form.degreeType === 'singleCycle') return [
      { value: '1', label: '1st year' },
      { value: '2', label: '2nd year' },
      { value: '3', label: '3rd year' },
      { value: '4', label: '4th year' },
      { value: '5', label: '5th year' },
      { value: '6', label: '6th year' },
      { value: '7', label: '1st year Fuori Corso' },
      { value: '8', label: '2nd year Fuori Corso' },
    ]
    return [
      { value: '1', label: '1st year' },
      { value: '2', label: '2nd year' },
      { value: '3', label: '3rd year' },
      { value: '4', label: '1st year Fuori Corso' },
      { value: '5', label: '2nd year Fuori Corso' },
      { value: '6', label: '3rd year Fuori Corso' },
      { value: '7', label: '4th year Fuori Corso' },
    ]
  }

  const papardoDepts = departments.filter(d => d.campus === 'Papardo')
  const otherDepts = departments.filter(d => d.campus !== 'Papardo')

  const inputClass = "w-full bg-[#111113] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500/50 text-sm transition"
  const labelClass = "text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block"
  const selectClass = `${inputClass} appearance-none cursor-pointer`

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-sm font-black text-white uppercase tracking-tighter">CampusConnect</h1>
          <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest">University of Messina</p>
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-2xl p-8 shadow-2xl">

          <div className="mb-6">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
              Step {step} of 2
            </p>
            <h2 className="text-xl font-bold text-white">
              {step === 1 ? 'Create your account' : 'Tell us about yourself'}
            </h2>
          </div>

          <div className="flex gap-1.5 mb-8">
            <div className="h-0.5 flex-1 rounded-full bg-blue-500" />
            <div className={`h-0.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className={labelClass}>Full name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className={labelClass}>University email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@studenti.unime.it" />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required className={inputClass} placeholder="Min. 6 characters" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition">
                Continue →
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role selector */}
              <div>
                <label className={labelClass}>I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'professor', 'alumni'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r, program: '', department: '', year: '', degreeType: '', matricola: '' })}
                      className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition ${
                        form.role === r
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {r === 'student' ? '🎓 Student' : r === 'professor' ? '👨‍🏫 Professor' : '🏅 Alumni'}
                    </button>
                  ))}
                </div>
              </div>

              {/* STUDENT */}
              {form.role === 'student' && (
                <>
                  <div>
                    <label className={labelClass}>Degree type</label>
                    <select name="degreeType" value={form.degreeType} onChange={handleChange} className={selectClass}>
                      <option value="">Select degree type</option>
                      <option value="bachelors">Bachelors — Laurea Triennale (3 years)</option>
                      <option value="singleCycle">Single-Cycle — Ciclo Unico (5–6 years)</option>
                      <option value="masters">Masters — Laurea Magistrale (2 years)</option>
                      <option value="phd">PhD — Dottorato (3 years)</option>
                    </select>
                  </div>

                  {form.degreeType && (
                    <div>
                      <label className={labelClass}>Programme</label>
                      <select name="program" value={form.program} onChange={handleChange} className={selectClass}>
                        <option value="">Select your programme</option>
                        {getProgrammeOptions().map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.degreeType && (
                    <div>
                      <label className={labelClass}>Year of study</label>
                      <select name="year" value={form.year} onChange={handleChange} className={selectClass}>
                        <option value="">Select year</option>
                        {getYearOptions().map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      Matricola <span className="text-gray-700 normal-case font-normal">(optional — 6-digit student ID)</span>
                    </label>
                    <input
                      type="text"
                      name="matricola"
                      value={form.matricola}
                      onChange={handleChange}
                      maxLength={6}
                      className={inputClass}
                      placeholder="e.g. 234567"
                    />
                  </div>
                </>
              )}

              {/* PROFESSOR */}
              {form.role === 'professor' && (
                <div>
                  <label className={labelClass}>Department</label>
                  <select name="department" value={form.department} onChange={handleChange} className={selectClass}>
                    <option value="">Select your department</option>
                    <optgroup label="Papardo Campus">
                      {papardoDepts.map(d => (
                        <option key={d.id} value={d.shortName}>{d.shortName} — {d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Campuses">
                      {otherDepts.map(d => (
                        <option key={d.id} value={d.shortName}>{d.shortName} — {d.name} ({d.campus})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {/* ALUMNI */}
              {form.role === 'alumni' && (
                <>
                  <div>
                    <label className={labelClass}>Degree type</label>
                    <select name="degreeType" value={form.degreeType} onChange={handleChange} className={selectClass}>
                      <option value="">Select degree type</option>
                      <option value="bachelors">Bachelors</option>
                      <option value="singleCycle">Single-Cycle</option>
                      <option value="masters">Masters</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>

                  {form.degreeType && (
                    <div>
                      <label className={labelClass}>Programme</label>
                      <select name="degree" value={form.degree} onChange={handleChange} className={selectClass}>
                        <option value="">Select your programme</option>
                        {getProgrammeOptions().map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Graduation year</label>
                    <select name="graduationYear" value={form.graduationYear} onChange={handleChange} className={selectClass}>
                      <option value="">Select year</option>
                      {Array.from({ length: 30 }, (_, i) => 2025 - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm transition">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-gray-600 text-xs mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}