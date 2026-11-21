import {adminDemo} from '../../data/admin-demo.js';
import {verificationDecisions} from '../shared/verification-state.js';
import {adminReports} from './trust-store.js';
import {createModerationStore} from '../shared/moderation-store.js';
import {ADMIN_INBOX,createNotificationStore,commitNotificationWrites,requestNotification} from '../shared/notification-store.js';
// Reconcile pre-existing demo requests once. No fictional approval/delivery events are seeded.
export function bootstrapAdminNotifications(storage,records){
 const existing=createNotificationStore(storage,ADMIN_INBOX).list(),events=[];
 const add=(event,key)=>{if(!existing.some(x=>x.type===event.type&&JSON.stringify(x.target)===JSON.stringify(event.target)))events.push({...event,once:key});};
 const decisions=verificationDecisions(storage,true);
 if(adminDemo.verification.some(x=>x.name==='كريم السيد'&&x.status==='قيد المراجعة')&&!decisions['elmalky-broker@gmail.com'])add({recipient:ADMIN_INBOX,type:'verification_requested',title:'طلب توثيق للمراجعة',text:'طلب التوثيق التجريبي الخاص بالسمسار في انتظار المراجعة.',target:{view:'verify',email:'elmalky-broker@gmail.com'}},'seed:verify:elmalky-broker@gmail.com');
 for(const row of adminReports(storage,records||{}).list().filter(x=>x.status==='جديد'))add({recipient:ADMIN_INBOX,type:'report_submitted',title:'بلاغ عقاري للمراجعة',text:'بلاغ تجريبي جديد في انتظار المراجعة.',target:{view:'report',id:row.id}},'backfill:report:'+row.id);
 if(records){const moderation=createModerationStore(storage,records);for(const kind of ['listing','edit'])for(const item of moderation.queue(kind))add(requestNotification(item.role,item.account.id,item.property.id,kind,(item.pending?.property||item.property).title),'backfill:'+kind+':'+item.key);}
 if(events.length)commitNotificationWrites(storage,[],events);
}
