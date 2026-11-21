import {initPropertyReporting} from '../shared/property-reporting.js';
import {$,icon,setup,status,message,detailURL,renderCards,advertiserInfo,publicProperties,resolveIcons} from '../shared/detail-ui.js';
import {propertyState,orderedImages} from '../shared/detail-data.js';
import {openDialog} from '../core/shell-init.js';
import {searchScenarios} from '../../data/search-scenarios.js';
import {AMENITIES,PAYMENTS} from '../shared/search-engine.js';
import {updateFavoriteButton} from '../shared/favorites.js';
const number=new Intl.NumberFormat('en-EG');
try{
  const records=await setup();
  const selected=propertyState(records,new URLSearchParams(location.search).get('id'));
  if(selected.kind!=='available')status(selected.kind);
  else {
    const {property:p,user,area,type,category}=selected;
    document.title=`${p.title} | وسيط`;
    $('#property-title').textContent=p.title;$('#transaction').textContent=p.listing_type==='rent'?'للإيجار':'للبيع';
    $('#created').textContent=p.created_at?`تاريخ الإضافة: ${new Intl.DateTimeFormat('ar-EG').format(new Date(p.created_at))}`:'';
    $('#place').textContent=`${area.name}، مدينة السادات، المنوفية`;
    $('#crumb-area').textContent=area.name;
    const period={month:'شهر',year:'سنة',day:'يوم'}[p.rent_period];
    $('#price').textContent=`${number.format(p.price)} جنيه${p.listing_type==='rent'&&period?' / '+period:''}`;
    const scenario=searchScenarios[String(p.id)]||{};
    $('#payment').textContent=(scenario.paymentMethods||[]).map(x=>PAYMENTS[x]).join(' أو ');$('#payment').hidden=!$('#payment').textContent;
    const specs=[['area','المساحة',`${p.size_m2} م²`],['building','نوع العقار',type.name],['building','التصنيف',category?.name]];
    if(category?.id==='residential'&&p.bedrooms!=null)specs.push(['bed','غرف النوم',p.bedrooms]);
    if(category?.id!=='land'&&p.bathrooms!=null)specs.push(['bath','الحمامات',p.bathrooms]);
    if(category?.id!=='land'&&p.finishing_type)specs.push(['key','التشطيب',p.finishing_type]);
    if(p.floor!=null)specs.push(['building','الدور',p.floor]);
    for(const [ic,label,value] of specs){const el=document.createElement('div');el.innerHTML=`<i>${icon(ic)}</i><span><small></small><b></b></span>`;el.querySelector('small').textContent=label;el.querySelector('b').textContent=value;$('#specifications').append(el);}
    $('#description').textContent=p.description||'لم يضف المعلن وصفًا لهذا العقار.';
    for(const key of scenario.amenities||[]){const el=document.createElement('span');el.innerHTML=`<i>${icon({elevator:'elevator',garage:'car',garden:'leaf',balcony:'balcony'}[key])}</i>`;el.append(document.createTextNode(AMENITIES[key]));$('#amenities').append(el);}
    if(!$('#amenities').children.length)$('#amenities').textContent='لم تُضف مميزات أخرى لهذا العقار.';
    $('#location-name').textContent=`${area.name}، مدينة السادات`;
    const coords=Number.isFinite(area.latitude)&&Number.isFinite(area.longitude);
    $('#location-copy').textContent=coords?`إحداثيات المنطقة المتاحة: ${area.latitude}، ${area.longitude}. الخريطة التفاعلية غير متاحة لعدم اعتماد مزود خرائط.`:'الخريطة غير متاحة: لا توجد إحداثيات مسجلة لهذه المنطقة. الموقع الدقيق يوضحه المعلن عند التواصل.';
    advertiserInfo(records,user,p);$('#advertiser-link').href=detailURL('advertiser',user.id);
    const images=orderedImages(records,p.id);let current=0;
    function photo(image,index){const img=document.createElement('img');img.src=image.url;img.alt=`${p.title} — صورة ${index+1} توضيحية`;img.addEventListener('error',()=>{img.hidden=true;img.parentElement.append(document.createTextNode('الصورة غير متاحة'));},{once:true});return img;}
    $('#large-image').addEventListener('error',()=>{ $('#large-image').alt='الصورة غير متاحة'; });
    function update(){
      $('#gallery-count').textContent=images.length?`${current+1} / ${images.length}`:'لا توجد صور';$('#large-count').textContent=$('#gallery-count').textContent;
      if(images.length){$('#large-image').src=images[current].url;$('#large-image').alt=`${p.title} — صورة ${current+1}`;const main=$('#gallery .d-gallery-main');main.replaceChildren(photo(images[current],current));main.setAttribute('aria-label',`تكبير صورة ${current+1}`);}
      document.querySelectorAll('[data-gallery-step]').forEach(b=>{b.disabled=images.length<2;});
      $('#thumbnails').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
    }
    for(const [i,image] of images.slice(0,3).entries()){const b=document.createElement('button');if(i===0)b.className='d-gallery-main';b.setAttribute('aria-label',`تكبير صورة ${i+1}`);b.append(photo(image,i));b.addEventListener('click',()=>{if(i!==0)current=i;update();openDialog($('#gallery-dialog'),b);});$('#gallery').append(b);}
    $('#gallery').classList.toggle('single',images.length<2);
    if(!images.length)$('#gallery').textContent='لا توجد صور لهذا العقار.';
    images.forEach((image,i)=>{const b=document.createElement('button');b.append(photo(image,i));b.setAttribute('aria-label',`عرض صورة ${i+1}`);b.addEventListener('click',()=>{current=i;update();});$('#thumbnails').append(b);});
    const step=amount=>{if(images.length){current=(current+amount+images.length)%images.length;update();}};
    document.querySelectorAll('[data-gallery-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.galleryStep))));
    $('#gallery-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?1:-1);}});update();
    $('#save').dataset.favoriteId=p.id;$('#save').dataset.favoriteTitle=p.title;updateFavoriteButton($('#save'));
    initPropertyReporting(records,p);
    $('#share').addEventListener('click',async e=>{const opener=e.currentTarget;try{await navigator.clipboard.writeText(detailURL('property',p.id));message('مشاركة العقار','تم نسخ رابط العقار.',opener);}catch{message('رابط العقار',detailURL('property',p.id),opener);}});
    const related=publicProperties(records).filter(x=>x.id!==p.id).sort((a,b)=>Number(b.property_type_id===p.property_type_id)-Number(a.property_type_id===p.property_type_id)).slice(0,2);
    renderCards($('#related'),related,records);
    $('#page-status').hidden=true;$('#property-content').hidden=false;$('#mobile-contact').hidden=false;resolveIcons();
  }
}catch(error){console.error('Property detail failed:',error);status('error');}
document.documentElement.dataset.ready='true';
