import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Link from 'next/link'

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
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
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

  const inputClass = "w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
  const labelClass = "text-sm text-gray-400 mb-1 block"

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
        <p className="text-gray-400 mb-6 text-sm">Join CampusConnect</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}/>
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}/>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Vaibhav Bhardwaj"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="you@university.it"
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2 — Role info */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className={labelClass}>I am a</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            {/* Student fields */}
            {form.role === 'student' && (
              <>
                {/* Degree type */}
                <div>
                  <label className={labelClass}>Degree type</label>
                  <select
                    name="degreeType"
                    value={form.degreeType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select degree type</option>
                    <option value="bachelors">Bachelors</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                {/* Year of study */}
                <div>
                  <label className={labelClass}>Year of study</label>
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select year</option>

                    {/* Bachelors years */}
                    {(form.degreeType === 'bachelors' || form.degreeType === '') && (
                      <>
                        <option value="1">1st year</option>
                        <option value="2">2nd year</option>
                        <option value="3">3rd year</option>
                        <option value="4">1st year Fuori Corso</option>
                        <option value="5">2nd year Fuori Corso</option>
                        <option value="6">3rd year Fuori Corso</option>
                        <option value="7">4th year Fuori Corso</option>
                      </>
                    )}

                    {/* Masters years */}
                    {form.degreeType === 'masters' && (
                      <>
                        <option value="1">1st year</option>
                        <option value="2">2nd year</option>
                        <option value="3">1st year Fuori Corso</option>
                        <option value="4">2nd year Fuori Corso</option>
                      </>
                    )}

                    {/* PhD years */}
                    {form.degreeType === 'phd' && (
                      <>
                        <option value="1">1st year</option>
                        <option value="2">2nd year</option>
                        <option value="3">3rd year</option>
                        <option value="4">4th year Fuori Corso</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Program — free text for now, will become dropdown when course list is provided */}
                <div>
                  <label className={labelClass}>Program</label>
                  <input
                    type="text"
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder={
                      form.degreeType === 'masters' ? 'e.g. Cognitive Science' :
                      form.degreeType === 'phd' ? 'e.g. Computer Science' :
                      'e.g. Data Analysis'
                    }
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Course list selection coming soon
                  </p>
                </div>
              </>
            )}

            {/* Professor fields */}
            {form.role === 'professor' && (
              <div>
                <label className={labelClass}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Computer Science"
                />
              </div>
            )}

            {/* Alumni fields */}
            {form.role === 'alumni' && (
              <>
                <div>
                  <label className={labelClass}>Degree type</label>
                  <select
                    name="degreeType"
                    value={form.degreeType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select degree type</option>
                    <option value="bachelors">Bachelors</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Degree name</label>
                  <input
                    type="text"
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. BSc Data Analysis"
                  />
                </div>
                <div>
                  <label className={labelClass}>Graduation year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={form.graduationYear}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 2023"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium text-sm transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}