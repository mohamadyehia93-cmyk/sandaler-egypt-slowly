-- Add itinerary column (day-by-day plan) to trips
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS itinerary_en jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS itinerary_ar jsonb DEFAULT '[]'::jsonb;

-- Seed itineraries for the 4 existing trips
UPDATE public.trips SET
  itinerary_en = '[
    {"day":1,"title":"Cairo → Ismailia → Cairo","stops":[
      {"time":"07:00","title":"Pickup from Cairo","desc":"Meet your guide and depart east toward the Suez Canal."},
      {"time":"09:30","title":"Ismailia Museum","desc":"Explore Pharaonic, Greco-Roman and Canal-era artifacts."},
      {"time":"11:00","title":"Suez Canal viewpoint","desc":"Watch cargo ships glide past from the corniche."},
      {"time":"13:00","title":"Lunch at a local fish house","desc":"Fresh catch from Lake Timsah."},
      {"time":"15:00","title":"Stroll Mallaha Garden & old villas","desc":"Walk the leafy French Quarter."},
      {"time":"17:30","title":"Return to Cairo","desc":"Arrive back around 20:00."}
    ]}
  ]'::jsonb,
  itinerary_ar = '[
    {"day":1,"title":"القاهرة ← الإسماعيلية ← القاهرة","stops":[
      {"time":"07:00","title":"الانطلاق من القاهرة","desc":"اللقاء مع المرشد والتوجه شرقًا إلى قناة السويس."},
      {"time":"09:30","title":"متحف الإسماعيلية","desc":"قطع فرعونية ويونانية رومانية ومن حقبة القناة."},
      {"time":"11:00","title":"إطلالة قناة السويس","desc":"مشاهدة سفن الشحن من الكورنيش."},
      {"time":"13:00","title":"غداء سمك محلي","desc":"صيد طازج من بحيرة التمساح."},
      {"time":"15:00","title":"حديقة الملاحة والفلل القديمة","desc":"تجول في الحي الفرنسي."},
      {"time":"17:30","title":"العودة إلى القاهرة","desc":"الوصول حوالي الساعة 20:00."}
    ]}
  ]'::jsonb
WHERE id = 'd609c3b8-286a-4b5f-9f5a-085a371f5a5c';

UPDATE public.trips SET
  itinerary_en = '[
    {"day":1,"title":"Alexandria — arrival & seafood","stops":[
      {"time":"10:00","title":"Meet at Alexandria","desc":"Welcome briefing and coffee at a corniche café."},
      {"time":"12:00","title":"Anfoushi fish market tour","desc":"Pick the day''s catch with a local chef."},
      {"time":"14:00","title":"Lunch: grilled sea bass & sayadeya","desc":"Cooked in a family-run kitchen."},
      {"time":"17:00","title":"Sunset at Qaitbay","desc":"Walk the citadel breakwater."}
    ]},
    {"day":2,"title":"Edku — lake fishermen","stops":[
      {"time":"08:00","title":"Drive to Edku","desc":"~1.5 hrs along the coast."},
      {"time":"10:00","title":"Sail with Lake Edku fishermen","desc":"Learn the felucca-net technique."},
      {"time":"13:00","title":"Mullet feast on the lake shore","desc":"Salt-baked grey mullet, the village specialty."},
      {"time":"16:00","title":"Bird-watching wetlands","desc":"Flamingos & herons in season."}
    ]},
    {"day":3,"title":"Rosetta (Rashid) — the Nile mouth","stops":[
      {"time":"09:00","title":"Ottoman houses tour","desc":"Visit Beit Arab Killi and Beit Amasyali."},
      {"time":"12:00","title":"Rashid fish auction","desc":"Watch the morning bidding."},
      {"time":"14:00","title":"Farewell lunch at the Nile mouth","desc":"Where the river meets the Mediterranean."},
      {"time":"17:00","title":"Drop-off in Alexandria","desc":"Tour ends."}
    ]}
  ]'::jsonb,
  itinerary_ar = '[
    {"day":1,"title":"الإسكندرية — الوصول والمأكولات البحرية","stops":[
      {"time":"10:00","title":"اللقاء في الإسكندرية","desc":"ترحيب وقهوة على الكورنيش."},
      {"time":"12:00","title":"جولة سوق سمك الأنفوشي","desc":"اختيار الصيد مع طاهٍ محلي."},
      {"time":"14:00","title":"غداء: قاروص مشوي وصيادية","desc":"في مطبخ عائلي."},
      {"time":"17:00","title":"غروب قايتباي","desc":"المشي على حاجز الأمواج."}
    ]},
    {"day":2,"title":"إدكو — صيادو البحيرة","stops":[
      {"time":"08:00","title":"التوجه إلى إدكو","desc":"حوالي ساعة ونصف على الساحل."},
      {"time":"10:00","title":"الإبحار مع صيادي بحيرة إدكو","desc":"تعلّم تقنية الشباك."},
      {"time":"13:00","title":"وليمة بوري على شاطئ البحيرة","desc":"بوري مملح بطريقة القرية."},
      {"time":"16:00","title":"مراقبة الطيور في الأهوار","desc":"فلامنغو ومالك الحزين."}
    ]},
    {"day":3,"title":"رشيد — مصب النيل","stops":[
      {"time":"09:00","title":"جولة البيوت العثمانية","desc":"بيت عرب كلي وبيت أماصيلي."},
      {"time":"12:00","title":"مزاد سمك رشيد","desc":"المشاركة في المزاد الصباحي."},
      {"time":"14:00","title":"غداء وداع عند مصب النيل","desc":"حيث يلتقي النيل بالمتوسط."},
      {"time":"17:00","title":"العودة إلى الإسكندرية","desc":"نهاية الرحلة."}
    ]}
  ]'::jsonb
WHERE id = '7d5ab78a-baeb-4abf-bffb-743b4229bfed';

UPDATE public.trips SET
  itinerary_en = '[
    {"day":1,"title":"Aswan & Nubian villages","stops":[
      {"time":"09:00","title":"Felucca to Gharb Soheil","desc":"Sail across the Nile to the colorful Nubian village."},
      {"time":"11:00","title":"Welcome at a Nubian home","desc":"Karkadeh tea and henna by the host family."},
      {"time":"13:00","title":"Traditional lunch","desc":"Tagine of fish from the Nile."},
      {"time":"16:00","title":"Nubian language workshop","desc":"Learn greetings and a folk song."},
      {"time":"19:00","title":"Sunset drumming circle","desc":"Music and stories on the rooftop."}
    ]},
    {"day":2,"title":"Heritage & farewell","stops":[
      {"time":"09:00","title":"Nubian Museum","desc":"Curated history of the displaced villages."},
      {"time":"12:00","title":"Souq Aswan","desc":"Spices, baskets, hand-woven textiles."},
      {"time":"14:00","title":"Farewell lunch on the Nile","desc":"Closing reflections with the host family."}
    ]}
  ]'::jsonb,
  itinerary_ar = '[
    {"day":1,"title":"أسوان والقرى النوبية","stops":[
      {"time":"09:00","title":"فلوكة إلى غرب سهيل","desc":"الإبحار عبر النيل إلى القرية النوبية الملونة."},
      {"time":"11:00","title":"الترحيب في بيت نوبي","desc":"شاي كركديه وحناء مع الأسرة المضيفة."},
      {"time":"13:00","title":"غداء تقليدي","desc":"طاجن سمك نيلي."},
      {"time":"16:00","title":"ورشة اللغة النوبية","desc":"تعلم التحيات وأغنية شعبية."},
      {"time":"19:00","title":"حلقة طبول عند الغروب","desc":"موسيقى وحكايات على السطح."}
    ]},
    {"day":2,"title":"التراث والوداع","stops":[
      {"time":"09:00","title":"المتحف النوبي","desc":"تاريخ القرى المهجّرة."},
      {"time":"12:00","title":"سوق أسوان","desc":"بهارات وسلال ومنسوجات يدوية."},
      {"time":"14:00","title":"غداء وداع على النيل","desc":"تأملات ختامية مع الأسرة المضيفة."}
    ]}
  ]'::jsonb
WHERE id = 'ac7ada0b-b2a0-4dad-858b-4bb184b91176';

UPDATE public.trips SET
  itinerary_en = '[
    {"day":1,"title":"Cairo → Siwa","stops":[
      {"time":"06:00","title":"Depart Cairo","desc":"Long drive through the Western Desert (~10 hrs)."},
      {"time":"13:00","title":"Lunch stop in Marsa Matrouh","desc":"Mediterranean break."},
      {"time":"19:00","title":"Arrive Siwa, eco-lodge check-in","desc":"Mud-brick lodge near Shali fortress."}
    ]},
    {"day":2,"title":"Springs & salt lakes","stops":[
      {"time":"09:00","title":"Cleopatra Spring swim","desc":"The famous bubbling pool."},
      {"time":"11:30","title":"Fatnas Island viewpoint","desc":"Palm-fringed lake island."},
      {"time":"14:00","title":"Lunch under the palms","desc":"Siwan dates, olives, and abu-mardam bread."},
      {"time":"17:00","title":"Sunset on Salt Lake","desc":"Float in the bright-white salt pools."}
    ]},
    {"day":3,"title":"Great Sand Sea safari","stops":[
      {"time":"10:00","title":"4x4 dune-bashing","desc":"Into the Great Sand Sea."},
      {"time":"12:00","title":"Hot & cold springs","desc":"Bir Wahed: hot tub beside a cold lake."},
      {"time":"14:00","title":"Sandboarding","desc":"Try the big dunes."},
      {"time":"18:00","title":"Bedouin camp dinner","desc":"Tagine cooked in sand, stargazing."}
    ]},
    {"day":4,"title":"Heritage & return","stops":[
      {"time":"09:00","title":"Shali fortress walk","desc":"The mud-brick old town."},
      {"time":"11:00","title":"Temple of the Oracle","desc":"Where Alexander the Great was crowned."},
      {"time":"13:00","title":"Farewell lunch","desc":"At a Siwan family home."},
      {"time":"15:00","title":"Drive back to Cairo","desc":"Overnight return journey."}
    ]}
  ]'::jsonb,
  itinerary_ar = '[
    {"day":1,"title":"القاهرة ← سيوة","stops":[
      {"time":"06:00","title":"الانطلاق من القاهرة","desc":"رحلة طويلة عبر الصحراء الغربية (~10 ساعات)."},
      {"time":"13:00","title":"استراحة غداء في مرسى مطروح","desc":"استراحة على المتوسط."},
      {"time":"19:00","title":"الوصول إلى سيوة","desc":"نزل بيئي من الطوب اللبن قرب قلعة شالي."}
    ]},
    {"day":2,"title":"العيون والبحيرات الملحية","stops":[
      {"time":"09:00","title":"السباحة في عين كليوباترا","desc":"البركة الشهيرة الفوّارة."},
      {"time":"11:30","title":"إطلالة جزيرة فطناس","desc":"جزيرة محاطة بالنخيل."},
      {"time":"14:00","title":"غداء تحت النخيل","desc":"تمر وزيتون وخبز سيوي."},
      {"time":"17:00","title":"الغروب على بحيرة الملح","desc":"الطفو في برك الملح البيضاء."}
    ]},
    {"day":3,"title":"سفاري بحر الرمال العظيم","stops":[
      {"time":"10:00","title":"رحلة 4x4 على الكثبان","desc":"داخل بحر الرمال العظيم."},
      {"time":"12:00","title":"الينابيع الحارة والباردة","desc":"بئر واحد: حوض ساخن بجوار بحيرة باردة."},
      {"time":"14:00","title":"التزلج على الرمال","desc":"تجربة الكثبان الكبيرة."},
      {"time":"18:00","title":"عشاء مخيم بدوي","desc":"طاجن في الرمل ومراقبة النجوم."}
    ]},
    {"day":4,"title":"التراث والعودة","stops":[
      {"time":"09:00","title":"جولة قلعة شالي","desc":"البلدة القديمة من الطوب اللبن."},
      {"time":"11:00","title":"معبد الوحي","desc":"حيث تُوّج الإسكندر الأكبر."},
      {"time":"13:00","title":"غداء وداع","desc":"في بيت عائلة سيوية."},
      {"time":"15:00","title":"العودة إلى القاهرة","desc":"رحلة عودة ليلية."}
    ]}
  ]'::jsonb
WHERE id = 'd5560397-f3a9-4a5e-acae-9c87afaf88dc';