// Demo review outcomes only; none of this envelope is an ERD entity/column.
export const REVIEW_KEY='waseet-moderation-v1';
export const reviewKey=(role,email,id)=>`${role}:${email}:${id}`;
export const imageOK=url=>typeof url==='string'&&((/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url)&&url.length<2800000)||/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?[^\s<>]+$/.test(url));
export function readReviews(storage,clean){
  const result={};try{
    const text=storage.getItem(REVIEW_KEY);if(text?.length>8000000)return result;
    const raw=JSON.parse(text||'{}');if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
    for(const [key,value]of Object.entries(raw).slice(0,300)){
      if(!/^(owner|broker|agency):[^\s]+@[^\s]+:\d+$/.test(key)||!value||typeof value!=='object')continue;
      const entry={};
      try{if(value.accepted){const a=value.accepted;const property=clean(a.property);if(!Array.isArray(a.images)||!a.images.length||a.images.length>6||!a.images.every(imageOK)||!Number.isFinite(a.expiresAt)||a.expiresAt<=0)throw Error();entry.accepted={property,images:a.images,expiresAt:a.expiresAt};}}catch{}
      const r=value.rejection;if(r&&['listing','edit'].includes(r.kind)&&typeof r.reason==='string'&&r.reason.trim()&&r.reason.length<=1000)entry.rejection={kind:r.kind,reason:r.reason.trim()};
      result[key]=entry;
    }
  }catch{}return result;
}
export function applyReviews(storage,role,account,items,clean){
  const reviews=readReviews(storage,clean);
  return items.map(item=>{
    const review=reviews[reviewKey(role,account.id,item.property.id)];if(!review)return item;
    const accepted=review.accepted;
    return {...item,property:accepted?{...item.property,...accepted.property,status:'published'}:
      {...item.property,status:review.rejection?.kind==='listing'&&!item.pending?'rejected':item.property.status},
      images:accepted?accepted.images:item.images,term:item.term||accepted?.expiresAt||null,
      rejectionReason:!item.pending?review.rejection?.reason||'':'',rejectionKind:review.rejection?.kind||null};
  });
}
export function nextPropertyId(storage,now){
  const ids=[];for(const role of ['owner','broker','agency'])try{const raw=JSON.parse(storage.getItem(`waseet-${role}-v1`)||'{}');for(const state of Object.values(raw))for(const item of state.created||[])if(Number.isSafeInteger(item.id))ids.push(item.id);}catch{}
  return Math.max(1000,now,...ids.map(id=>id+1));
}
export function commitSession(storage,updates){
  const before=updates.map(([key])=>storage.getItem(key));
  try{for(const [key,value]of updates)storage.setItem(key,value);}
  catch{for(let i=updates.length-1;i>=0;i--)try{if(before[i]===null)storage.removeItem(updates[i][0]);else storage.setItem(updates[i][0],before[i]);}catch{}throw new Error('تعذّر حفظ القرار. لم تكتمل العملية؛ قلّل حجم الصور أو تحقق من تخزين الجلسة.');}
}
