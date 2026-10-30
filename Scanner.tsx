import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state'
const SAMPLES={A:{q:'Good',out:'Reference pattern A matched the demo template.',color:'#E7B7C3',next:'Review the kit instructions and keep a note for your clinician.'},B:{q:'Good',out:'Reference pattern B matched the demo template.',color:'#C98AA0',next:'Discuss any concerns with a clinician.'},C:{q:'Unclear',out:'The image was too unclear to compare. No output produced.',color:'#9a9a9a',next:'Retake the photo in even daylight with the calibration card fully visible.'}} as const
const STAGES=['Checking image quality','Locating the reference card','Comparing visible colour regions','Preparing the explanation']
type K=keyof typeof SAMPLES
export default function Scanner(){const {addLog}=useApp();const [img,setImg]=useState<string|null>(null);const [err,setErr]=useState('');const [card,setCard]=useState(false);const [stage,setStage]=useState(-1);const [res,setRes]=useState<K|'upload'|null>(null);const [saved,setSaved]=useState(false)
const run=(r:K|'upload')=>{setRes(null);setSaved(false);setStage(0);[1,2,3,4].forEach(i=>setTimeout(()=>{setStage(i);if(i===4)setRes(r)},i*600))}
const pick=(f?:File)=>{setErr('');if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type))return setErr('Use a JPG, PNG or WebP image.');if(f.size>8*1024*1024)return setErr('Image must be under 8 MB.');setImg(URL.createObjectURL(f));setRes(null)}
const busy=stage>=0&&stage<4;const s=res&&res!=='upload'?SAMPLES[res]:null
return <div className="grid gap-6"><h1 className="text-4xl">μPAD scanner</h1><p className="max-w-prose text-mauve">This prototype has no validated analysis service. Results are <b>illustrative demos</b> and never measure a real biomarker.</p>
<div className="grid gap-6 md:grid-cols-2"><section className="card grid gap-3"><h2 className="text-2xl">1. Upload your strip photo</h2><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>pick(e.target.files?.[0])} aria-label="Upload strip photo"/>{err&&<p className="text-rose-deep">{err}</p>}
{img&&<img src={img} alt="Uploaded strip" className="max-h-64 rounded-xl object-contain"/>}
<label className="flex gap-2 text-sm"><input type="checkbox" checked={card} onChange={e=>setCard(e.target.checked)}/>The matching calibration card is visible in the photo.</label>
<ul className="list-disc pl-5 text-sm text-mauve"><li>Even daylight, no flash or shadows</li><li>Strip and card flat and in focus</li><li>Whole strip inside the frame</li></ul>
<button className="btn justify-center disabled:opacity-40" disabled={!img||!card||busy} onClick={()=>run('upload')}>Analyze sample</button></section>
<section className="card grid content-start gap-3"><h2 className="text-2xl">Try demo scan</h2><div className="flex gap-2">{(Object.keys(SAMPLES) as K[]).map(k=><button key={k} disabled={busy} className="btn2" onClick={()=>run(k)}>Sample {k}</button>)}</div>
<div className="flex h-12 overflow-hidden rounded-xl">{(['#F6D3DC','#E7B7C3','#D8899D','#AD536F'] as const).map(c=><div key={c} className="flex-1" style={{background:c}}/>)}</div><p className="text-xs text-mauve">Reference colour blocks (illustrative)</p>
{stage>=0&&<ul className="grid gap-1 text-sm">{STAGES.map((t,i)=><li key={t} className={i<=stage?'font-bold text-rose-deep':'text-mauve'}>{i<stage?'Done':i===stage&&busy?'Working':'Waiting'}: {t}</li>)}</ul>}
{res&&<div className="rounded-xl bg-blush p-4"><span className="demo">Illustrative demo — not a medical result</span>
{s?<><div className="my-3 h-6 w-full rounded" style={{background:s.color}}/><p>Quality: <b>{s.q}</b></p><p>{s.out}</p><p className="mt-2 text-sm text-mauve">Next step: {s.next}</p></>:<p className="mt-3">Your photo passed the checklist you confirmed. No result is produced because no validated analysis service is connected. Discuss any concerns with a clinician.</p>}
<p className="mt-2 text-xs text-mauve">This does not establish any deficiency, condition or diagnosis.</p>
<button className="btn mt-3" disabled={saved} onClick={()=>{addLog('scan',res==='upload'?'Uploaded photo reviewed (no result)':'Demo scan, sample '+res,true);setSaved(true)}}>{saved?'Saved to My Care':'Save to My Care'}</button> <Link className="btn2 mt-3" to="/my-care">Open My Care</Link></div>}
<button className="text-sm font-bold text-rose-deep" onClick={()=>{setImg(null);setRes(null);setStage(-1);setCard(false);setErr('')}}>Reset</button></section></div></div>}
