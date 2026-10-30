import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import { PRODUCTS, price, inr } from '../lib/pricing'
import { useApp } from '../state'
const S=z.object({name:z.string().min(2,'Enter your name'),phone:z.string().regex(/^\d{10}$/,'10-digit number'),pin:z.string().regex(/^\d{6}$/,'6-digit pincode')})
type F=z.infer<typeof S>
export default function Cart(){const {cart,setQty,clearCart,tier}=useApp();const [done,setDone]=useState<string|null>(null)
const {register,handleSubmit,formState:{errors}}=useForm<F>({resolver:zodResolver(S)})
const lines=cart.map(c=>({c,p:PRODUCTS.find(p=>p.sku===c.sku)!}));const total=lines.reduce((s,{c,p})=>s+price(p,tier)*c.qty,0)
if(done)return <div className="card max-w-xl"><h1 className="text-3xl">Order placed (simulated)</h1><p className="mt-2 text-mauve">Reference {done}. No payment was taken and nothing will ship.</p><Link className="btn mt-4" to="/store">Back to store</Link></div>
if(!cart.length)return <div className="card max-w-xl"><h1 className="text-3xl">Your cart is empty</h1><Link className="btn mt-4" to="/store">Browse the store</Link></div>
return <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]"><div><h1 className="mb-4 text-4xl">Cart</h1><div className="grid gap-3">{lines.map(({c,p})=><div key={c.sku+c.flavor} className="card flex items-center justify-between gap-3"><div><p className="font-bold">{p.name}</p><p className="text-sm text-mauve">{c.flavor??'No flavor'} · {inr(price(p,tier))}</p></div>
<div className="flex items-center gap-2"><button aria-label="Decrease" onClick={()=>setQty(c.sku,c.flavor,c.qty-1)}><Minus size={18}/></button><span>{c.qty}</span><button aria-label="Increase" onClick={()=>setQty(c.sku,c.flavor,c.qty+1)}><Plus size={18}/></button></div></div>)}</div></div>
<form className="card grid h-fit gap-3" onSubmit={handleSubmit(()=>{setDone('ZOE-'+Math.floor(Date.now()/1000));clearCart()})}><h2 className="text-2xl">Order summary</h2><p className="flex justify-between"><span>Total</span><b>{inr(total)}</b></p>
{(['name','phone','pin'] as const).map(k=><label key={k} className="grid text-sm capitalize">{k==='pin'?'Pincode':k}<input {...register(k)}/><span className="text-rose-deep">{errors[k]?.message}</span></label>)}
<button className="btn justify-center">Place simulated order</button></form></div>}
