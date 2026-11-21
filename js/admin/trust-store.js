import {commitNotificationWrites} from '../shared/notification-store.js';
import {adminDemo} from '../../data/admin-demo.js';
import {accountDirectory} from '../shared/account-directory.js';
import {VERIFICATION_KEY,verificationDecisions} from '../shared/verification-state.js';
import {createReportsStore,REPORT_CATEGORIES} from '../shared/reports-store.js';
// Explicit existing-fixture references; unbound source companies are not fabricated accounts.
const applicants={'كريم السيد':'elmalky-broker@gmail.com','محمد أحمد':'elmalky-owner@gmail.com','عقارات السادات':'elmalky-agency@gmail.com'};
export function createVerificationStore(storage,records){
 const list=()=>{const directory=accountDirectory(storage,records),decisions=verificationDecisions(storage,true);return adminDemo.verification.flatMap(row=>{const email=applicants[row.name],user=directory.users.find(x=>x.id===email);return user?[{...row,email,user,status:decisions[email]?.status||row.status,rejectionReason:decisions[email]?.reason||''}]:[];});};
 return {list,decide(email,decision,reason='',expected){if(!['approve','reject'].includes(decision)||typeof reason!=='string'||reason.length>1000||(decision==='reject'&&!reason.trim()))throw Error('سبب الرفض مطلوب، بحد أقصى 1000 حرف.');const row=list().find(x=>x.email===email);if(!row||row.status!=='قيد المراجعة'||expected!==row.status)throw Error('الطلب غير موجود أو تمت مراجعته.');const values=verificationDecisions(storage,true);values[email]={status:decision==='approve'?'موثق':'مرفوض',reason:decision==='reject'?reason.trim():''};try{commitNotificationWrites(storage,[[VERIFICATION_KEY,JSON.stringify(values)]],[{recipient:email,type:decision==='approve'?'verification_approved':'verification_rejected',title:decision==='approve'?'تمت الموافقة على التوثيق':'تم رفض طلب التوثيق',text:decision==='approve'?'تم تحديث شارة توثيق المعلن في العرض.':'سبب الرفض: '+reason.trim(),target:{view:'home',role:row.user.role_id}}]);}catch{throw Error('تعذّر حفظ قرار التوثيق. لم تتغير حالة المعلن.');}}};
}
export function adminReports(storage,records){
 const propertyIds={'R-284':1,'R-281':3,'R-276':2,'R-285':10};
 const seeds=adminDemo.reports.map(row=>({...row,property_id:propertyIds[row.id],category:Object.keys(REPORT_CATEGORIES).find(key=>REPORT_CATEGORIES[key]===row.reason)||'other',description:({'R-284':'مثال لمراجعة اختلاف السعر وبعض الصور عن وصف الإعلان.','R-281':'مثال لمراجعة احتمال تكرار الإعلان لنفس العقار.','R-276':'تمت مراجعة بيانات الإعلان التوضيحي وتسجيل نتيجة الحل.','R-285':'ملاحظة على ترتيب الصور؛ أغلق المثال بعد المراجعة دون إجراء.'})[row.id]||'',email:({'R-284':'elmalky@gmail.com','R-281':'elmalky@gmail.com','R-276':'elmalky-broker@gmail.com','R-285':'elmalky-owner@gmail.com'})[row.id]||null}));
 return createReportsStore(storage,records,seeds);
}
