import {recordMobileDemo,CONTACT_KEY} from '../shared/verification-state.js';
import {loadPropertyRecords} from '../shared/property-data.js';
import {demoStore,safeReturn} from '../shared/demo-auth.js';
import {frontendRoot,frontendURL,resolveIcons} from '../core/path-resolver.js';
import {publicProperties} from '../shared/property-cards.js';
import {afterLogin} from '../shared/navigation.js';
const params=new URLSearchParams(location.search),store=()=>demoStore();
let pending=null;
function mode(name){for(const value of ['login','register','verify'])document.querySelector(`#${value}-panel`).hidden=value!==name;
  if(name!=='verify'){params.set('mode',name);const url=new URL(location.href);url.searchParams.set('mode',name);history.replaceState({},'',url);}
  document.querySelector('#auth-error').textContent='';document.querySelector(`#${name}-panel h1`).setAttribute('tabindex','-1');document.querySelector(`#${name}-panel h1`).focus();}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>mode(button.dataset.mode)));
function validate(form){
  let first=null;
  for(const input of form.querySelectorAll('input')){
    input.setCustomValidity('');
    if(input.name==='name'&&input.value.trim().length<2)input.setCustomValidity('أدخل الاسم بالكامل.');
    if(input.name==='phone'&&!/^(01[0125]\d{8}|\+?201[0125]\d{8})$/.test(input.value.replace(/\s/g,'')))input.setCustomValidity('أدخل رقم موبايل مصري صحيحًا.');
    if(input.name==='confirm'&&input.value!==form.elements.password.value)input.setCustomValidity('كلمتا المرور غير متطابقتين.');
    const valid=input.checkValidity();input.setAttribute('aria-invalid',String(!valid));
    const error=form.querySelector(`[data-error="${input.name}"]`);
    const text=input.validity.customError?input.validationMessage:input.validity.valueMissing?'هذا الحقل مطلوب.':input.type==='email'?'أدخل بريدًا إلكترونيًا صحيحًا.':'أدخل 8 أحرف على الأقل.';
    if(error){error.textContent=valid?'':text;error.id=`${form.id}-${input.name}-error`;input.setAttribute('aria-describedby',error.id);}
    if(!valid&&!first)first=input;
  }
  if(first){document.querySelector('#auth-error').textContent='راجع الحقول المحددة قبل المتابعة.';first.focus();return false;}return true;
}
async function finish(){
  const destination=afterLogin(store().current(),params);
  if(!destination)throw new Error('نشر العقارات متاح للمالك والسمسار والمكتب. اختر نوع حساب مناسبًا من إنشاء حساب جديد.');
  const id=Number(params.get('save'));
  if(Number.isSafeInteger(id)&&id>0){
    const records=await loadPropertyRecords();
    if(publicProperties(records).some(p=>p.id===id)&&!store().favorites().includes(id))store().toggle(id);
  }
  location.href=destination;
}
function failure(error){document.querySelector('#auth-error').textContent=error instanceof DOMException?'تعذّر استخدام تخزين الجلسة. اسمح بتخزين بيانات الموقع ثم أعد المحاولة.':error.message;}
document.querySelector('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget;if(!validate(form))return;
  const email=form.elements.email.value.trim(),password=form.elements.password.value;form.elements.password.value='';
  try{store().login(email,password);await finish();}catch(error){failure(error);}
});
document.querySelector('#register-form').addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;if(!validate(form))return;
  pending={name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),role:form.elements.role.value};
  document.querySelector('#verify-phone').textContent=form.elements.phone.value;
  form.elements.password.value='';form.elements.confirm.value='';
  document.querySelectorAll('.a-otp input').forEach(input=>{input.value='';});mode('verify');
});
document.querySelector('#verify-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!pending){mode('register');return;}
  const code=[...document.querySelectorAll('.a-otp input')].map(x=>x.value).join('');
  if(code!=='123456'){document.querySelector('#auth-error').textContent='كود العرض غير صحيح. استخدم 123456.';document.querySelector('.a-otp input').focus();return;}
  try{const beforeAuth=sessionStorage.getItem('waseet-demo-v1'),beforeContact=sessionStorage.getItem(CONTACT_KEY);
    try{store().register(pending);recordMobileDemo(sessionStorage,pending.email);}catch(error){for(const [key,value]of [['waseet-demo-v1',beforeAuth],[CONTACT_KEY,beforeContact]]){if(value===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,value);}throw error;}
    pending=null;await finish();}catch(error){failure(error);}
});
document.querySelector('[data-show-password]').addEventListener('click',event=>{
  const input=document.querySelector('#login-form [name=password]');input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'إظهار كلمة المرور':'إخفاء كلمة المرور';
});
const digits=[...document.querySelectorAll('.a-otp input')];
digits.forEach((input,i)=>{
  input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(-1);if(input.value)digits[i+1]?.focus();});
  input.addEventListener('keydown',event=>{if(event.key==='Backspace'&&!input.value)digits[i-1]?.focus();});
  input.addEventListener('paste',event=>{const code=event.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);if(code){event.preventDefault();[...code].forEach((digit,j)=>{if(digits[i+j])digits[i+j].value=digit;});digits[Math.min(i+code.length,5)].focus();}});
});
document.querySelector('#resend').addEventListener('click',()=>{document.querySelector('#verify-feedback').textContent='كود العرض: 123456. لم يتم إرسال رسالة فعلية.';});
if(params.get('intent')==='publish')document.querySelector('#register-form [name=role][value=owner]').checked=true;
const back=document.querySelector('.a-content > a');if(params.get('return')){back.href=safeReturn(params.get('return'),frontendRoot);back.textContent='‹ العودة إلى الصفحة السابقة';}
resolveIcons();if(params.get('mode')==='register')mode('register');
document.documentElement.dataset.ready='true';
