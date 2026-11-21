// Fictional administrative presentation fixtures; actual counts and relationships come from shared stores.
export const adminDemo={
  "listings": [],
  "users": [
    {
      "name": "محمد أحمد",
      "email": "elmalky-owner@gmail.com",
      "phone": "",
      "type": "مالك عقار",
      "status": "نشط",
      "verified": "موثق",
      "date": "18 نوفمبر 2026"
    },
    {
      "name": "عقارات السادات",
      "email": "elmalky-agency@gmail.com",
      "phone": "",
      "type": "مكتب عقاري",
      "status": "نشط",
      "verified": "غير موثق",
      "date": "18 نوفمبر 2026"
    },
    {
      "name": "كريم السيد",
      "email": "elmalky-broker@gmail.com",
      "phone": "",
      "type": "سمسار عقاري مستقل",
      "status": "نشط",
      "verified": "غير موثق",
      "date": "18 نوفمبر 2026"
    },
    {
      "name": "محمد المالكي",
      "email": "elmalky@gmail.com",
      "phone": "",
      "type": "باحث عن عقار",
      "status": "نشط",
      "verified": "موثق",
      "date": "18 نوفمبر 2026"
    },
    {
      "name": "أحمد سمير",
      "email": "elmalky-agent@gmail.com",
      "phone": "",
      "type": "موظف مكتب",
      "status": "نشط",
      "verified": "غير موثق",
      "date": "18 نوفمبر 2026"
    },
    {
      "name": "إدارة وسيط",
      "email": "elmalky-admin@gmail.com",
      "phone": "",
      "type": "مشرف",
      "status": "نشط",
      "verified": "غير موثق",
      "date": "18 نوفمبر 2026"
    }
  ],
  "agencies": [
    {
      "name": "عقارات السادات",
      "owner": "مدير المكتب التجريبي",
      "phone": "",
      "properties": 9,
      "employees": 3,
      "verified": "قيد المراجعة",
      "status": "نشط"
    }
  ],
  "verification": [
    {
      "name": "كريم السيد",
      "type": "سمسار عقاري مستقل",
      "date": "2026-11-19T10:30:00+02:00",
      "status": "قيد المراجعة",
      "docs": [
        "بطاقة الرقم القومي — بيانات توضيحية",
        "إثبات محل الإقامة — بيانات توضيحية"
      ]
    },
    {
      "name": "عقارات السادات",
      "type": "مكتب عقاري",
      "date": "2026-11-19T11:00:00+02:00",
      "status": "قيد المراجعة",
      "docs": [
        "السجل التجاري — بيانات توضيحية",
        "البطاقة الضريبية — بيانات توضيحية"
      ]
    },
    {
      "name": "محمد أحمد",
      "type": "مالك عقار",
      "date": "2026-11-18T09:00:00+02:00",
      "status": "موثق",
      "docs": [
        "بطاقة الرقم القومي — بيانات توضيحية"
      ]
    }
  ],
  "reports": [
    {
      "id": "R-284",
      "property": "شقة للبيع في الحي المتميز",
      "reporter": "محمد المالكي",
      "reason": "معلومات غير صحيحة",
      "date": "2026-11-19T11:20:00+02:00",
      "status": "جديد"
    },
    {
      "id": "R-281",
      "property": "قطعة أرض للبيع في مدينة السادات",
      "reporter": "محمد المالكي",
      "reason": "إعلان مكرر",
      "date": "2026-11-19T11:20:00+02:00",
      "status": "قيد المراجعة"
    },
    {
      "id": "R-276",
      "property": "محل تجاري للإيجار بمدينة السادات",
      "reporter": "كريم السيد",
      "reason": "إعلان وهمي",
      "date": "2026-11-19T11:20:00+02:00",
      "status": "تم الحل"
    },
    {
      "id": "R-285",
      "property": "شقة للإيجار في الحي المتميز",
      "reporter": "محمد أحمد",
      "reason": "أخرى",
      "date": "2026-11-19T11:20:00+02:00",
      "status": "مغلق"
    }
  ]
};
