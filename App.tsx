import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useApp } from './state'
import Home from './pages/Home'
import Kit from './pages/Kit'
import Scanner from './pages/Scanner'
import MyCare from './pages/MyCare'
import Store from './pages/Store'
import Cart from './pages/Cart'
import HowItWorks from './pages/HowItWorks'
import Reports from './pages/Reports'
import DoctorConnect from './pages/DoctorConnect'
import FamilyCare from './pages/FamilyCare'
import Profile from './pages/Profile'
import { Privacy, Disclaimer } from './pages/Static'
const NAV:[string,string,string][]=[['/','Home','Zoe'],['/how-it-works','How It Works','How Zoe works'],['/wellness-kit','Wellness Kit','Wellness Kit'],['/scanner','Scanner','μPAD Scanner'],['/reports','Reports','Health Reports'],['/my-care','My Care','My Care'],['/doctor-connect','Doctor Connect','Doctor Connect'],['/family-care','Family Care','Family Care'],['/store','Store','Store'],['/profile','Profile','Profile']]
export default function App(){
const {pathname}=useLocation();const [open,setOpen]=useState(false);const {cart}=useApp()
useEffect(()=>{const t=NAV.find(n=>n[0]===pathname)?.[2]??(pathname==='/cart'?'Cart':pathname==='/privacy'?'Privacy':pathname==='/medical-disclaimer'?'Medical Disclaimer':'Zoe');document.title=t==='Zoe'?'Zoe — Preventive wellness':t+' · Zoe';setOpen(false);window.scrollTo(0,0)},[pathname])
return <div className="min-h-screen">
<header className="sticky top-0 z-30 border-b border-warm bg-cream/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
<Link to="/" className="font-serif text-3xl text-rose-deep">Zoe</Link>
<nav aria-label="Primary navigation" className="hidden gap-4 text-sm font-bold lg:flex">{NAV.slice(1).map(n=><NavLink key={n[0]} to={n[0]} className={({isActive})=>isActive?'text-rose-deep':'text-mauve hover:text-plum'}>{n[1]}</NavLink>)}</nav>
<div className="flex items-center gap-3"><Link to="/cart" aria-label={`Cart${cart.length?`, ${cart.reduce((s,c)=>s+c.qty,0)} items`:''}`} className="relative"><ShoppingBag/>{cart.length>0&&<span aria-hidden="true" className="absolute -right-2 -top-2 rounded-full bg-rose-deep px-1.5 text-xs text-white">{cart.reduce((s,c)=>s+c.qty,0)}</span>}</Link>
<button className="lg:hidden" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></div>
{open&&<nav id="mobile-navigation" aria-label="Mobile navigation" className="grid gap-1 border-t border-warm bg-white p-4 lg:hidden">{NAV.map(n=><NavLink key={n[0]} to={n[0]} end={n[0]==='/'} className={({isActive})=>`py-2 font-bold ${isActive?'text-rose-deep':'text-mauve'}`}>{n[1]}</NavLink>)}</nav>}</header>
<AnimatePresence mode="wait"><motion.main key={pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.2}} className="mx-auto max-w-6xl px-4 py-8">
<Routes location={pathname}><Route path="/" element={<Home/>}/><Route path="/how-it-works" element={<HowItWorks/>}/><Route path="/wellness-kit" element={<Kit/>}/><Route path="/scanner" element={<Scanner/>}/><Route path="/reports" element={<Reports/>}/><Route path="/my-care" element={<MyCare/>}/><Route path="/doctor-connect" element={<DoctorConnect/>}/><Route path="/family-care" element={<FamilyCare/>}/><Route path="/profile" element={<Profile/>}/><Route path="/store" element={<Store/>}/><Route path="/cart" element={<Cart/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/medical-disclaimer" element={<Disclaimer/>}/>
<Route path="*" element={<Home/>}/></Routes></motion.main></AnimatePresence>
<footer className="border-t border-warm bg-blush px-4 py-8 text-sm text-mauve"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4"><p>Zoe is a prototype. Not a medical device. hello@zoe.example</p><p className="flex gap-4"><Link to="/privacy">Privacy</Link><Link to="/medical-disclaimer">Medical disclaimer</Link></p></div></footer></div>}
