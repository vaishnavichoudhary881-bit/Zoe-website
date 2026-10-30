import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { CareReminders, useApp, LogType } from '../state'

const MEALS: Record<string, string[]> = {
  veg: ['Dal, brown rice, spinach sabzi, curd-free salad with lemon', 'Ragi dosa with sambar and peanut chutney'],
  vegdairy: ['Roti, paneer-palak, dal, buttermilk', 'Ragi porridge with milk, banana'],
  nonveg: ['Egg bhurji, roti, mixed veg, fruit', 'Fish curry, rice, greens'],
}
const FOODS = [
  ['Iron-rich examples', 'Spinach, lentils, ragi, jaggery, meat, eggs'],
  ['Vitamin B12 sources', 'Dairy, eggs, fish, meat (hard to get from plants alone)'],
  ['Calcium-rich examples', 'Milk, curd, ragi, sesame, leafy greens'],
  ['Hydration', 'Sip water through the day; add buttermilk or coconut water.'],
]

export default function MyCare() {
  const { log, addLog, diet, setDiet, taken, toggleDay, profile, reports, careReminders, setCareReminders } = useApp()
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState<'all' | LogType>('all')
  const [reminderDraft, setReminderDraft] = useState<CareReminders>(careReminders)
  const [reminderMessage, setReminderMessage] = useState('')
  const [dietMessage, setDietMessage] = useState('')
  useEffect(() => setReminderDraft(careReminders), [careReminders])

  const now = new Date()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const key = (day: number) => `${now.getMonth() + 1}-${day}`
  const weeks = [0, 1, 2, 3, 4].map(week => ({
    week: `W${week + 1}`,
    taken: Array.from({ length: 7 }, (_, index) => week * 7 + index + 1).filter(day => day <= days && taken[key(day)]).length,
  }))
  const shown = log.filter(item => filter === 'all' || item.type === filter)
  const latestReport = reports.find(report => report.kind === 'lab')

  const updateReminder = (key: 'sachet' | 'followUp', change: Partial<CareReminders['sachet'] | CareReminders['followUp']>) => {
    setReminderDraft(current => ({ ...current, [key]: { ...current[key], ...change } }))
    setReminderMessage('')
  }
  const saveReminders = () => {
    setCareReminders(reminderDraft)
    setReminderMessage('Your demo reminder schedule is saved for this session. No notifications are sent.')
  }
  const cancelReminders = () => {
    setReminderDraft(careReminders)
    setReminderMessage('Unsaved reminder changes were discarded.')
  }

  return <div className="grid gap-8">
    <div><h1 className="text-4xl">Hello, {profile.name}</h1><p className="text-mauve">{now.toDateString()} <span className="demo">Demo session</span></p></div>

    <section className="card">
      <h2 className="mb-3 text-2xl">Health log</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="min-w-0 flex-1" placeholder="Add a note" value={note} onChange={event => setNote(event.target.value)} />
        <button className="btn" onClick={() => { if (note.trim()) { addLog('note', note.trim()); setNote('') } }}>Add note</button>
        <label className="sr-only" htmlFor="log-filter">Filter health log</label>
        <select id="log-filter" value={filter} onChange={event => setFilter(event.target.value as 'all' | LogType)}>{['all', 'note', 'scan', 'report', 'activity', 'consult'].map(item => <option key={item}>{item}</option>)}</select>
      </div>
      {shown.length === 0
        ? <div className="text-mauve">Nothing logged yet. Add a note, run a <Link className="font-bold text-rose-deep" to="/scanner">demo scan</Link> or add a report on the <Link className="font-bold text-rose-deep" to="/reports">Reports</Link> page.</div>
        : <ul className="grid gap-2">{shown.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-blush px-3 py-2 text-sm"><span><b>{item.type}</b> · {item.title}</span><span>{item.demo && <span className="demo mr-2">demo</span>}{item.date}</span></li>)}</ul>}
    </section>

    <section className="card">
      <h2 className="mb-1 text-2xl">Reminders</h2>
      <p className="mb-4 text-sm text-mauve">Set personal demo reminders for sachets and follow-up care. These schedules are not push alerts, medical advice or a treatment plan.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-cream p-4">
          <label className="flex items-start gap-3"><input type="checkbox" checked={reminderDraft.sachet.enabled} onChange={event => updateReminder('sachet', { enabled: event.target.checked })} /><span><b>Sachet reminder</b><span className="block text-sm text-mauve">A personal prompt to check your own sachet log.</span></span></label>
          <label className="mt-3 grid gap-1 text-sm font-bold">Preferred time<input type="time" value={reminderDraft.sachet.time} onChange={event => updateReminder('sachet', { time: event.target.value })} /></label>
          {!profile.remind && <p className="mt-2 text-xs text-mauve">Care reminders are currently disabled in your Profile notification settings.</p>}
        </div>
        <div className="rounded-xl bg-cream p-4">
          <label className="flex items-start gap-3"><input type="checkbox" checked={reminderDraft.followUp.enabled} onChange={event => updateReminder('followUp', { enabled: event.target.checked })} /><span><b>Follow-up care reminder</b><span className="block text-sm text-mauve">A date and note for a follow-up you choose.</span></span></label>
          <label className="mt-3 grid gap-1 text-sm font-bold">Date<input type="date" value={reminderDraft.followUp.date} onChange={event => updateReminder('followUp', { date: event.target.value })} /></label>
          <label className="mt-3 grid gap-1 text-sm font-bold">Note<input value={reminderDraft.followUp.note} onChange={event => updateReminder('followUp', { note: event.target.value })} placeholder="e.g. Prepare questions for my visit" /></label>
        </div>
      </div>
      {reminderMessage && <p role="status" className="mt-3 text-sm text-rose-deep">{reminderMessage}</p>}
      <div className="mt-4 flex flex-wrap gap-3"><button className="btn" onClick={saveReminders}>Save reminders</button><button className="btn2" onClick={cancelReminders}>Cancel changes</button></div>
      {careReminders.sachet.enabled && profile.remind && <p className="mt-3 text-sm text-mauve">Sachet reminder saved for {careReminders.sachet.time} (demo only).</p>}
      {careReminders.followUp.enabled && <p className="mt-2 text-sm text-mauve">Follow-up reminder saved{careReminders.followUp.date ? ` for ${careReminders.followUp.date}` : ''}{careReminders.followUp.note ? ` · ${careReminders.followUp.note}` : ''} (demo only).</p>}
    </section>

    <section className="card">
      <h2 className="mb-1 text-2xl">Sachet tracker</h2><p className="mb-3 text-sm text-mauve">Tap a day when you took your sachet. Your entries stay in this demo session.</p>
      <div className="grid grid-cols-7 gap-2">{Array.from({ length: days }, (_, index) => index + 1).map(day => <button key={day} aria-pressed={!!taken[key(day)]} onClick={() => { toggleDay(key(day)); if (!taken[key(day)]) addLog('activity', `Sachet taken, day ${day}`) }} className={`rounded-lg py-2 text-sm font-bold ${taken[key(day)] ? 'bg-rose-deep text-white' : 'bg-blush'}`}>{day}</button>)}</div>
      <div className="mt-5 h-40"><ResponsiveContainer><BarChart data={weeks}><XAxis dataKey="week" /><YAxis allowDecimals={false} domain={[0, 7]} /><Tooltip /><Bar dataKey="taken" fill="#AD536F" radius={6} /></BarChart></ResponsiveContainer></div>
    </section>

    <section className="card">
      <h2 className="text-2xl">Your report uploads</h2>
      {latestReport ? <div className="mt-3 rounded-xl bg-blush p-4"><span className="demo">Upload found · no values extracted</span><p className="mt-2 font-bold">{latestReport.name}</p><p className="text-sm text-mauve">Added {latestReport.date}. Zoe cannot read or interpret this report. You can open it in Reports and discuss its contents with a qualified clinician.</p><Link className="mt-3 inline-block font-bold text-rose-deep underline" to="/reports">Open Health Reports</Link></div>
        : <p className="mt-2 text-sm text-mauve">No lab reports have been uploaded in this session. Uploads are not analysed. <Link className="font-bold text-rose-deep underline" to="/reports">Go to Health Reports</Link>.</p>}
    </section>

    <section className="card">
      <h2 className="mb-3 text-2xl">Nutrition education</h2>
      <label className="grid max-w-sm gap-1 text-sm font-bold">Dietary preference<select value={diet} onChange={event => { setDiet(event.target.value); setDietMessage('Dietary preference updated for this session.') }} aria-label="Diet preference"><option value="veg">Vegetarian</option><option value="vegdairy">Vegetarian with dairy</option><option value="nonveg">Non-vegetarian</option></select></label>
      {dietMessage && <p role="status" className="mt-2 text-sm text-rose-deep">{dietMessage}</p>}
      <ul className="mt-3 list-disc pl-5 text-mauve">{MEALS[diet].map(meal => <li key={meal}>{meal}</li>)}</ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{FOODS.map(([title, detail]) => <div key={title} className="rounded-xl bg-blush p-3"><b>{title}</b><p className="text-sm text-mauve">{detail}</p></div>)}</div>
      <p className="mt-3 text-xs text-mauve">General education only. It does not diagnose deficiencies or replace professional advice.</p>
    </section>
  </div>
}
