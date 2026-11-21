import {$,setup,status,advertiserInfo,renderCards,publicProperties} from '../shared/detail-ui.js';
try{
  const records=await setup();const id=new URLSearchParams(location.search).get('id');
  const user=records.users.find(u=>String(u.id)===String(id)&&u.is_active);
  if(!user)status('advertiser');
  else{
    const broker=advertiserInfo(records,user);
    document.title=`${user.full_name} | وسيط`;
    $('#advertiser-bio').textContent=broker?.bio||'معلن عقاري على وسيط في مدينة السادات. بيانات هذا الحساب والعقارات المعروضة تجريبية.';
    const properties=publicProperties(records).filter(p=>p.user_id===user.id);
    $('#advertiser-count').textContent=`${properties.length} عقار`;
    renderCards($('#advertiser-properties'),properties,records);
    $('#page-status').hidden=true;$('#advertiser-content').hidden=false;
  }
}catch(error){console.error('Advertiser profile failed:',error);status('error');}
document.documentElement.dataset.ready='true';
