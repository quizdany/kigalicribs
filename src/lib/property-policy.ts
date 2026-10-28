import { z } from 'zod';
const short=z.string().trim().max(200);
const safeImage=z.string().url().max(2000).refine(v=>v.startsWith('https://'),'Image URLs must use HTTPS');
export const propertyEditSchema=z.object({
 title:z.string().trim().min(5).max(160),description:z.string().trim().min(20).max(10000),
 property_type:z.enum(['apartment','house','studio','room']),price:z.number().finite().positive().max(100000000),
 bedrooms:z.number().int().min(0).max(50).nullable(),bathrooms:z.number().int().min(0).max(50).nullable(),
 size:z.number().finite().positive().max(1000000).nullable(),address:short,district:short,
 sector:short.nullable(),cell:short.nullable(),location:short,
 amenities:z.array(z.string().trim().min(1).max(80)).max(30),images:z.array(safeImage).max(30),
 owner_phone:z.string().trim().max(30).regex(/^[+\d ()-]*$/),status:z.enum(['available','rented','maintenance']),
}).partial().strict();
export function redactProperty<T extends Record<string,unknown>>(property:T){const {owner_email,owner_phone,...publicData}=property;return publicData;}
const integer=(max:number)=>z.coerce.number().int().min(0).max(max);
const searchText=z.string().trim().max(100).regex(/^[\p{L}\p{N} .'-]*$/u,'Use letters, numbers, spaces, apostrophes or hyphens.');
export const propertyQuerySchema=z.object({page:z.coerce.number().int().min(1).max(10000).default(1),perPage:z.coerce.number().int().min(1).max(50).default(20),q:searchText.optional(),location:searchText.optional(),propertyType:z.enum(['all','apartment','house','studio','room']).optional(),minPrice:integer(100000000).optional(),maxPrice:integer(100000000).optional(),bedrooms:integer(50).optional(),bathrooms:integer(50).optional(),minBedrooms:integer(50).optional(),minBathrooms:integer(50).optional(),amenities:z.string().max(1000).optional(),ids:z.string().max(1000).refine(v=>v.split(',').length<=20&&v.split(',').every(id=>z.string().uuid().safeParse(id).success),'Invalid shortlist').optional(),sort:z.enum(['newest','price_asc','price_desc']).default('newest')}).refine(v=>v.minPrice===undefined||v.maxPrice===undefined||v.minPrice<=v.maxPrice,'Minimum rent cannot exceed maximum rent.');
