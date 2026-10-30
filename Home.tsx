import { Link } from 'react-router-dom'
import { Box, ScanLine, FileText, HeartPulse, Stethoscope, Users } from 'lucide-react'
const F=[['/wellness-kit','Wellness Kit','Explore the kit in 3D.',Box],['/scanner','Scanner','Try the μPAD demo scan.',ScanLine],['/reports','Health Reports','Understand reports and labels.',FileText],['/my-care','My Care','Log, nutrition and sachet tracker.',HeartPulse],['/doctor-connect','Doctor Connect','Find and book a clinician.',Stethoscope],['/family-care','Family Care','Share with consent.',Users]] as const
export default function Home(){return <div className="grid gap-16">
<section className="grid items-center gap-10 md:grid-cols-2"><div>
<p className="mb-3 text-sm font-bold text-mauve">Preventive wellness, reimagined</p>
<h1 className="text-4xl leading-tight md:text-6xl">She Cares for Everyone. Zoe Helps Her Care for Herself.</h1>
<p className="mt-5 max-w-prose text-mauve">Zoe brings a wellness-kit concept, simple health education, daily nutrition guidance and consent-first family care into one place. Your health deserves a place on your to-do list.</p>
<div className="mt-6 flex flex-wrap gap-3"><Link className="btn" to="/how-it-works">Explore Zoe</Link><Link className="btn2" to="/wellness-kit">Discover the Wellness Kit</Link></div></div>
<div className="relative mx-auto h-72 w-full max-w-sm rounded-[3rem] bg-warm md:h-96" aria-label="Illustration of the Zoe kit">
<div className="absolute left-8 top-14 h-44 w-56 rotate-[-6deg] rounded-2xl bg-cream shadow-xl md:h-56 md:w-64"><span className="absolute left-5 top-4 font-serif text-4xl text-rose-deep">Zoe</span><span className="absolute bottom-4 left-5 text-xs text-mauve">Wellness kit</span></div>
<div className="absolute bottom-10 right-8 h-10 w-36 rotate-12 rounded-md bg-white shadow"><div className="m-2 h-6 w-full rounded bg-sage/60"/></div>
<div className="absolute right-12 top-10 h-16 w-10 rotate-6 rounded-md bg-rose shadow"/></div></section>
<section className="rounded-3xl bg-white p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-mauve">Women's preventive healthcare</p><h2 className="mt-1 text-3xl">Small steps, made easier to see.</h2></div><span className="demo">Illustrative information · not population statistics</span></div>
<p className="mt-3 max-w-3xl text-mauve">We have not included numerical health statistics without a verified source and clear context. These examples show what a preventive-care experience could help organise; they are not research findings or claims about health outcomes.</p>
<div className="mt-5 grid gap-3 sm:grid-cols-3">{[['01','A place for your questions','Keep personal notes ready for a conversation with a clinician.'],['02','A clearer view of your care','Bring reports and follow-up reminders together in one demo space.'],['03','Your choice about sharing','Family permissions start off and are granted record by record.']].map(([n,t,d])=><article key={n} className="rounded-2xl bg-cream p-4"><span className="font-serif text-2xl text-rose-deep">{n}</span><h3 className="mt-2 text-lg">{t}</h3><p className="mt-1 text-sm text-mauve">{d}</p></article>)}</div></section>
<section><h2 className="mb-5 text-3xl">Explore the platform</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{F.map(([to,t,d,I])=><Link key={to} to={to} className="card transition hover:border-rose"><I className="mb-3 text-rose-deep"/><h3 className="text-xl">{t}</h3><p className="text-sm text-mauve">{d}</p></Link>)}</div>
<Link to="/store" className="btn mt-6">Visit the store</Link></section>
<section className="rounded-3xl bg-blush p-8 text-center"><h2 className="text-3xl">A Little More Care for the Woman Behind It All.</h2><Link to="/wellness-kit" className="btn mt-5">Discover Zoe</Link></section></div>}
