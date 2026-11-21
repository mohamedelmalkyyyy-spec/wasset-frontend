// Fictional local demonstration catalogue; envelopes are existing UI store state, not ERD additions.
export const DEMO_PASSWORD="Demo@12345";
export const DEMO_ACCOUNTS=[
  {
    "id": "elmalky@gmail.com",
    "email": "elmalky@gmail.com",
    "role": "seeker",
    "name": "محمد المالكي"
  },
  {
    "id": "elmalky-owner@gmail.com",
    "email": "elmalky-owner@gmail.com",
    "role": "owner",
    "name": "محمد أحمد"
  },
  {
    "id": "elmalky-broker@gmail.com",
    "email": "elmalky-broker@gmail.com",
    "role": "broker",
    "name": "كريم السيد"
  },
  {
    "id": "elmalky-agency@gmail.com",
    "email": "elmalky-agency@gmail.com",
    "role": "agency",
    "name": "عقارات السادات"
  },
  {
    "id": "elmalky-agent@gmail.com",
    "email": "elmalky-agent@gmail.com",
    "role": "agent",
    "name": "أحمد سمير"
  },
  {
    "id": "elmalky-admin@gmail.com",
    "email": "elmalky-admin@gmail.com",
    "role": "admin",
    "name": "إدارة وسيط"
  }
];
export const LEGACY_IDENTITIES={"owner@example.test": "elmalky-owner@gmail.com", "broker@example.test": "elmalky-broker@gmail.com", "agency@example.test": "elmalky-agency@gmail.com", "ahmed@alsadat.example": "elmalky-agent@gmail.com", "sara@example.com": "elmalky@gmail.com"};
export const PUBLISHER_IDS={"owner": [1, 3, 6, 7, 8, 9], "broker": [4, 10, 11, 12, 13, 14], "agency": [2, 5, 15, 16, 17, 18]};
export const SEED_PROPERTIES={
  "owner": [
    {
      "id": 1,
      "user_id": 1,
      "property_type_id": "apartment",
      "area_id": "distinguished",
      "title": "شقة للبيع في الحي المتميز",
      "description": "شقة للبيع في الحي المتميز، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 2150000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 150,
      "bedrooms": 3,
      "bathrooms": 2,
      "created_at": "2026-11-19T09:00:00+02:00",
      "finishing_type": "سوبر لوكس",
      "floor": 2
    },
    {
      "id": 3,
      "user_id": 1,
      "property_type_id": "land",
      "area_id": "third",
      "title": "قطعة أرض للبيع في مدينة السادات",
      "description": "قطعة أرض للبيع في مدينة السادات، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 1800000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 300,
      "bedrooms": null,
      "bathrooms": null,
      "created_at": "2026-11-17T09:00:00+02:00",
      "finishing_type": null,
      "floor": 0
    },
    {
      "id": 6,
      "user_id": 1,
      "property_type_id": "apartment",
      "area_id": "first",
      "title": "شقة حديثة بالقرب من الخدمات",
      "description": "شقة حديثة بالقرب من الخدمات، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 6500,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 120,
      "bedrooms": 2,
      "bathrooms": 2,
      "created_at": "2026-11-14T09:00:00+02:00",
      "finishing_type": "بدون تشطيب",
      "floor": 2
    },
    {
      "id": 7,
      "user_id": 1,
      "property_type_id": "apartment",
      "area_id": "second",
      "title": "شقة عائلية للبيع بالمنطقة الثانية",
      "description": "شقة عائلية للبيع بالمنطقة الثانية، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 1850000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 145,
      "bedrooms": 3,
      "bathrooms": 2,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-07T09:00:00+02:00"
    },
    {
      "id": 8,
      "user_id": 1,
      "property_type_id": "office",
      "area_id": "first",
      "title": "مكتب إداري للإيجار بالمنطقة الأولى",
      "description": "مكتب إداري للإيجار بالمنطقة الأولى، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 9000,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 80,
      "bedrooms": null,
      "bathrooms": 1,
      "floor": null,
      "finishing_type": "لوكس",
      "created_at": "2026-11-08T09:00:00+02:00"
    },
    {
      "id": 9,
      "user_id": 1,
      "property_type_id": "apartment",
      "area_id": "third",
      "title": "شقة للبيع بالمنطقة الثالثة",
      "description": "شقة للبيع بالمنطقة الثالثة، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 1650000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 130,
      "bedrooms": 3,
      "bathrooms": 1,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-09T09:00:00+02:00"
    }
  ],
  "broker": [
    {
      "id": 4,
      "user_id": 3,
      "property_type_id": "office",
      "area_id": "second",
      "title": "مكتب إداري للإيجار في مدينة السادات",
      "description": "مكتب إداري للإيجار في مدينة السادات، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 8500,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 90,
      "bedrooms": null,
      "bathrooms": 1,
      "created_at": "2026-11-16T09:00:00+02:00",
      "finishing_type": "نصف تشطيب",
      "floor": 0
    },
    {
      "id": 10,
      "user_id": 3,
      "property_type_id": "apartment",
      "area_id": "distinguished",
      "title": "شقة للإيجار في الحي المتميز",
      "description": "شقة للإيجار في الحي المتميز، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 11000,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 160,
      "bedrooms": 3,
      "bathrooms": 2,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-10T09:00:00+02:00"
    },
    {
      "id": 11,
      "user_id": 3,
      "property_type_id": "shop",
      "area_id": "second",
      "title": "محل تجاري للبيع بالمنطقة الثانية",
      "description": "محل تجاري للبيع بالمنطقة الثانية، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 2400000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 70,
      "bedrooms": null,
      "bathrooms": 1,
      "floor": null,
      "finishing_type": "لوكس",
      "created_at": "2026-11-11T09:00:00+02:00"
    },
    {
      "id": 12,
      "user_id": 3,
      "property_type_id": "land",
      "area_id": "third",
      "title": "أرض سكنية للبيع بالمنطقة الثالثة",
      "description": "أرض سكنية للبيع بالمنطقة الثالثة، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 2200000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 350,
      "bedrooms": null,
      "bathrooms": null,
      "floor": null,
      "finishing_type": null,
      "created_at": "2026-11-12T09:00:00+02:00"
    },
    {
      "id": 13,
      "user_id": 3,
      "property_type_id": "office",
      "area_id": "second",
      "title": "مكتب إداري للبيع بالمنطقة الثانية",
      "description": "مكتب إداري للبيع بالمنطقة الثانية، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 1950000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 105,
      "bedrooms": null,
      "bathrooms": 1,
      "floor": null,
      "finishing_type": "لوكس",
      "created_at": "2026-11-13T09:00:00+02:00"
    },
    {
      "id": 14,
      "user_id": 3,
      "property_type_id": "apartment",
      "area_id": "first",
      "title": "شقة للبيع بالمنطقة الأولى",
      "description": "شقة للبيع بالمنطقة الأولى، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 1750000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 140,
      "bedrooms": 3,
      "bathrooms": 2,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-14T09:00:00+02:00"
    }
  ],
  "agency": [
    {
      "id": 2,
      "user_id": 2,
      "property_type_id": "shop",
      "area_id": "first",
      "title": "محل تجاري للإيجار بمدينة السادات",
      "description": "محل تجاري للإيجار بمدينة السادات، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 12000,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 65,
      "bedrooms": null,
      "bathrooms": null,
      "created_at": "2026-11-18T09:00:00+02:00",
      "finishing_type": "لوكس",
      "floor": 0
    },
    {
      "id": 5,
      "user_id": 2,
      "property_type_id": "villa",
      "area_id": "distinguished",
      "title": "فيلا مستقلة بحديقة خاصة",
      "description": "فيلا مستقلة بحديقة خاصة، بمساحة مناسبة وتوزيع عملي بالقرب من الخدمات داخل مدينة السادات. البيانات والأسعار والصور أمثلة توضيحية للعرض وليست عروضاً عقارية حقيقية.",
      "price": 4750000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 320,
      "bedrooms": 5,
      "bathrooms": 4,
      "created_at": "2026-11-15T09:00:00+02:00",
      "finishing_type": "سوبر لوكس",
      "floor": 0
    },
    {
      "id": 15,
      "user_id": 2,
      "property_type_id": "apartment",
      "area_id": "first",
      "title": "شقة للإيجار بالقرب من خدمات المنطقة الأولى",
      "description": "شقة للإيجار بالقرب من خدمات المنطقة الأولى، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 7800,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 125,
      "bedrooms": 2,
      "bathrooms": 2,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-15T09:00:00+02:00"
    },
    {
      "id": 16,
      "user_id": 2,
      "property_type_id": "shop",
      "area_id": "distinguished",
      "title": "محل للإيجار في الحي المتميز",
      "description": "محل للإيجار في الحي المتميز، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 15000,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 90,
      "bedrooms": null,
      "bathrooms": 1,
      "floor": null,
      "finishing_type": "لوكس",
      "created_at": "2026-11-16T09:00:00+02:00"
    },
    {
      "id": 17,
      "user_id": 2,
      "property_type_id": "land",
      "area_id": "third",
      "title": "أرض للبيع مناسبة لبناء منزل عائلي",
      "description": "أرض للبيع مناسبة لبناء منزل عائلي، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 2650000,
      "listing_type": "sale",
      "status": "published",
      "rent_period": null,
      "size_m2": 400,
      "bedrooms": null,
      "bathrooms": null,
      "floor": null,
      "finishing_type": null,
      "created_at": "2026-11-17T09:00:00+02:00"
    },
    {
      "id": 18,
      "user_id": 2,
      "property_type_id": "apartment",
      "area_id": "second",
      "title": "شقة للإيجار بالمنطقة الثانية",
      "description": "شقة للإيجار بالمنطقة الثانية، بتوزيع عملي ومساحة مناسبة للاستخدام المطلوب، بالقرب من الخدمات في مدينة السادات. يمكن الاطلاع على الصور التوضيحية ومراجعة المواصفات. مثال تجريبي وليس إعلاناً حقيقياً.",
      "price": 7200,
      "listing_type": "rent",
      "status": "published",
      "rent_period": "month",
      "size_m2": 115,
      "bedrooms": 2,
      "bathrooms": 1,
      "floor": 2,
      "finishing_type": "لوكس",
      "created_at": "2026-11-18T09:00:00+02:00"
    }
  ]
};
export const SEED_IMAGES={
  "1": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1729086046027-09979ade13fd?auto=format&fit=crop&w=1000&q=85"
  ],
  "2": [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
  ],
  "3": [
    "https://images.unsplash.com/photo-1780303009859-c08cdf9c4f4c?auto=format&fit=crop&w=1200&q=85"
  ],
  "4": [
    "https://images.unsplash.com/photo-1689043528099-2ba014dd7c64?auto=format&fit=crop&w=1200&q=85"
  ],
  "5": [
    "https://images.unsplash.com/photo-1568899380839-bba35e99fbe3?auto=format&fit=crop&w=1200&q=85"
  ],
  "6": [
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "7": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "8": [
    "https://images.unsplash.com/photo-1689043528099-2ba014dd7c64?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "9": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "10": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "11": [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "12": [
    "https://images.unsplash.com/photo-1780303009859-c08cdf9c4f4c?auto=format&fit=crop&w=1200&q=85"
  ],
  "13": [
    "https://images.unsplash.com/photo-1689043528099-2ba014dd7c64?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "14": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "15": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "16": [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ],
  "17": [
    "https://images.unsplash.com/photo-1780303009859-c08cdf9c4f4c?auto=format&fit=crop&w=1200&q=85"
  ],
  "18": [
    "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1000&q=85"
  ]
};
