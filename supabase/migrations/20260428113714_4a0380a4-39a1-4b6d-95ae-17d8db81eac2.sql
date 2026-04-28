ALTER TABLE public.audio_tours
  ADD COLUMN IF NOT EXISTS stops jsonb DEFAULT '[]'::jsonb;

-- Rosetta
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Qaitbay Citadel of Rosetta","label_ar":"قلعة قايتباي رشيد","lat":31.4047,"lng":30.4172},
  {"label_en":"Rashid National Museum","label_ar":"متحف رشيد القومي","lat":31.4060,"lng":30.4136},
  {"label_en":"Beit Arab Killi","label_ar":"بيت عرب كلي","lat":31.4067,"lng":30.4159},
  {"label_en":"Beit Amasyali","label_ar":"بيت أماصيلي","lat":31.4072,"lng":30.4169},
  {"label_en":"Zaghloul Mosque","label_ar":"مسجد زغلول","lat":31.4079,"lng":30.4175},
  {"label_en":"Ottoman Bazaar","label_ar":"البازار العثماني","lat":31.4083,"lng":30.4181},
  {"label_en":"Nile-mouth Corniche","label_ar":"كورنيش مصب النيل","lat":31.4093,"lng":30.4196},
  {"label_en":"Palm Grove Walk","label_ar":"ممشى النخيل","lat":31.4101,"lng":30.4205}
]'::jsonb WHERE id = 'cc8cf247-8776-4f25-b79c-ab642a6f93ae';

-- Ismailia
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Ismailia Museum","label_ar":"متحف الإسماعيلية","lat":30.5965,"lng":32.2715},
  {"label_en":"Mallaha Garden","label_ar":"حديقة الملاحة","lat":30.5984,"lng":32.2742},
  {"label_en":"De Lesseps House","label_ar":"بيت ديليسبس","lat":30.5942,"lng":32.2693},
  {"label_en":"Suez Canal Corniche","label_ar":"كورنيش قناة السويس","lat":30.5905,"lng":32.2720},
  {"label_en":"Lake Timsah Boardwalk","label_ar":"ممشى بحيرة التمساح","lat":30.5841,"lng":32.2782},
  {"label_en":"Old French Quarter","label_ar":"الحي الفرنسي القديم","lat":30.5970,"lng":32.2705}
]'::jsonb WHERE id = 'cc03f78d-80cd-4f80-9760-40039b24181c';

-- Lake Manzala (10 birding stops)
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Matariya Pier","label_ar":"رصيف المطرية","lat":31.1834,"lng":32.0337},
  {"label_en":"Reed Channel North","label_ar":"قناة البوص الشمالية","lat":31.2050,"lng":32.0500},
  {"label_en":"Flamingo Bay","label_ar":"خليج الفلامنغو","lat":31.2300,"lng":32.0700},
  {"label_en":"Cormorant Island","label_ar":"جزيرة الغاق","lat":31.2550,"lng":32.0900},
  {"label_en":"Pelican Roost","label_ar":"محط البجع","lat":31.2800,"lng":32.1100},
  {"label_en":"Heron Wetlands","label_ar":"أهوار البلشون","lat":31.3050,"lng":32.1300},
  {"label_en":"Tern Sandbar","label_ar":"شطيرة الخرشنة","lat":31.3300,"lng":32.1500},
  {"label_en":"Egret Lagoon","label_ar":"بحيرة أبو قردان","lat":31.3550,"lng":32.1700},
  {"label_en":"Salt Marsh Lookout","label_ar":"مرصد المستنقعات المالحة","lat":31.3800,"lng":32.1900},
  {"label_en":"Manzala North Outflow","label_ar":"مصب المنزلة الشمالي","lat":31.4050,"lng":32.2100}
]'::jsonb WHERE id = '6979cb6b-5d60-46ed-b204-4649ed139019';

-- Luxor temples
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Luxor Temple","label_ar":"معبد الأقصر","lat":25.6997,"lng":32.6391},
  {"label_en":"Avenue of Sphinxes","label_ar":"طريق الكباش","lat":25.7050,"lng":32.6398},
  {"label_en":"Karnak Temple","label_ar":"معبد الكرنك","lat":25.7188,"lng":32.6573},
  {"label_en":"Mummification Museum","label_ar":"متحف التحنيط","lat":25.7016,"lng":32.6418},
  {"label_en":"Luxor Museum","label_ar":"متحف الأقصر","lat":25.7080,"lng":32.6450},
  {"label_en":"Nile Corniche","label_ar":"كورنيش النيل","lat":25.6970,"lng":32.6378},
  {"label_en":"Felucca Pier","label_ar":"رصيف الفلوكة","lat":25.6960,"lng":32.6370}
]'::jsonb WHERE id = '1cf5be20-f157-444d-b67c-574a050e3142';

-- Siwa Oracle
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Shali Fortress","label_ar":"قلعة شالي","lat":29.2032,"lng":25.5197},
  {"label_en":"Temple of the Oracle (Aghurmi)","label_ar":"معبد الوحي (أغورمي)","lat":29.2044,"lng":25.5478},
  {"label_en":"Temple of Umm Ubayda","label_ar":"معبد أم عبيدة","lat":29.1989,"lng":25.5453},
  {"label_en":"Cleopatra Spring","label_ar":"عين كليوباترا","lat":29.2003,"lng":25.5494},
  {"label_en":"Mountain of the Dead","label_ar":"جبل الموتى","lat":29.2128,"lng":25.5161}
]'::jsonb WHERE id = '649a534d-019e-470b-b499-a396062498ef';

-- Damietta furniture
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Damietta Furniture City","label_ar":"مدينة دمياط للأثاث","lat":31.4163,"lng":31.8133},
  {"label_en":"Master Carpenter Workshop","label_ar":"ورشة معلم النجارة","lat":31.4180,"lng":31.8155},
  {"label_en":"Inlay & Marquetry Atelier","label_ar":"ورشة التطعيم","lat":31.4195,"lng":31.8170},
  {"label_en":"Wood Souq","label_ar":"سوق الأخشاب","lat":31.4210,"lng":31.8190},
  {"label_en":"Upholstery Quarter","label_ar":"حي التنجيد","lat":31.4225,"lng":31.8210},
  {"label_en":"Damietta Old Port","label_ar":"ميناء دمياط القديم","lat":31.4250,"lng":31.8240},
  {"label_en":"Ras El Bar Boardwalk","label_ar":"كورنيش رأس البر","lat":31.5333,"lng":31.8333}
]'::jsonb WHERE id = 'a4a803db-a0b1-4652-b158-f11220aca44e';

-- Aswan Nubian
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Nubian Museum","label_ar":"المتحف النوبي","lat":24.0810,"lng":32.8908},
  {"label_en":"Aswan Souq","label_ar":"سوق أسوان","lat":24.0894,"lng":32.8997},
  {"label_en":"Felucca Dock","label_ar":"رصيف الفلوكة","lat":24.0900,"lng":32.8889},
  {"label_en":"Elephantine Island","label_ar":"جزيرة إلفنتين","lat":24.0905,"lng":32.8870},
  {"label_en":"Gharb Soheil Village","label_ar":"قرية غرب سهيل","lat":24.0822,"lng":32.8744},
  {"label_en":"Kitchener Botanical Island","label_ar":"جزيرة النباتات","lat":24.0928,"lng":32.8839},
  {"label_en":"Old Cataract Viewpoint","label_ar":"إطلالة أولد كاتاراكت","lat":24.0858,"lng":32.8856},
  {"label_en":"High Dam","label_ar":"السد العالي","lat":23.9706,"lng":32.8772}
]'::jsonb WHERE id = 'f8a9c976-dc1b-483f-9407-8e591a81e54c';

-- Port Said
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Suez Canal Authority Building","label_ar":"مبنى هيئة قناة السويس","lat":31.2620,"lng":32.3019},
  {"label_en":"Port Said Lighthouse","label_ar":"منارة بورسعيد","lat":31.2654,"lng":32.3060},
  {"label_en":"Military Museum","label_ar":"المتحف الحربي","lat":31.2580,"lng":32.2980},
  {"label_en":"Port Said National Museum","label_ar":"متحف بورسعيد القومي","lat":31.2612,"lng":32.3035},
  {"label_en":"Old Customs House","label_ar":"مبنى الجمرك القديم","lat":31.2602,"lng":32.3010},
  {"label_en":"Italian Quarter","label_ar":"الحي الإيطالي","lat":31.2592,"lng":32.2998},
  {"label_en":"Mediterranean Corniche","label_ar":"كورنيش المتوسط","lat":31.2675,"lng":32.3080},
  {"label_en":"Ferry to Port Fouad","label_ar":"معدية بورفؤاد","lat":31.2618,"lng":32.3105}
]'::jsonb WHERE id = 'e7423886-793c-4dec-8bbb-e1356a40b789';

-- Dahab Blue Hole
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Dahab Lighthouse","label_ar":"منارة دهب","lat":28.5091,"lng":34.5136},
  {"label_en":"Masbat Bridge","label_ar":"كوبري المسبط","lat":28.5103,"lng":34.5152},
  {"label_en":"Eel Garden","label_ar":"حديقة الثعابين","lat":28.5180,"lng":34.5215},
  {"label_en":"Canyon Dive Site","label_ar":"موقع الكانيون","lat":28.5450,"lng":34.5378},
  {"label_en":"Blue Hole","label_ar":"الفجوة الزرقاء","lat":28.5722,"lng":34.5375}
]'::jsonb WHERE id = '395d543e-2d53-4b88-8294-058392ff14b3';

-- Fayoum whales
UPDATE public.audio_tours SET stops = '[
  {"label_en":"Fayoum City Center","label_ar":"وسط مدينة الفيوم","lat":29.3084,"lng":30.8428},
  {"label_en":"Tunis Pottery Village","label_ar":"قرية تونس للفخار","lat":29.4667,"lng":30.5833},
  {"label_en":"Lake Qarun Shore","label_ar":"شاطئ بحيرة قارون","lat":29.4833,"lng":30.6500},
  {"label_en":"Wadi El Rayan Falls","label_ar":"شلالات وادي الريان","lat":29.2167,"lng":30.4000},
  {"label_en":"Magic Lake","label_ar":"البحيرة السحرية","lat":29.1822,"lng":30.4097},
  {"label_en":"Wadi El Hitan Visitor Center","label_ar":"مركز زوار وادي الحيتان","lat":29.2683,"lng":30.0436},
  {"label_en":"Whale Skeleton Trail","label_ar":"درب هياكل الحيتان","lat":29.2700,"lng":30.0450}
]'::jsonb WHERE id = '9d7c4599-7c27-4acb-ab18-b4a9a6196f6d';