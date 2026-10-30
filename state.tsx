import { createContext, ReactNode, useContext, useState } from 'react'

export type LogType = 'note' | 'scan' | 'report' | 'activity' | 'consult'
export interface LogItem { id: string; type: LogType; title: string; date: string; demo: boolean }
export interface CartLine { sku: string; flavor?: string; qty: number }
export interface Profile {
  name: string
  age: string
  city: string
  email: string
  phone: string
  carePreference: string
  remind: boolean
  notifyUpdates: boolean
}
export interface ReportUpload {
  id: string
  kind: 'lab' | 'package'
  name: string
  date: string
  size: number
  mime: string
  previewUrl: string
}
export interface FamilyMember {
  id: string
  name: string
  relation: string
  email: string
  categories: string[]
  recordIds: string[]
}
export interface CareReminders {
  sachet: { enabled: boolean; time: string }
  followUp: { enabled: boolean; date: string; note: string }
}
interface Ctx {
  log: LogItem[]
  addLog: (t: LogType, title: string, demo?: boolean) => void
  cart: CartLine[]
  addToCart: (sku: string, flavor?: string) => void
  setQty: (sku: string, flavor: string | undefined, q: number) => void
  clearCart: () => void
  taken: Record<string, boolean>
  toggleDay: (d: string) => void
  tier: 'min' | 'max'
  setTier: (t: 'min' | 'max') => void
  diet: string
  setDiet: (d: string) => void
  profile: Profile
  setProfile: (p: Profile) => void
  reports: ReportUpload[]
  addReport: (report: Omit<ReportUpload, 'id'>) => void
  removeReport: (id: string) => void
  family: FamilyMember[]
  setFamily: (members: FamilyMember[]) => void
  careReminders: CareReminders
  setCareReminders: (reminders: CareReminders) => void
}
const C = createContext<Ctx>(null!)
export const useApp = () => useContext(C)

export function StateProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<LogItem[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [taken, setTaken] = useState<Record<string, boolean>>({})
  const [tier, setTier] = useState<'min' | 'max'>('min')
  const [diet, setDiet] = useState('veg')
  const [profile, setProfile] = useState<Profile>({
    name: 'Demo User',
    age: '',
    city: '',
    email: '',
    phone: '',
    carePreference: 'general',
    remind: true,
    notifyUpdates: false,
  })
  const [reports, setReports] = useState<ReportUpload[]>([])
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [careReminders, setCareReminders] = useState<CareReminders>({
    sachet: { enabled: false, time: '09:00' },
    followUp: { enabled: false, date: '', note: '' },
  })
  const addLog = (type: LogType, title: string, demo = false) =>
    setLog(items => [{ id: crypto.randomUUID(), type, title, date: new Date().toISOString().slice(0, 10), demo }, ...items])
  const addToCart = (sku: string, flavor?: string) => setCart(items => {
    const index = items.findIndex(item => item.sku === sku && item.flavor === flavor)
    return index < 0
      ? [...items, { sku, flavor, qty: 1 }]
      : items.map((item, current) => current === index ? { ...item, qty: item.qty + 1 } : item)
  })
  const setQty = (sku: string, flavor: string | undefined, qty: number) =>
    setCart(items => items.map(item => item.sku === sku && item.flavor === flavor ? { ...item, qty } : item).filter(item => item.qty > 0))
  const addReport = (report: Omit<ReportUpload, 'id'>) => {
    setReports(items => [{ ...report, id: crypto.randomUUID() }, ...items])
    addLog('report', `${report.kind === 'lab' ? 'Lab report' : 'Medicine package image'} uploaded: ${report.name}`)
  }
  const removeReport = (id: string) => {
    setReports(items => items.filter(item => item.id !== id))
    setFamily(members => members.map(member => ({ ...member, recordIds: member.recordIds.filter(recordId => recordId !== id) })))
  }
  const toggleDay = (day: string) => setTaken(items => ({ ...items, [day]: !items[day] }))

  return <C.Provider value={{
    log, addLog, cart, addToCart, setQty, clearCart: () => setCart([]), taken, toggleDay, tier, setTier,
    diet, setDiet, profile, setProfile, reports, addReport, removeReport, family, setFamily,
    careReminders, setCareReminders,
  }}>{children}</C.Provider>
}
