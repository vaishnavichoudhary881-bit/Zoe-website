// Configurable pricing (INR). Edit here; the Store has a Low/High toggle for ranged items.
export interface Product{sku:string;name:string;desc:string;min:number;max:number;flavors?:string[];recurring?:string}
export const FLAVORS=['Mango','Orange','Mixed Berry'] // placeholder flavors, edit freely
export const PRODUCTS:Product[]=[
{sku:'kit',name:'Zoe Wellness Kit (one-time)',desc:'Box, μPAD strips, calibration card, vials, sachets, pouches, booklet.',min:389,max:389,flavors:FLAVORS},
{sku:'quarterly',name:'Quarterly Delivery',desc:'A kit every quarter, billed annually.',min:1167,max:1167,flavors:FLAVORS,recurring:'/year'},
{sku:'annual',name:'Annual Delivery',desc:'Monthly kits across the year, billed annually.',min:4668,max:4668,flavors:FLAVORS,recurring:'/year'},
{sku:'refill',name:'μPAD Refill Pack',desc:'Extra strips for supported at-home tests.',min:89,max:99},
{sku:'sachets',name:'Daily Sachets (30)',desc:'Everyday nutrition sachets. Final formulation pending validation.',min:249,max:279,flavors:FLAVORS},
{sku:'pouches',name:'Disposal Pouches (4)',desc:'Hygienic disposal of used testing materials.',min:29,max:39}]
export const price=(p:Product,t:'min'|'max')=>t==='min'?p.min:p.max
export const inr=(n:number)=>'₹'+n.toLocaleString('en-IN')
