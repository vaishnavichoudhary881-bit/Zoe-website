import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, FileText, HeartHandshake, Package, ScanLine, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: Package,
    title: '1. Get to know your kit',
    body: 'The Zoe wellness kit is a prototype. Its illustrated components include a μPAD test strip, sample collection items, a colour calibration card, sachets and a quick-start booklet. Final contents and instructions must always come from the product packaging.',
  },
  {
    icon: ScanLine,
    title: '2. Follow the μPAD instructions',
    body: 'A μPAD (microfluidic paper-based analytical device) is a paper-based testing format. In a validated product workflow, you would follow the supplied instructions to prepare a sample and place it on the designated strip area. This prototype does not perform or validate a real test.',
  },
  {
    icon: ClipboardCheck,
    title: '3. Use the calibration card',
    body: 'The reference card is intended to help a validated imaging workflow account for colour and lighting. Keep the matching card visible, use even light and avoid shadows. A card does not turn an unvalidated photo into a medical result.',
  },
  {
    icon: FileText,
    title: '4. Read a report with care',
    body: 'A report may show a test name, a value, units and a laboratory reference range. The range is context from that lab, not a diagnosis by itself. Zoe does not analyse uploaded reports or scanner photos; ask a qualified clinician to interpret your results.',
  },
  {
    icon: Sparkles,
    title: '5. Understand the sachets',
    body: 'Sachets in this concept represent daily nutrition support. Check the actual ingredient list, directions, allergen and safety information on a real product before use. The demo tracker is a personal log, not a recommendation to start supplements.',
  },
  {
    icon: HeartHandshake,
    title: '6. Choose your follow-up',
    body: 'Keep questions and notes together, set reminders for yourself, and decide whether to contact a clinician. Family access is off unless you explicitly grant it, and demo appointments on this site are not sent to a clinic.',
  },
]

export default function HowItWorks() {
  return (
    <div className="grid gap-10">
      <header className="max-w-3xl">
        <p className="mb-2 text-sm font-bold text-mauve">A simple guide to the Zoe concept</p>
        <h1 className="text-4xl leading-tight md:text-5xl">Understand every step, before you begin.</h1>
        <p className="mt-4 text-mauve">The kit and testing journey shown here are educational product concepts, not instructions for a clinically validated test. Always follow the official instructions for any real product you use.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <article key={title} className="card">
            <Icon className="mb-3 text-rose-deep" aria-hidden="true" />
            <h2 className="text-2xl">{title}</h2>
            <p className="mt-2 leading-relaxed text-mauve">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-blush p-6 md:p-8">
        <span className="demo">Important distinction</span>
        <h2 className="mt-3 text-3xl">A demo is not a test result.</h2>
        <p className="mt-2 max-w-3xl text-mauve">The scanner can show illustrative sample screens, but it does not measure a biomarker. Uploaded files stay in this browser session; this site has no OCR, report-reading AI, laboratory connection or clinical review service.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn" to="/wellness-kit">Explore the 3D kit <ArrowRight size={16} /></Link>
          <Link className="btn2" to="/scanner">See the scanner demo</Link>
          <Link className="btn2" to="/medical-disclaimer">Medical disclaimer</Link>
        </div>
      </section>
    </div>
  )
}
