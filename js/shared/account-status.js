// Session projection of users.is_active. No ownership, team or permission records are changed.
export const ACCOUNT_STATUS_KEY='waseet-account-status-v1';
const emailOK=value=>typeof value==='string'&&value.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function readAccountStatuses(storage,strict=false){
  try{const text=storage.getItem(ACCOUNT_STATUS_KEY);if(text?.length>100000)throw Error();const raw=JSON.parse(text||'{}');if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error();
    const result={};for(const [email,value]of Object.entries(raw)){if(!emailOK(email)||typeof value!=='boolean')throw Error();result[email.toLowerCase()]=value;}return result;
  }catch{if(strict)throw Error('تعذّر قراءة حالات الحسابات المحفوظة. راجع تخزين الجلسة ثم أعد المحاولة.');return {};}
}
export function accountActive(storage,email,baseline=true){return readAccountStatuses(storage)[String(email).toLowerCase()]??baseline;}
export function requireActiveAccount(storage,email){if(!accountActive(storage,email))throw Error('هذا الحساب موقوف إداريًا. راجع إدارة وسيط.');}
