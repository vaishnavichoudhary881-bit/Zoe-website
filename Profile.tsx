import { FormEvent, useEffect, useState } from 'react'
import { useApp } from '../state'

export default function Profile() {
  const { profile, setProfile, diet, setDiet } = useApp()
  const [draft, setDraft] = useState(profile)
  const [draftDiet, setDraftDiet] = useState(diet)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(profile)
    setDraftDiet(diet)
  }, [profile, diet])

  const update = (key: keyof typeof draft, value: string | boolean) => setDraft(current => ({ ...current, [key]: value }))
  const cancel = () => {
    setDraft(profile)
    setDraftDiet(diet)
    setError('')
    setMessage('Unsaved changes were discarded.')
  }
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (!draft.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (draft.age && (!Number.isInteger(Number(draft.age)) || Number(draft.age) < 13 || Number(draft.age) > 120)) {
      setError('Enter an age from 13 to 120, or leave it blank.')
      return
    }
    setProfile({ ...draft, name: draft.name.trim() })
    setDiet(draftDiet)
    setMessage('Your demo profile and preferences have been saved for this session.')
  }

  return <div className="grid gap-6">
    <header><p className="mb-2 text-sm font-bold text-mauve">Your details are stored in this session only</p><h1 className="text-4xl">Profile</h1></header>
    <form className="card grid gap-6" onSubmit={save}>
      <section>
        <h2 className="mb-3 text-2xl">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Name<input autoComplete="name" value={draft.name} onChange={event => update('name', event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold">Age (optional)<input type="number" min="13" max="120" value={draft.age} onChange={event => update('age', event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold">City (optional)<input autoComplete="address-level2" value={draft.city} onChange={event => update('city', event.target.value)} /></label>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">Contact information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Email (optional)<input type="email" autoComplete="email" value={draft.email} onChange={event => update('email', event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold">Phone (optional)<input type="tel" autoComplete="tel" value={draft.phone} onChange={event => update('phone', event.target.value)} /></label>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Dietary preference
            <select value={draftDiet} onChange={event => setDraftDiet(event.target.value)}><option value="veg">Vegetarian</option><option value="vegdairy">Vegetarian with dairy</option><option value="nonveg">Non-vegetarian</option></select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Care topics
            <select value={draft.carePreference} onChange={event => update('carePreference', event.target.value)}><option value="general">General preventive care</option><option value="nutrition">Nutrition education</option><option value="reproductive">Reproductive health</option><option value="menopause">Midlife and menopause</option></select>
          </label>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">Notification settings</h2>
        <div className="grid gap-3">
          <label className="flex items-start gap-3"><input type="checkbox" checked={draft.remind} onChange={event => update('remind', event.target.checked)} /><span><b>Care reminders</b><span className="block text-sm text-mauve">Allow the demo My Care page to show the reminders you configure. No push or email is sent.</span></span></label>
          <label className="flex items-start gap-3"><input type="checkbox" checked={draft.notifyUpdates} onChange={event => update('notifyUpdates', event.target.checked)} /><span><b>Product updates</b><span className="block text-sm text-mauve">Preference only; this prototype does not send communications.</span></span></label>
        </div>
      </section>
      {error && <p role="alert" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{message}</p>}
      <div className="flex flex-wrap gap-3"><button className="btn" type="submit">Save profile</button><button className="btn2" type="button" onClick={cancel}>Cancel changes</button></div>
      <p className="text-xs text-mauve">Demo only: profile data is not sent to a server and clears when the page is refreshed.</p>
    </form>
  </div>
}
