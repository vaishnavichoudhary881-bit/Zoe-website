import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, price, inr, Product } from '../lib/pricing'
import { useApp } from '../state'
function Item({p}:{p:Product}){const {addToCart,tier}=useApp();const [f,setF]=useState(p.flavors?.[0]);const [ok,setOk]=useState(false)
return <div className="card flex flex-col gap-2"><h3 className="text-xl">{p.name}</h3><p className="text-sm text-mauve">{p.desc}</p>
<p className="text-2xl font-bold text-rose-deep">{inr(price(p,tier))}{p.recurring}</p>
{p.flavors&&<label className="text-sm">Flavor <select value={f} onChange={e=>setF(e.target.value)}>{p.flavors.map(x=><option key={x}>{x}</option>)}</select></label>}
<button className="btn mt-auto justify-center" onClick={()=>{addToCart(p.sku,f);setOk(true);setTimeout(()=>setOk(false),1200)}}>{ok?'Added':'Add to cart'}</button></div>}
export default function Store(){const {tier,setTier}=useApp()
return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><h1 className="text-4xl">Wellness store</h1>
<label className="text-sm">Ranged-price tier <select value={tier} onChange={e=>setTier(e.target.value as 'min'|'max')}><option value="min">Low end</option><option value="max">High end</option></select></label></div>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PRODUCTS.map(p=><Item key={p.sku} p={p}/>)}</div><Link className="btn2 mt-6" to="/cart">Go to cart</Link></div>}
