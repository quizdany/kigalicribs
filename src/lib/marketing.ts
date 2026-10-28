export type MarketingProperty={id:string;title:string;location:string;price:number;bedrooms:number|null;status:string};
export function makePropertyPost(p:MarketingProperty,origin:string,language:'en'|'rw'){
 if(p.status!=='available')throw Error('Only available properties can be promoted.');
 if(!Number.isFinite(Number(p.price))||Number(p.price)<=0)throw Error('A valid rent is required.');
 const url=new URL(`/properties/${encodeURIComponent(p.id)}`,origin).href;
 const rent=new Intl.NumberFormat('en-US').format(Number(p.price));
 return language==='rw'?`${p.title}\n${p.location}\nUbukode: ${rent} RWF ku kwezi\n${p.bedrooms==null?'':`Ibyumba byo kuraramo: ${p.bedrooms}\n`}Vugana na nyir’inzu unyuze kuri TuraKGL. Banza wemeze ko inzu ikiboneka n’igihe cyo kuyisura.\n${url}`:`${p.title}\n${p.location}\nRent: RWF ${rent}/month\n${p.bedrooms==null?'':`Bedrooms: ${p.bedrooms}\n`}Connect directly with the owner through TuraKGL. Confirm current availability and viewing arrangements.\n${url}`;
}
export const launchPlan=[
 {day:'1',audience:'Property owners',content:'Introduce direct owner–renter connections and invite owners to submit complete listings.',link:'/owners/start'},
 {day:'2',audience:'Renters',content:'Show how to search by neighbourhood, monthly rent and number of bedrooms.',link:'/properties'},
 {day:'3',audience:'Renters',content:'Share one currently available property with permission to use its photos.',link:'/properties'},
 {day:'4',audience:'Property owners',content:'Explain the listing checklist: accurate rent, photos, features and availability.',link:'/owners/start'},
 {day:'5',audience:'Renters',content:'Explain how viewing requests work and that a request is not a confirmed appointment.',link:'/assistant'},
 {day:'6',audience:'Both',content:'Answer a common question using the help page. Avoid unsupported promises.',link:'/help'},
 {day:'7',audience:'Both',content:'Review actual requests and owner responses, then decide what to improve next.',link:'/requests'},
];
