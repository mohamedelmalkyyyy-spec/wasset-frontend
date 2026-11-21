// Presentation-only projection of existing Figma Admin fixtures; no storage writes.
export function adminSummary(data={}){
  const array=key=>Array.isArray(data[key])?data[key]:[];
  const listings=array('listings').filter(x=>x.status==='قيد المراجعة');
  const verification=array('verification'),reports=array('reports');
  return {listings,verification,reports,users:array('users'),agencies:array('agencies'),counts:{
    listings:listings.length,verification:verification.filter(x=>x.status==='قيد المراجعة').length,
    reports:reports.filter(x=>x.status==='جديد').length,users:array('users').length,agencies:array('agencies').length,
  }};
}
export const ADMIN_PANELS={
  listings:{id:'pending',title:'أحدث الإعلانات المعلقة',limit:3,empty:['لا توجد إعلانات معلقة','لا توجد إعلانات جديدة تحتاج إلى مراجعة.']},
  verification:{id:'verification',title:'طلبات التوثيق',limit:2,empty:['لا توجد طلبات توثيق','لا توجد طلبات جديدة تحتاج إلى مراجعة.']},
  reports:{id:'reports',title:'أحدث البلاغات',limit:2,empty:['لا توجد بلاغات','لم يتم إرسال أي بلاغات جديدة.']},
};
