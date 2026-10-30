import { FormEvent, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Search, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../state'

type Doctor = { id: string; name: string; specialty: string; mode: 'Video' | 'Clinic'; languages: string; about: string }
const DOCTORS: Doctor[] = [
  { id: 'mira', name: 'Dr. Mira Shah', specialty: 'Gynecology', mode: 'Video', languages: 'English, Hindi', about: 'Demo profile focused on reproductive and preventive health.' },
  { id: 'leela', name: 'Dr. Leela Menon', specialty: 'Gynecology', mode: 'Clinic', languages: 'English, Malayalam', about: 'Demo profile for routine gynecologic questions and follow-up.' },
  { id: 'kavya', name: 'Dr. Kavya Iyer', specialty: 'Nutrition', mode: 'Video', languages: 'English, Tamil', about: 'Demo profile for general nutrition education.' },
  { id: 'sana', name: 'Dr. Sana Qureshi', specialty: 'Primary care', mode: 'Video', languages: 'English, Hindi, Urdu', about: 'Demo profile for general preventive-care discussions.' },
]
const SLOTS = ['Today · 4:30 PM', 'Tomorrow · 10:00 AM', 'Tomorrow · 2:30 PM', 'Friday · 11:00 AM']

export default function DoctorConnect() {
  const { addLog } = useApp()
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('All specialties')
  const [mode, setMode] = useState('Any format')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const visibleDoctors = useMemo(() => DOCTORS.filter(doctor =>
    (specialty === 'All specialties' || doctor.specialty === specialty)
    && (mode === 'Any format' || doctor.mode === mode)
    && `${doctor.name} ${doctor.specialty} ${doctor.languages}`.toLowerCase().includes(query.toLowerCase().trim()),
  ), [query, specialty, mode])

  const startBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setSelectedSlot('')
    setStep(2)
    setConfirmation('')
    setError('')
  }
  const confirmBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDoctor || !selectedSlot) {
      setError('Choose a demo clinician and a time before continuing.')
      return
    }
    if (!name.trim() || !contact.trim()) {
      setError('Enter your name and an email or phone contact.')
      return
    }
    const ref = `DEMO-${Date.now().toString().slice(-6)}`
    setConfirmation(ref)
    addLog('consult', `Simulated booking with ${selectedDoctor.name} · ${selectedSlot}`, true)
    setStep(4)
  }
  const reset = () => {
    setStep(1)
    setSelectedDoctor(null)
    setSelectedSlot('')
    setError('')
    setConfirmation('')
  }

  return <div className="grid gap-7">
    <header>
      <p className="mb-2 text-sm font-bold text-mauve">DEMO clinician directory</p>
      <h1 className="text-4xl">Doctor connect</h1>
      <p className="mt-3 max-w-3xl text-mauve">Profiles and availability below are fictional examples. Booking is simulated in this browser only; no real appointment, referral or message is sent.</p>
    </header>

    <div className="grid gap-2 sm:grid-cols-4" aria-label="Booking steps">
      {['Find a specialist', 'Choose a time', 'Your details', 'Demo confirmation'].map((title, index) => <div key={title} className={`rounded-xl p-3 text-sm ${step === index + 1 ? 'bg-rose-deep font-bold text-white' : 'bg-blush text-mauve'}`} aria-current={step === index + 1 ? 'step' : undefined}><span className="mr-2">{index + 1}.</span>{title}</div>)}
    </div>

    {step === 1 && <section>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="relative"><span className="sr-only">Search clinicians</span><Search className="absolute left-3 top-3 text-mauve" size={18} /><input className="w-full pl-10" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name or language" /></label>
        <label className="sr-only" htmlFor="doctor-specialty">Filter by specialty</label><select id="doctor-specialty" value={specialty} onChange={event => setSpecialty(event.target.value)}><option>All specialties</option><option>Gynecology</option><option>Nutrition</option><option>Primary care</option></select>
        <label className="sr-only" htmlFor="doctor-mode">Filter by appointment format</label><select id="doctor-mode" value={mode} onChange={event => setMode(event.target.value)}><option>Any format</option><option>Video</option><option>Clinic</option></select>
      </div>
      {visibleDoctors.length ? <div className="grid gap-4 md:grid-cols-2">{visibleDoctors.map(doctor => <article key={doctor.id} className="card flex flex-col gap-3">
        <div className="flex items-start gap-3"><span className="rounded-full bg-blush p-3 text-rose-deep"><Stethoscope /></span><div><h2 className="text-xl">{doctor.name}</h2><p className="font-bold text-rose-deep">{doctor.specialty}</p></div></div>
        <p className="text-sm text-mauve">{doctor.about}</p><p className="text-sm"><b>{doctor.mode}</b> · {doctor.languages}</p>
        <span className="demo w-fit">Fictional demo profile</span>
        <button className="btn mt-auto w-fit" onClick={() => startBooking(doctor)}>Choose demo profile <ArrowRight size={16} /></button>
      </article>)}</div> : <p className="card text-mauve">No demo clinicians match those filters. Try another search or specialty.</p>}
    </section>}

    {step === 2 && selectedDoctor && <section className="card grid gap-4">
      <div><h2 className="text-2xl">Choose a time</h2><p className="text-mauve">Simulated availability for {selectedDoctor.name} ({selectedDoctor.mode}).</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{SLOTS.map(slot => <button key={slot} type="button" aria-pressed={selectedSlot === slot} onClick={() => setSelectedSlot(slot)} className={`flex items-center gap-2 rounded-xl border p-4 text-left font-bold ${selectedSlot === slot ? 'border-rose-deep bg-blush text-rose-deep' : 'border-warm'}`}><CalendarDays size={18} />{slot}</button>)}</div>
      {error && <p role="alert" className="text-rose-deep">{error}</p>}
      <div className="flex flex-wrap gap-3"><button className="btn2" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back to clinicians</button><button className="btn" disabled={!selectedSlot} onClick={() => { setError(''); setStep(3) }}>Continue <ArrowRight size={16} /></button></div>
    </section>}

    {step === 3 && selectedDoctor && <form className="card grid max-w-2xl gap-4" onSubmit={confirmBooking}>
      <div><h2 className="text-2xl">Review demo request</h2><p className="text-mauve">{selectedDoctor.name} · {selectedSlot}</p></div>
      <label className="grid gap-1 text-sm font-bold">Your name<input autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label className="grid gap-1 text-sm font-bold">Email or phone<input autoComplete="email" value={contact} onChange={event => setContact(event.target.value)} /></label>
      {error && <p role="alert" className="text-rose-deep">{error}</p>}
      <p className="rounded-xl bg-blush p-3 text-sm text-mauve">This step only creates a simulated confirmation on this page and a demo entry in My Care. It does not contact a clinician.</p>
      <div className="flex flex-wrap gap-3"><button className="btn2" type="button" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back to times</button><button className="btn">Confirm simulated booking</button></div>
    </form>}

    {step === 4 && selectedDoctor && <section className="card max-w-2xl" role="status">
      <span className="demo">SIMULATED BOOKING · NO APPOINTMENT MADE</span>
      <h2 className="mt-3 text-3xl">Demo request complete</h2>
      <p className="mt-2 text-mauve">A local demo record was created for {selectedDoctor.name} at {selectedSlot}. No real clinician has received your details.</p>
      <p className="mt-3 font-bold">Reference: {confirmation}</p>
      <div className="mt-5 flex flex-wrap gap-3"><button className="btn2" onClick={reset}>Start another demo</button><Link className="btn" to="/my-care">View My Care</Link></div>
    </section>}
  </div>
}
