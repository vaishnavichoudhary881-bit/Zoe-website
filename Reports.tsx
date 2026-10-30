import { ChangeEvent, useState } from 'react'
import { FileText, Minus, Plus, Trash2, Upload, X } from 'lucide-react'
import { useApp } from '../state'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EXPLANATIONS: Record<string, string> = {
  test: 'The test name tells you what the laboratory measured. If a name or abbreviation is unfamiliar, ask the ordering clinician or laboratory.',
  value: 'A value is shown with its unit. Units matter when comparing results, so do not compare a number alone across different reports.',
  range: 'A reference range is the comparison interval printed by that laboratory. A result outside it is not, on its own, a diagnosis.',
  flag: 'Flags and notes depend on the lab and the test. Ask a qualified clinician to explain them in the context of your health.',
}

export default function Reports() {
  const { reports, addReport, removeReport } = useApp()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [explanation, setExplanation] = useState('test')
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const packageImage = reports.find(report => report.kind === 'package')
  const viewerImage = reports.find(report => report.id === viewerId && report.kind === 'package')

  const upload = (kind: 'lab' | 'package') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setError('')
    setNotice('')
    if (!file) return
    const supported = kind === 'lab' ? [...IMAGE_TYPES, 'application/pdf'] : IMAGE_TYPES
    if (!supported.includes(file.type)) {
      setError(kind === 'lab' ? 'Choose a PDF, JPG, PNG or WebP lab report.' : 'Choose a JPG, PNG or WebP package image.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Files must be 10 MB or smaller.')
      return
    }
    addReport({
      kind,
      name: file.name,
      date: new Date().toISOString().slice(0, 10),
      size: file.size,
      mime: file.type,
      previewUrl: URL.createObjectURL(file),
    })
    setNotice(kind === 'lab' ? 'Report added to your demo list.' : 'Package image added. You can open the zoom viewer below.')
  }

  const deleteUpload = (id: string, previewUrl: string) => {
    if (!window.confirm('Remove this uploaded file from this demo session?')) return
    URL.revokeObjectURL(previewUrl)
    removeReport(id)
    setNotice('Upload removed from this demo session.')
  }

  return <div className="grid gap-8">
    <header className="max-w-3xl">
      <p className="mb-2 text-sm font-bold text-mauve">Your files stay in this browser session</p>
      <h1 className="text-4xl">Health reports</h1>
      <p className="mt-3 text-mauve">Upload and organise files for your own reference. Zoe does not extract, interpret or verify medical results; nothing is sent to a clinician.</p>
    </header>

    <div className="grid gap-5 md:grid-cols-2">
      <section className="card grid content-start gap-3">
        <FileText className="text-rose-deep" aria-hidden="true" />
        <h2 className="text-2xl">Add a lab report</h2>
        <p className="text-sm text-mauve">Supported: PDF, JPG, PNG and WebP. Maximum file size: 10 MB.</p>
        <label className="btn w-fit cursor-pointer"><Upload size={17} /> Choose report
          <input className="sr-only" type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={upload('lab')} aria-label="Upload lab report" />
        </label>
      </section>
      <section className="card grid content-start gap-3">
        <Upload className="text-rose-deep" aria-hidden="true" />
        <h2 className="text-2xl">Inspect a medicine package</h2>
        <p className="text-sm text-mauve">Upload a clear photo of the printed manufacturing or expiry date. The viewer can zoom; it does not read or verify dates.</p>
        <label className="btn w-fit cursor-pointer"><Upload size={17} /> Choose package image
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload('package')} aria-label="Upload medicine package image" />
        </label>
      </section>
    </div>
    {error && <p role="alert" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-blush p-3 text-sm text-rose-deep">{notice}</p>}

    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl">Uploaded lab reports</h2><p className="text-sm text-mauve">Files are kept in memory only and disappear when this session is refreshed.</p></div>
        <span className="demo">{reports.filter(report => report.kind === 'lab').length} uploaded</span>
      </div>
      <ul className="mt-4 grid gap-3">
        {reports.filter(report => report.kind === 'lab').map(report => <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream p-3">
          <div className="flex min-w-0 items-center gap-3"><FileText size={20} className="shrink-0 text-rose-deep" /><div className="min-w-0"><p className="break-all font-bold">{report.name}</p><p className="text-xs text-mauve">Added {report.date} · {(report.size / 1024 / 1024).toFixed(1)} MB</p></div></div>
          <div className="flex items-center gap-3">
            {report.mime === 'application/pdf'
              ? <a className="font-bold text-rose-deep underline" href={report.previewUrl} target="_blank" rel="noreferrer">Open PDF</a>
              : <a className="font-bold text-rose-deep underline" href={report.previewUrl} target="_blank" rel="noreferrer">Open image</a>}
            <button type="button" className="rounded-full p-2 text-mauve hover:bg-blush" onClick={() => deleteUpload(report.id, report.previewUrl)} aria-label={`Remove ${report.name}`}><Trash2 size={17} /></button>
          </div>
        </li>)}
      </ul>
      {reports.every(report => report.kind !== 'lab') && <p className="mt-4 rounded-xl bg-cream p-4 text-sm text-mauve">No reports uploaded yet. Add a file above to see it listed here.</p>}
    </section>

    <section className="grid gap-5 md:grid-cols-2">
      <article className="card">
        <span className="demo">DEMO explanation</span>
        <h2 className="mt-3 text-2xl">Report words, in simple language</h2>
        <label className="mt-3 grid gap-2 text-sm font-bold">Choose a report term
          <select value={explanation} onChange={event => setExplanation(event.target.value)}>
            <option value="test">Test name</option><option value="value">Value and units</option><option value="range">Reference range</option><option value="flag">Flags and notes</option>
          </select>
        </label>
        <p className="mt-3 rounded-xl bg-blush p-4 text-mauve" aria-live="polite">{EXPLANATIONS[explanation]}</p>
        <p className="mt-3 text-xs text-mauve">Educational wording only. This is not an explanation of an uploaded report or a medical interpretation.</p>
      </article>
      <article className="card">
        <span className="demo">Image viewer</span>
        <h2 className="mt-3 text-2xl">Medicine package dates</h2>
        {packageImage ? <div className="mt-3 grid gap-3">
          <img src={packageImage.previewUrl} alt={`Uploaded medicine package: ${packageImage.name}`} className="max-h-52 w-full rounded-xl bg-cream object-contain" />
          <p className="break-all text-sm text-mauve">{packageImage.name}</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn" type="button" onClick={() => { setViewerId(packageImage.id); setZoom(1) }}>Open zoom viewer</button>
            <button className="btn2" type="button" onClick={() => deleteUpload(packageImage.id, packageImage.previewUrl)}>Remove image</button>
          </div>
          <p className="text-xs text-mauve">Please check printed dates directly on the package. This viewer does not detect, read or verify them.</p>
        </div> : <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-mauve">No package image yet. Upload a photo above to inspect it with zoom controls.</p>}
      </article>
    </section>

    {viewerImage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum/80 p-3" role="dialog" aria-modal="true" aria-label="Zoomable medicine package image viewer">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-cream p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="break-all font-bold">{viewerImage.name}</h2>
          <button type="button" className="rounded-full p-2 hover:bg-blush" onClick={() => setViewerId(null)} aria-label="Close image viewer"><X /></button>
        </div>
        <div className="my-3 flex items-center justify-center gap-3">
          <button className="btn2 p-2" onClick={() => setZoom(value => Math.max(1, value - .25))} aria-label="Zoom out"><Minus size={18} /></button>
          <input aria-label="Image zoom" type="range" min="1" max="3" step=".25" value={zoom} onChange={event => setZoom(Number(event.target.value))} />
          <button className="btn2 p-2" onClick={() => setZoom(value => Math.min(3, value + .25))} aria-label="Zoom in"><Plus size={18} /></button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white text-center">
          <img src={viewerImage.previewUrl} alt={`Zoomed medicine package: ${viewerImage.name}`} className="mx-auto origin-center py-4 transition-transform" style={{ transform: `scale(${zoom})` }} />
        </div>
        <p className="mt-3 text-xs text-mauve">Zoom only enlarges the image; no OCR or date verification is performed.</p>
      </div>
    </div>}
  </div>
}
