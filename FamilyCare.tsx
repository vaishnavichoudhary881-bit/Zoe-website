import { FormEvent, useEffect, useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useApp } from '../state'

const CATEGORIES = ['Lab reports', 'Health log notes', 'Care reminders', 'Scanner demo entries']

export default function FamilyCare() {
  const { family, setFamily, reports } = useApp()
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [email, setEmail] = useState('')
  const [drafts, setDrafts] = useState<Record<string, typeof family[number]>>({})
  const [editing, setEditing] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDrafts(Object.fromEntries(family.map(member => [member.id, {
      ...member,
      categories: [...member.categories],
      recordIds: [...member.recordIds],
    }])))
  }, [family])

  const addMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (!name.trim() || !relation.trim()) {
      setError('Add a name and relationship to create a demo profile.')
      return
    }
    const member = { id: crypto.randomUUID(), name: name.trim(), relation: relation.trim(), email: email.trim(), categories: [], recordIds: [] }
    setFamily([...family, member])
    setDrafts(current => ({ ...current, [member.id]: member }))
    setEditing(current => [...current, member.id])
    setName('')
    setRelation('')
    setEmail('')
    setMessage('Demo family profile added. No records are shared unless you select permissions and save them.')
  }

  const updateDraft = (id: string, change: Partial<typeof family[number]>) =>
    setDrafts(current => ({ ...current, [id]: { ...current[id], ...change } }))
  const toggle = (id: string, key: 'categories' | 'recordIds', value: string) => {
    const selected = drafts[id][key]
    updateDraft(id, { [key]: selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value] })
  }
  const save = (id: string) => {
    const draft = drafts[id]
    if (!draft.name.trim() || !draft.relation.trim()) {
      setError('Name and relationship are required before saving.')
      return
    }
    setFamily(family.map(member => member.id === id ? { ...draft, name: draft.name.trim(), relation: draft.relation.trim() } : member))
    setEditing(current => current.filter(memberId => memberId !== id))
    setError('')
    setMessage(`Profile and permissions saved for ${draft.name}. Only the selected items are available in this demo.`)
  }
  const cancel = (id: string) => {
    const saved = family.find(member => member.id === id)
    if (saved) setDrafts(current => ({ ...current, [id]: { ...saved, categories: [...saved.categories], recordIds: [...saved.recordIds] } }))
    setEditing(current => current.filter(memberId => memberId !== id))
    setMessage('Unsaved profile and permission changes were discarded.')
    setError('')
  }
  const revoke = (id: string) => {
    const member = family.find(item => item.id === id)
    if (!member || !window.confirm(`Revoke all record and category access for ${member.name}?`)) return
    const revoked = { ...member, categories: [], recordIds: [] }
    setFamily(family.map(item => item.id === id ? revoked : item))
    setDrafts(current => ({ ...current, [id]: revoked }))
    setEditing(current => current.filter(memberId => memberId !== id))
    setMessage(`All access for ${member.name} has been revoked in this demo.`)
  }

  return <div className="grid gap-7">
    <header><p className="mb-2 text-sm font-bold text-mauve">Sharing starts off</p><h1 className="text-4xl">Family care</h1><p className="mt-3 max-w-3xl text-mauve">Add demo profiles, then choose specific categories or individual reports for each person. Nothing is shared until you save your choices. This prototype does not send invitations or grant real account access.</p></header>
    <form className="card grid gap-3 md:grid-cols-4" onSubmit={addMember}>
      <div className="md:col-span-4"><h2 className="text-2xl">Add a family profile <span className="demo ml-2">DEMO</span></h2></div>
      <label className="grid gap-1 text-sm font-bold">Name<input value={name} onChange={event => setName(event.target.value)} /></label>
      <label className="grid gap-1 text-sm font-bold">Relationship<input value={relation} onChange={event => setRelation(event.target.value)} placeholder="e.g. Sister" /></label>
      <label className="grid gap-1 text-sm font-bold">Email (optional)<input type="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <button className="btn self-end"><UserPlus size={17} /> Add profile</button>
    </form>

    {error && <p role="alert" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{message}</p>}

    <section className="grid gap-4">
      <h2 className="text-2xl">Your family profiles</h2>
      {family.length === 0 && <div className="card flex items-center gap-3 text-mauve"><Users /><p>No family profiles yet. Add a demo profile above to manage permissions.</p></div>}
      {family.map(member => {
        const draft = drafts[member.id] ?? member
        const isEditing = editing.includes(member.id)
        const hasAccess = member.categories.length > 0 || member.recordIds.length > 0
        const selectedRecords = reports.filter(report => member.recordIds.includes(report.id))
        return <article className="card grid gap-4" key={member.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="text-xl">{member.name}</h3><p className="text-sm text-mauve">{member.relation}{member.email ? ` · ${member.email}` : ''}</p>
              <p className="mt-2 text-sm">{hasAccess ? 'Access granted to selected items:' : 'No records or categories are shared.'}</p>
              {hasAccess && <p className="text-sm text-mauve">{[...member.categories, ...selectedRecords.map(report => report.name)].join(' · ') || 'No currently available records are selected'}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isEditing && <button className="btn2" onClick={() => setEditing(current => [...current, member.id])}>Edit profile &amp; permissions</button>}
              {hasAccess && <button className="btn2" onClick={() => revoke(member.id)}>Revoke all access</button>}
            </div>
          </div>
          {isEditing && <div className="grid gap-4 border-t border-warm pt-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm font-bold">Name<input value={draft.name} onChange={event => updateDraft(member.id, { name: event.target.value })} /></label>
              <label className="grid gap-1 text-sm font-bold">Relationship<input value={draft.relation} onChange={event => updateDraft(member.id, { relation: event.target.value })} /></label>
              <label className="grid gap-1 text-sm font-bold">Email<input type="email" value={draft.email} onChange={event => updateDraft(member.id, { email: event.target.value })} /></label>
            </div>
            <fieldset><legend className="mb-2 font-bold">Categories to share with this person</legend><div className="grid gap-2 sm:grid-cols-2">{CATEGORIES.map(category => <label key={category} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.categories.includes(category)} onChange={() => toggle(member.id, 'categories', category)} />{category}</label>)}</div></fieldset>
            <fieldset><legend className="mb-2 font-bold">Specific lab reports to share</legend>
              {reports.filter(report => report.kind === 'lab').length
                ? <div className="grid gap-2">{reports.filter(report => report.kind === 'lab').map(report => <label key={report.id} className="flex items-center gap-2 break-all text-sm"><input type="checkbox" checked={draft.recordIds.includes(report.id)} onChange={() => toggle(member.id, 'recordIds', report.id)} />{report.name}</label>)}</div>
                : <p className="text-sm text-mauve">No uploaded lab reports are available. Upload one on the Reports page to grant per-report permission.</p>}
            </fieldset>
            <p className="rounded-xl bg-blush p-3 text-sm text-mauve">Permission changes remain a draft until saved. The family member is not notified and does not receive actual access in this prototype.</p>
            <div className="flex flex-wrap gap-3"><button className="btn" type="button" onClick={() => save(member.id)}>Save profile &amp; permissions</button><button className="btn2" type="button" onClick={() => cancel(member.id)}>Cancel</button></div>
          </div>}
        </article>
      })}
    </section>
  </div>
}
