import { ArrowLeft, Heart, Share2, Headphones, Play, Pause, Download, MapPin, Clock, Navigation, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { audioTours, regions } from "@/lib/sampleData";
import DetailTestimonials from "@/components/DetailTestimonials";
import TourStopsMap from "@/components/TourStopsMap";

const AudioTourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);

  const tour = audioTours.find((a) => a.id === id) || audioTours[0];
  const region = regions.find((r) => r.id === tour.regionId);

  // Narrator data per tour
  const tourNarrators: Record<string, { name: { en: string; ar: string }; image: string; bio: { en: string; ar: string }; title: { en: string; ar: string }; profileId?: string }> = {
    a1: { name: { en: "Yasmine Hussein", ar: "ياسمين حسين" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Historian & Rosetta native", ar: "مؤرخة وابنة رشيد" }, bio: { en: "Yasmine grew up among the Ottoman merchant houses of Rosetta. A published historian, she brings the city's rich past to life with vivid storytelling — from the discovery of the Rosetta Stone to the palm groves that define the city's skyline.", ar: "نشأت ياسمين بين بيوت التجار العثمانية في رشيد. كمؤرخة منشورة، تُحيي ماضي المدينة الغني بسرد حي — من اكتشاف حجر رشيد إلى بساتين النخيل التي تحدد أفق المدينة." }, profileId: "ca8" },
    a2: { name: { en: "Captain Samir Ismail", ar: "الريّس سمير إسماعيل" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", title: { en: "Former Canal pilot", ar: "مرشد قناة سابق" }, bio: { en: "After 30 years guiding ships through the Suez Canal, Captain Samir now guides listeners through Ismailia's fascinating history — from the canal's construction to the city's unique blend of Egyptian and European architecture.", ar: "بعد ٣٠ عاماً من إرشاد السفن عبر قناة السويس، يرشد الريّس سمير الآن المستمعين عبر تاريخ الإسماعيلية الرائع — من بناء القناة إلى مزيج المدينة الفريد من العمارة المصرية والأوروبية." }, profileId: "ca9" },
    a3: { name: { en: "Dr. Nadia Wetlands", ar: "د. نادية الأراضي الرطبة" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Ornithologist & conservationist", ar: "عالمة طيور ومحافظة على البيئة" }, bio: { en: "Dr. Nadia has spent 20 years studying the migratory patterns of birds in Lake Manzala. Her narration transforms a simple nature walk into a journey through one of the Mediterranean's most important flyways.", ar: "أمضت د. نادية ٢٠ عاماً في دراسة أنماط هجرة الطيور في بحيرة المنزلة. سردها يحول نزهة طبيعية بسيطة إلى رحلة عبر أحد أهم ممرات الطيران في البحر المتوسط." }, profileId: "ca10" },
    a4: { name: { en: "Prof. Mahmoud Karnak", ar: "أ.د. محمود الكرنك" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Egyptologist & temple expert", ar: "عالم مصريات وخبير معابد" }, bio: { en: "A retired professor of Egyptology who has spent 35 years decoding the temples of Luxor and Karnak. His deep, passionate narration makes you feel like you're walking alongside the pharaohs themselves.", ar: "أستاذ مصريات متقاعد أمضى ٣٥ عاماً في فك رموز معابد الأقصر والكرنك. سرده العميق والعاطفي يجعلك تشعر وكأنك تمشي بجانب الفراعنة أنفسهم." }, profileId: "ca11" },
    a5: { name: { en: "Omar Siwan", ar: "عمر سيوي" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", title: { en: "Siwan Berber guide", ar: "مرشد أمازيغي سيوي" }, bio: { en: "A Siwan native who speaks the ancient Siwi language, Omar shares the mystical history of the Oracle Temple and Cleopatra's Spring with the authority of someone whose family has lived in this oasis for generations.", ar: "ابن سيوة الذي يتحدث اللغة السيوية القديمة، يشارك عمر التاريخ الروحاني لمعبد الوحي وعين كليوباترا بسلطة شخص عاشت عائلته في هذه الواحة لأجيال." }, profileId: "ca6" },
    a6: { name: { en: "Hajja Samiha", ar: "الحاجة سميحة" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Master furniture artisan", ar: "أسطى أثاث" }, bio: { en: "Born into a family of woodworkers, Hajja Samiha has witnessed Damietta's transformation into Egypt's furniture capital. Her warm voice guides you through workshops where ancient techniques meet modern design.", ar: "ولدت في عائلة نجارين، شهدت الحاجة سميحة تحول دمياط لعاصمة الأثاث. صوتها الدافئ يرشدك عبر ورش تلتقي فيها التقنيات القديمة بالتصميم الحديث." } },
    a7: { name: { en: "Dr. Hany Mansour", ar: "د. هاني منصور" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", title: { en: "Crusader-era historian", ar: "مؤرخ عصر الحروب الصليبية" }, bio: { en: "A Mansoura University professor who brings the dramatic Battle of Mansoura to life. His narration weaves together medieval warfare, Louis IX's capture, and the city's enduring spirit of victory.", ar: "أستاذ جامعة المنصورة الذي يُحيي معركة المنصورة الدرامية. سرده ينسج الحرب في القرون الوسطى وأسر لويس التاسع وروح النصر الدائمة للمدينة." } },
    a8: { name: { en: "Sheikh Taha", ar: "الشيخ طه" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", title: { en: "Sufi scholar & cultural guide", ar: "عالم صوفي ومرشد ثقافي" }, bio: { en: "A Sufi scholar with deep knowledge of Tanta's spiritual heritage. Sheikh Taha's soothing narration guides you through the legacy of Ahmed el-Badawi, the cotton boom era, and the city's legendary Moulid celebrations.", ar: "عالم صوفي بمعرفة عميقة بالتراث الروحي لطنطا. سرد الشيخ طه المهدئ يرشدك عبر إرث أحمد البدوي وعصر ازدهار القطن واحتفالات المولد الأسطورية." }, profileId: "ca12" },
    a9: { name: { en: "Eng. Wael", ar: "م. وائل" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Retired textile engineer", ar: "مهندس نسيج متقاعد" }, bio: { en: "Wael spent 25 years inside Egypt's largest textile factory. His insider narration tells the powerful story of El Mahalla's workers' movement and the cotton that shaped modern Egypt.", ar: "أمضى وائل ٢٥ عاماً داخل أكبر مصنع نسيج مصري. سرده الداخلي يروي قصة حركة عمال المحلة القوية والقطن الذي شكّل مصر الحديثة." } },
    a10: { name: { en: "Usta Ibrahim", ar: "أسطى إبراهيم" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", title: { en: "Master carpet weaver", ar: "أسطى سجاد" }, bio: { en: "A master weaver continuing a 500-year tradition in Fuwwah. Ibrahim's rough, warm voice tells the story of handmade carpets that once adorned the palaces of Mamluk sultans.", ar: "حرفي نسج يواصل تقليداً عمره ٥٠٠ عام في فوة. صوت إبراهيم الخشن الدافئ يروي قصة السجاد اليدوي الذي زيّن قصور سلاطين المماليك." } },
    a11: { name: { en: "Ahmed Sharqawi", ar: "أحمد شرقاوي" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", title: { en: "Local historian", ar: "مؤرخ محلي" }, bio: { en: "A Bilbeis native who has documented the town's role as a gateway fortress since the Fatimid era. His narration connects ancient military history with the town's vibrant present.", ar: "ابن بلبيس الذي وثّق دور المدينة كقلعة بوابة منذ العصر الفاطمي. سرده يربط التاريخ العسكري القديم بحاضر المدينة النابض." } },
    a12: { name: { en: "Sheikh Barakat", ar: "الشيخ بركات" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", title: { en: "Islamic scholar", ar: "عالم إسلامي" }, bio: { en: "A respected scholar who traces Desouk's spiritual importance as the home of Ibrahim El-Desouki, the Fourth Pole of Islam. His contemplative narration invites deep reflection.", ar: "عالم محترم يتتبع الأهمية الروحية لدسوق كموطن إبراهيم الدسوقي القطب الرابع في الإسلام. سرده التأملي يدعو للتفكير العميق." } },
    a13: { name: { en: "Madame Colette", ar: "مدام كوليت" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Port Said heritage keeper", ar: "حارسة تراث بورسعيد" }, bio: { en: "Born to a Greek-Egyptian family in Port Said, Colette embodies the city's multicultural spirit. Her multilingual narration celebrates the cosmopolitan heritage of this canal gateway city.", ar: "ولدت لعائلة يونانية-مصرية في بورسعيد، تجسد كوليت الروح متعددة الثقافات للمدينة. سردها متعدد اللغات يحتفي بالتراث العالمي لمدينة بوابة القناة." } },
    a14: { name: { en: "Col. Mostafa", ar: "العقيد مصطفى" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Military historian", ar: "مؤرخ عسكري" }, bio: { en: "A retired military officer and historian who narrates Suez's story of resistance during the 1967 and 1973 wars with firsthand knowledge passed down from his father, a war veteran.", ar: "ضابط عسكري متقاعد ومؤرخ يروي قصة مقاومة السويس خلال حربي ٦٧ و٧٣ بمعرفة مباشرة توارثها من والده المحارب." } },
    a15: { name: { en: "Amira Nubian", ar: "أميرة النوبية" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Nubian storyteller", ar: "حكّاءة نوبية" }, bio: { en: "A Nubian elder and oral historian who narrates in both Arabic and Nubian. Amira's voice carries centuries of displaced heritage, celebrating Nubian identity through song, architecture, and memory.", ar: "كبيرة نوبية ومؤرخة شفهية تروي بالعربية والنوبية. صوت أميرة يحمل قروناً من التراث المهجّر، يحتفي بالهوية النوبية من خلال الأغنية والعمارة والذاكرة." }, profileId: "ca14" },
    a16: { name: { en: "Dr. Ramses Horus", ar: "د. رمسيس حورس" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Temple restoration expert", ar: "خبير ترميم معابد" }, bio: { en: "An archaeologist who has spent a decade restoring the Temple of Horus at Edfu. His intimate knowledge of every relief and inscription makes the falcon god's temple come alive.", ar: "عالم آثار أمضى عقداً في ترميم معبد حورس بإدفو. معرفته الحميمة بكل نقش تجعل معبد إله الصقر ينبض بالحياة." } },
    a17: { name: { en: "Bassem Nile", ar: "باسم نايل" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", title: { en: "River guide", ar: "مرشد نهري" }, bio: { en: "A lifelong Nile fisherman turned guide who explains the ancient lock system and the Esna temple with the practical wisdom of someone who has lived on the river for 50 years.", ar: "صياد نيلي مدى الحياة تحول لمرشد يشرح نظام القفل القديم ومعبد إسنا بحكمة عملية من عاش على النهر ٥٠ عاماً." } },
    a18: { name: { en: "Sister Miriam", ar: "الأخت مريم" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Coptic heritage guide", ar: "مرشدة تراث قبطي" }, bio: { en: "A Coptic scholar who narrates Sohag's incredible early Christian heritage — from the White and Red Monasteries to the ancient churches that predate most of Europe's cathedrals.", ar: "عالمة قبطية تروي تراث سوهاج المسيحي المبكر المذهل — من الدير الأبيض والأحمر إلى الكنائس القديمة التي سبقت معظم كاتدرائيات أوروبا." } },
    a19: { name: { en: "Prof. Hathor", ar: "أ.د. حتحور" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Archaeo-astronomer", ar: "عالمة فلك أثرية" }, bio: { en: "An archaeo-astronomer who decoded the famous Dendera Zodiac ceiling. Her narration reveals how ancient Egyptians mapped the cosmos and wove astronomical knowledge into temple architecture.", ar: "عالمة فلك أثرية فكّت رموز سقف زودياك دندرة الشهير. سردها يكشف كيف رسم المصريون القدماء الكون ونسجوا المعرفة الفلكية في عمارة المعابد." } },
    a20: { name: { en: "Dr. Yasser Assiut", ar: "د. ياسر أسيوط" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", title: { en: "Urban historian", ar: "مؤرخ حضري" }, bio: { en: "A professor at Assiut University who traces the city's transformation from ancient crossroads to modern university hub, with fascinating stories of trade, scholarship, and the Nile.", ar: "أستاذ بجامعة أسيوط يتتبع تحول المدينة من مفترق طرق قديم إلى مركز جامعي حديث بقصص رائعة عن التجارة والعلم والنيل." } },
    a21: { name: { en: "Dr. Akhen", ar: "د. أخن" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Amarna period specialist", ar: "متخصص عصر العمارنة" }, bio: { en: "A specialist in the Amarna period who narrates the revolutionary story of Akhenaten, Nefertiti, and their lost capital with the excitement of someone who has spent 20 years excavating it.", ar: "متخصص في عصر العمارنة يروي القصة الثورية لأخناتون ونفرتيتي وعاصمتهما الضائعة بحماس من أمضى ٢٠ عاماً في التنقيب." } },
    a22: { name: { en: "Geologist Layla", ar: "الجيولوجية ليلى" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Paleontologist", ar: "عالمة حفريات" }, bio: { en: "A paleontologist who narrates the mind-blowing story of Wadi Al-Hitan — where 40-million-year-old whale fossils prove that the Sahara was once an ocean.", ar: "عالمة حفريات تروي القصة المذهلة لوادي الحيتان — حيث حفريات الحيتان البالغة ٤٠ مليون عام تثبت أن الصحراء كانت محيطاً." } },
    a23: { name: { en: "Sherif Dive", ar: "شريف دايف" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", title: { en: "PADI dive master", ar: "مدرب غوص PADI" }, bio: { en: "Born and raised in Dahab, Sherif has explored the Blue Hole over 1,000 times. His narration mixes marine biology, local Bedouin legends, and the thrill of one of the world's most famous dive sites.", ar: "ولد وترعرع في دهب، استكشف شريف الحفرة الزرقاء أكثر من ١٠٠٠ مرة. سرده يمزج البيولوجيا البحرية وأساطير البدو وإثارة أحد أشهر مواقع الغوص." }, profileId: "ca13" },
    a24: { name: { en: "Marina Red", ar: "مارينا رد" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "Marine biologist", ar: "عالمة أحياء بحرية" }, bio: { en: "A marine biologist who has studied Red Sea coral reefs for 15 years. Marina's narration reveals the incredible underwater world of Hurghada — from colorful coral gardens to shipwrecks.", ar: "عالمة أحياء بحرية درست شعاب البحر الأحمر المرجانية ١٥ عاماً. سرد مارينا يكشف العالم المذهل تحت الماء من حدائق المرجان الملونة إلى حطام السفن." } },
    a25: { name: { en: "Abdallah Reef", ar: "عبدالله ريف" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", title: { en: "Reef conservation diver", ar: "غطاس حماية شعاب" }, bio: { en: "A conservation diver who protects the fragile reefs of Marsa Alam. His narration highlights the importance of sustainable tourism and introduces you to dugongs, sea turtles, and pristine coral.", ar: "غطاس حماية يحمي الشعاب الهشة في مرسى علم. سرده يبرز أهمية السياحة المستدامة ويقدمك لعروس البحر والسلاحف والمرجان البكر." } },
    a26: { name: { en: "Hagg Sayed", ar: "الحاج سيد" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", title: { en: "Port historian", ar: "مؤرخ ميناء" }, bio: { en: "A Quseir elder whose family has lived in this ancient port for centuries. His narration connects the Roman-era trade routes with the Ottoman fortress and modern-day fishing traditions.", ar: "شيخ من القصير عاشت عائلته في هذا الميناء القديم لقرون. سرده يربط طرق التجارة الرومانية بالقلعة العثمانية وتقاليد الصيد الحديثة." } },
    a27: { name: { en: "Laila Matrouh", ar: "ليلى مطروح" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", title: { en: "WWII heritage guide", ar: "مرشدة تراث الحرب العالمية" }, bio: { en: "A local guide specializing in Marsa Matrouh's WWII history. Laila narrates the story of Rommel's Beach, the desert war, and the stunning beaches that make Matrouh a Mediterranean gem.", ar: "مرشدة محلية متخصصة في تاريخ مرسى مطروح في الحرب العالمية الثانية. تروي ليلى قصة شاطئ رومل وحرب الصحراء والشواطئ المذهلة." } },
    a28: { name: { en: "Sheikh Saleh", ar: "الشيخ صالح" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", title: { en: "Bedouin elder", ar: "شيخ بدوي" }, bio: { en: "A Bedouin elder from North Sinai who shares the stories, traditions, and landscapes of El Arish — the ancient gateway between Africa and Asia — with the wisdom of the desert.", ar: "شيخ بدوي من شمال سيناء يشارك قصص وتقاليد ومناظر العريش — البوابة القديمة بين أفريقيا وآسيا — بحكمة الصحراء." } },
  };

  // Tour-specific stop coordinates
  const tourStopsData: Record<string, { label: { en: string; ar: string }; lat: number; lng: number }[]> = {
    a1: [
      { label: { en: "Rosetta Citadel — Welcome", ar: "قلعة رشيد — ترحيب" }, lat: 31.404, lng: 30.417 },
      { label: { en: "Rashid National Museum", ar: "متحف رشيد القومي" }, lat: 31.406, lng: 30.419 },
      { label: { en: "Palm Tree Boulevard", ar: "شارع النخيل" }, lat: 31.408, lng: 30.421 },
      { label: { en: "Old Souk Market", ar: "السوق القديم" }, lat: 31.410, lng: 30.418 },
      { label: { en: "Abu Mandour Mosque", ar: "مسجد أبو مندور" }, lat: 31.412, lng: 30.415 },
      { label: { en: "Nile Corniche Viewpoint", ar: "كورنيش النيل" }, lat: 31.414, lng: 30.413 },
      { label: { en: "Traditional Café", ar: "المقهى التقليدي" }, lat: 31.411, lng: 30.420 },
      { label: { en: "Rosetta Stone Site — Farewell", ar: "موقع حجر رشيد — وداع" }, lat: 31.407, lng: 30.422 },
    ],
    a2: [
      { label: { en: "Ismailia Station — Start", ar: "محطة الإسماعيلية — البداية" }, lat: 30.596, lng: 32.271 },
      { label: { en: "Lake Timsah Shore", ar: "شاطئ بحيرة التمساح" }, lat: 30.593, lng: 32.278 },
      { label: { en: "De Lesseps House", ar: "بيت دي لسبس" }, lat: 30.590, lng: 32.274 },
      { label: { en: "Ismailia Museum", ar: "متحف الإسماعيلية" }, lat: 30.588, lng: 32.269 },
      { label: { en: "Forsan Island", ar: "جزيرة الفرسان" }, lat: 30.585, lng: 32.276 },
      { label: { en: "Canal Waterfront — End", ar: "واجهة القناة — النهاية" }, lat: 30.598, lng: 32.283 },
    ],
    a3: [
      { label: { en: "Manzala Lake Entrance", ar: "مدخل بحيرة المنزلة" }, lat: 31.167, lng: 32.033 },
      { label: { en: "Bird Watching Tower", ar: "برج مراقبة الطيور" }, lat: 31.172, lng: 32.038 },
      { label: { en: "Fishing Village", ar: "قرية الصيادين" }, lat: 31.178, lng: 32.042 },
      { label: { en: "Reed Islands", ar: "جزر القصب" }, lat: 31.183, lng: 32.036 },
      { label: { en: "Pelican Colony", ar: "مستعمرة البجع" }, lat: 31.188, lng: 32.041 },
      { label: { en: "Flamingo Bay", ar: "خليج الفلامنجو" }, lat: 31.192, lng: 32.045 },
      { label: { en: "Sunset Point", ar: "نقطة الغروب" }, lat: 31.186, lng: 32.050 },
      { label: { en: "Manzala Heritage Dock", ar: "رصيف المنزلة التراثي" }, lat: 31.180, lng: 32.048 },
      { label: { en: "Fish Market", ar: "سوق السمك" }, lat: 31.175, lng: 32.044 },
      { label: { en: "Farewell Café", ar: "مقهى الوداع" }, lat: 31.170, lng: 32.037 },
    ],
    a4: [
      { label: { en: "Luxor Temple Entrance", ar: "مدخل معبد الأقصر" }, lat: 25.700, lng: 32.639 },
      { label: { en: "Avenue of Sphinxes", ar: "طريق الكباش" }, lat: 25.704, lng: 32.641 },
      { label: { en: "Karnak Temple Complex", ar: "مجمع معابد الكرنك" }, lat: 25.719, lng: 32.657 },
      { label: { en: "Sacred Lake", ar: "البحيرة المقدسة" }, lat: 25.718, lng: 32.660 },
      { label: { en: "Obelisk of Hatshepsut", ar: "مسلة حتشبسوت" }, lat: 25.720, lng: 32.655 },
      { label: { en: "Nile Felucca Point", ar: "نقطة الفلوكة" }, lat: 25.698, lng: 32.636 },
      { label: { en: "Valley View — Farewell", ar: "إطلالة الوادي — وداع" }, lat: 25.695, lng: 32.633 },
    ],
    a5: [
      { label: { en: "Shali Fortress — Start", ar: "قلعة شالي — البداية" }, lat: 29.203, lng: 25.519 },
      { label: { en: "Cleopatra's Spring", ar: "عين كليوباترا" }, lat: 29.207, lng: 25.522 },
      { label: { en: "Temple of the Oracle", ar: "معبد الوحي" }, lat: 29.198, lng: 25.515 },
      { label: { en: "Siwa Salt Lakes", ar: "بحيرات سيوة الملحية" }, lat: 29.195, lng: 25.525 },
      { label: { en: "Great Sand Sea Viewpoint", ar: "إطلالة بحر الرمال العظيم" }, lat: 29.190, lng: 25.530 },
    ],
    a6: [
      { label: { en: "Damietta Port — Start", ar: "ميناء دمياط — البداية" }, lat: 31.418, lng: 31.814 },
      { label: { en: "Old Furniture Souk", ar: "سوق الأثاث القديم" }, lat: 31.416, lng: 31.810 },
      { label: { en: "Amr Ibn El-Aas Mosque", ar: "مسجد عمرو بن العاص" }, lat: 31.414, lng: 31.808 },
      { label: { en: "Woodworking Workshop", ar: "ورشة النجارة" }, lat: 31.412, lng: 31.812 },
      { label: { en: "Damietta Cheese Market", ar: "سوق الجبنة الدمياطية" }, lat: 31.410, lng: 31.816 },
      { label: { en: "Palm Grove Walk", ar: "نزهة بستان النخيل" }, lat: 31.420, lng: 31.818 },
      { label: { en: "Nile Corniche — End", ar: "كورنيش النيل — النهاية" }, lat: 31.422, lng: 31.820 },
    ],
    a7: [
      { label: { en: "Dar Ibn Luqman — Start", ar: "دار ابن لقمان — البداية" }, lat: 31.042, lng: 31.381 },
      { label: { en: "Battle of Mansoura Monument", ar: "نصب معركة المنصورة" }, lat: 31.044, lng: 31.383 },
      { label: { en: "Old City Quarter", ar: "حي المدينة القديمة" }, lat: 31.040, lng: 31.378 },
      { label: { en: "Mansoura University", ar: "جامعة المنصورة" }, lat: 31.046, lng: 31.385 },
      { label: { en: "Nile Corniche Walk", ar: "نزهة كورنيش النيل" }, lat: 31.038, lng: 31.376 },
      { label: { en: "Shinnawi Mosque — End", ar: "مسجد الشناوي — النهاية" }, lat: 31.043, lng: 31.380 },
    ],
    a8: [
      { label: { en: "El-Badawi Mosque — Start", ar: "مسجد البدوي — البداية" }, lat: 30.787, lng: 31.000 },
      { label: { en: "Moulid Festival Square", ar: "ميدان المولد" }, lat: 30.789, lng: 31.002 },
      { label: { en: "Cotton Exchange Building", ar: "مبنى بورصة القطن" }, lat: 30.785, lng: 30.998 },
      { label: { en: "Tanta Railway Station", ar: "محطة قطار طنطا" }, lat: 30.783, lng: 31.004 },
      { label: { en: "Old Souk — End", ar: "السوق القديم — النهاية" }, lat: 30.786, lng: 31.001 },
    ],
    a9: [
      { label: { en: "Misr Spinning & Weaving — Start", ar: "مصر للغزل والنسيج — البداية" }, lat: 30.976, lng: 31.168 },
      { label: { en: "Workers' Monument", ar: "نصب العمال" }, lat: 30.978, lng: 31.170 },
      { label: { en: "Historical Cotton Mills", ar: "مصانع القطن التاريخية" }, lat: 30.974, lng: 31.166 },
      { label: { en: "City Center — End", ar: "وسط المدينة — النهاية" }, lat: 30.972, lng: 31.172 },
    ],
    a10: [
      { label: { en: "Fuwwah Carpet Workshop — Start", ar: "ورشة سجاد فوة — البداية" }, lat: 31.200, lng: 30.550 },
      { label: { en: "Traditional Loom House", ar: "بيت النول التقليدي" }, lat: 31.202, lng: 30.552 },
      { label: { en: "Dye Market", ar: "سوق الأصباغ" }, lat: 31.198, lng: 30.548 },
      { label: { en: "Ottoman-era Mosque", ar: "مسجد العصر العثماني" }, lat: 31.204, lng: 30.554 },
      { label: { en: "Carpet Exhibition — End", ar: "معرض السجاد — النهاية" }, lat: 31.201, lng: 30.551 },
    ],
    a11: [
      { label: { en: "Bilbeis Fortress Gate — Start", ar: "بوابة قلعة بلبيس — البداية" }, lat: 30.422, lng: 31.562 },
      { label: { en: "Fatimid Walls", ar: "أسوار الفاطميين" }, lat: 30.424, lng: 31.564 },
      { label: { en: "Old Market", ar: "السوق القديم" }, lat: 30.420, lng: 31.560 },
      { label: { en: "Al-Omari Mosque — End", ar: "مسجد العمري — النهاية" }, lat: 30.423, lng: 31.563 },
    ],
    a12: [
      { label: { en: "Ibrahim El-Desouki Mosque — Start", ar: "مسجد إبراهيم الدسوقي — البداية" }, lat: 31.132, lng: 30.641 },
      { label: { en: "Sufi Meditation Garden", ar: "حديقة التأمل الصوفي" }, lat: 31.134, lng: 30.643 },
      { label: { en: "Old Zawiya", ar: "الزاوية القديمة" }, lat: 31.130, lng: 30.639 },
      { label: { en: "Heritage Walk", ar: "نزهة تراثية" }, lat: 31.136, lng: 30.645 },
      { label: { en: "Nile Viewpoint — End", ar: "إطلالة النيل — النهاية" }, lat: 31.133, lng: 30.642 },
    ],
    a13: [
      { label: { en: "Port Said Lighthouse — Start", ar: "منارة بورسعيد — البداية" }, lat: 31.266, lng: 32.302 },
      { label: { en: "De Lesseps Statue Site", ar: "موقع تمثال دي لسبس" }, lat: 31.264, lng: 32.300 },
      { label: { en: "Military Museum", ar: "المتحف الحربي" }, lat: 31.262, lng: 32.304 },
      { label: { en: "Old European Quarter", ar: "الحي الأوروبي القديم" }, lat: 31.260, lng: 32.298 },
      { label: { en: "Free Zone Market", ar: "سوق المنطقة الحرة" }, lat: 31.258, lng: 32.306 },
      { label: { en: "Canal Viewing Platform", ar: "منصة مشاهدة القناة" }, lat: 31.268, lng: 32.308 },
      { label: { en: "Thomas Cook Building", ar: "مبنى توماس كوك" }, lat: 31.263, lng: 32.301 },
      { label: { en: "Waterfront Promenade — End", ar: "كورنيش البحر — النهاية" }, lat: 31.270, lng: 32.310 },
    ],
    a14: [
      { label: { en: "Suez War Memorial — Start", ar: "نصب حرب السويس — البداية" }, lat: 29.967, lng: 32.549 },
      { label: { en: "October War Panorama", ar: "بانوراما حرب أكتوبر" }, lat: 29.969, lng: 32.551 },
      { label: { en: "Old Suez Port", ar: "ميناء السويس القديم" }, lat: 29.965, lng: 32.547 },
      { label: { en: "Canal Southern Entrance", ar: "المدخل الجنوبي للقناة" }, lat: 29.963, lng: 32.553 },
      { label: { en: "Arbaeen Market", ar: "سوق الأربعين" }, lat: 29.971, lng: 32.555 },
      { label: { en: "Suez Bay Viewpoint — End", ar: "إطلالة خليج السويس — النهاية" }, lat: 29.968, lng: 32.550 },
    ],
    a15: [
      { label: { en: "Nubian Village — Start", ar: "القرية النوبية — البداية" }, lat: 24.089, lng: 32.899 },
      { label: { en: "Painted Houses Walk", ar: "نزهة البيوت الملونة" }, lat: 24.091, lng: 32.901 },
      { label: { en: "Philae Temple View", ar: "إطلالة معبد فيلة" }, lat: 24.087, lng: 32.897 },
      { label: { en: "Nubian Museum", ar: "المتحف النوبي" }, lat: 24.085, lng: 32.903 },
      { label: { en: "Elephantine Island", ar: "جزيرة إلفنتين" }, lat: 24.093, lng: 32.905 },
      { label: { en: "Aga Khan Mausoleum View", ar: "إطلالة ضريح أغا خان" }, lat: 24.083, lng: 32.895 },
      { label: { en: "Aswan Souk", ar: "سوق أسوان" }, lat: 24.095, lng: 32.907 },
      { label: { en: "Felucca Sunset — End", ar: "غروب الفلوكة — النهاية" }, lat: 24.090, lng: 32.900 },
    ],
    a16: [
      { label: { en: "Edfu Temple Gate — Start", ar: "بوابة معبد إدفو — البداية" }, lat: 24.978, lng: 32.873 },
      { label: { en: "Court of Offerings", ar: "فناء القرابين" }, lat: 24.979, lng: 32.874 },
      { label: { en: "Hypostyle Hall", ar: "قاعة الأعمدة" }, lat: 24.980, lng: 32.875 },
      { label: { en: "Holy of Holies", ar: "قدس الأقداس" }, lat: 24.981, lng: 32.876 },
      { label: { en: "Nilometer — End", ar: "مقياس النيل — النهاية" }, lat: 24.977, lng: 32.872 },
    ],
    a17: [
      { label: { en: "Esna Lock — Start", ar: "قفل إسنا — البداية" }, lat: 25.294, lng: 32.554 },
      { label: { en: "Khnum Temple", ar: "معبد خنوم" }, lat: 25.296, lng: 32.556 },
      { label: { en: "Covered Souk", ar: "السوق المسقوف" }, lat: 25.292, lng: 32.552 },
      { label: { en: "Nile Promenade — End", ar: "كورنيش النيل — النهاية" }, lat: 25.298, lng: 32.558 },
    ],
    a18: [
      { label: { en: "White Monastery — Start", ar: "الدير الأبيض — البداية" }, lat: 26.540, lng: 31.600 },
      { label: { en: "Red Monastery", ar: "الدير الأحمر" }, lat: 26.544, lng: 31.604 },
      { label: { en: "Church of the Virgin", ar: "كنيسة العذراء" }, lat: 26.538, lng: 31.598 },
      { label: { en: "Sohag Museum", ar: "متحف سوهاج" }, lat: 26.536, lng: 31.606 },
      { label: { en: "Abydos Road View", ar: "إطلالة طريق أبيدوس" }, lat: 26.542, lng: 31.602 },
      { label: { en: "Nile Corniche — End", ar: "كورنيش النيل — النهاية" }, lat: 26.534, lng: 31.608 },
    ],
    a19: [
      { label: { en: "Dendera Temple Gate — Start", ar: "بوابة معبد دندرة — البداية" }, lat: 26.142, lng: 32.670 },
      { label: { en: "Zodiac Ceiling Chamber", ar: "غرفة سقف الزودياك" }, lat: 26.143, lng: 32.671 },
      { label: { en: "Hathor Columns", ar: "أعمدة حتحور" }, lat: 26.144, lng: 32.672 },
      { label: { en: "Sacred Well", ar: "البئر المقدس" }, lat: 26.141, lng: 32.669 },
      { label: { en: "Rooftop Chapel — End", ar: "كنيسة السطح — النهاية" }, lat: 26.145, lng: 32.673 },
    ],
    a20: [
      { label: { en: "Assiut University — Start", ar: "جامعة أسيوط — البداية" }, lat: 27.183, lng: 31.170 },
      { label: { en: "Meir Tombs Road", ar: "طريق مقابر مير" }, lat: 27.185, lng: 31.172 },
      { label: { en: "Old Souk", ar: "السوق القديم" }, lat: 27.181, lng: 31.168 },
      { label: { en: "Nile Bridge View", ar: "إطلالة كوبري النيل" }, lat: 27.187, lng: 31.174 },
      { label: { en: "Hammam Street — End", ar: "شارع الحمام — النهاية" }, lat: 27.184, lng: 31.171 },
    ],
    a21: [
      { label: { en: "Tell El-Amarna — Start", ar: "تل العمارنة — البداية" }, lat: 27.645, lng: 30.897 },
      { label: { en: "Royal Palace Ruins", ar: "أطلال القصر الملكي" }, lat: 27.647, lng: 30.899 },
      { label: { en: "Boundary Stela", ar: "لوحة الحدود" }, lat: 27.643, lng: 30.895 },
      { label: { en: "Small Aten Temple", ar: "معبد آتون الصغير" }, lat: 27.649, lng: 30.901 },
      { label: { en: "North Tombs", ar: "المقابر الشمالية" }, lat: 27.651, lng: 30.903 },
      { label: { en: "Nefertiti's Horizon", ar: "أفق نفرتيتي" }, lat: 27.641, lng: 30.893 },
      { label: { en: "Workers' Village — End", ar: "قرية العمال — النهاية" }, lat: 27.653, lng: 30.905 },
    ],
    a22: [
      { label: { en: "Qarun Lake — Start", ar: "بحيرة قارون — البداية" }, lat: 29.450, lng: 30.690 },
      { label: { en: "Wadi Al-Hitan Museum", ar: "متحف وادي الحيتان" }, lat: 29.265, lng: 30.025 },
      { label: { en: "Whale Fossil Site", ar: "موقع حفريات الحيتان" }, lat: 29.270, lng: 30.030 },
      { label: { en: "Magic Lake", ar: "البحيرة السحرية" }, lat: 29.275, lng: 30.035 },
      { label: { en: "Wadi El-Rayan Waterfalls", ar: "شلالات وادي الريان" }, lat: 29.280, lng: 30.040 },
      { label: { en: "Desert Viewpoint", ar: "إطلالة الصحراء" }, lat: 29.285, lng: 30.045 },
      { label: { en: "Tunis Village — End", ar: "قرية تونس — النهاية" }, lat: 29.455, lng: 30.695 },
    ],
    a23: [
      { label: { en: "Dahab Promenade — Start", ar: "كورنيش دهب — البداية" }, lat: 28.493, lng: 34.513 },
      { label: { en: "Lighthouse Reef", ar: "شعاب المنارة" }, lat: 28.495, lng: 34.515 },
      { label: { en: "Blue Hole", ar: "الحفرة الزرقاء" }, lat: 28.572, lng: 34.538 },
      { label: { en: "Eel Garden", ar: "حديقة الثعابين" }, lat: 28.497, lng: 34.517 },
      { label: { en: "Bedouin Camp — End", ar: "مخيم بدوي — النهاية" }, lat: 28.491, lng: 34.511 },
    ],
    a24: [
      { label: { en: "Hurghada Marina — Start", ar: "مارينا الغردقة — البداية" }, lat: 27.177, lng: 33.842 },
      { label: { en: "El Dahar Old Town", ar: "الدهار المدينة القديمة" }, lat: 27.179, lng: 33.844 },
      { label: { en: "Marine Museum", ar: "المتحف البحري" }, lat: 27.175, lng: 33.840 },
      { label: { en: "Giftun Island View", ar: "إطلالة جزيرة الجفتون" }, lat: 27.181, lng: 33.846 },
      { label: { en: "Coral Beach", ar: "شاطئ المرجان" }, lat: 27.173, lng: 33.838 },
      { label: { en: "Sunset Strip — End", ar: "شارع الغروب — النهاية" }, lat: 27.183, lng: 33.848 },
    ],
    a25: [
      { label: { en: "Marsa Alam Jetty — Start", ar: "رصيف مرسى علم — البداية" }, lat: 25.067, lng: 34.906 },
      { label: { en: "Dolphin House Reef", ar: "شعاب بيت الدلافين" }, lat: 25.069, lng: 34.908 },
      { label: { en: "Abu Dabbab Bay", ar: "خليج أبو دباب" }, lat: 25.065, lng: 34.904 },
      { label: { en: "Turtle Beach", ar: "شاطئ السلاحف" }, lat: 25.071, lng: 34.910 },
      { label: { en: "Mangrove Walk — End", ar: "نزهة المانغروف — النهاية" }, lat: 25.063, lng: 34.902 },
    ],
    a26: [
      { label: { en: "Quseir Fort — Start", ar: "قلعة القصير — البداية" }, lat: 26.100, lng: 34.281 },
      { label: { en: "Ottoman Mosque", ar: "المسجد العثماني" }, lat: 26.102, lng: 34.283 },
      { label: { en: "Ancient Roman Port", ar: "الميناء الروماني القديم" }, lat: 26.098, lng: 34.279 },
      { label: { en: "Old Coral Houses", ar: "بيوت المرجان القديمة" }, lat: 26.104, lng: 34.285 },
      { label: { en: "Fishermen's Harbor — End", ar: "ميناء الصيادين — النهاية" }, lat: 26.101, lng: 34.282 },
    ],
    a27: [
      { label: { en: "Rommel's Cave — Start", ar: "كهف رومل — البداية" }, lat: 31.354, lng: 27.238 },
      { label: { en: "Rommel Museum", ar: "متحف رومل" }, lat: 31.356, lng: 27.240 },
      { label: { en: "Cleopatra Beach", ar: "شاطئ كليوباترا" }, lat: 31.352, lng: 27.236 },
      { label: { en: "Agiba Beach", ar: "شاطئ عجيبة" }, lat: 31.350, lng: 27.234 },
      { label: { en: "Matrouh Corniche — End", ar: "كورنيش مطروح — النهاية" }, lat: 31.358, lng: 27.242 },
    ],
    a28: [
      { label: { en: "El Arish Citadel — Start", ar: "قلعة العريش — البداية" }, lat: 31.131, lng: 33.798 },
      { label: { en: "Palm Beach", ar: "شاطئ النخيل" }, lat: 31.133, lng: 33.800 },
      { label: { en: "Bedouin Heritage Center", ar: "مركز التراث البدوي" }, lat: 31.129, lng: 33.796 },
      { label: { en: "Old Souk — End", ar: "السوق القديم — النهاية" }, lat: 31.135, lng: 33.802 },
    ],
  };

  const mapStops = (tourStopsData[tour.id] || tourStopsData.a1).slice(0, tour.stops);

  const stops = mapStops.map((s) => ({
    en: s.label.en,
    ar: s.label.ar,
  }));

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <img src={tour.image} alt={tour.title[lang]} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {t("common.audioTour")}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">{tour.title[lang]}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Meta tags */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {tour.region[lang]}</span>
          {region && <span>{region.emoji} {t(region.nameKey)}</span>}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {tour.duration} {t("common.min")}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Navigation className="w-3.5 h-3.5" /> {tour.stops} {t("common.stops")}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <WifiOff className="w-3.5 h-3.5" /> {lang === "ar" ? "متاح بدون إنترنت" : "Offline available"}
          </span>
        </div>

        {/* Audio Player Preview */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "استمع للجولة" : "Listen to Tour"}</p>
              <p className="text-xs text-muted-foreground">{tour.duration} {t("common.min")} · {tour.stops} {t("common.stops")}</p>
            </div>
            <button className="p-2 rounded-full bg-secondary">
              <Download className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
          <div className="w-full bg-border rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: isPlaying ? "15%" : "0%" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{isPlaying ? "0:45" : "0:00"}</span>
            <span className="text-[10px] text-muted-foreground">{tour.duration}:00</span>
          </div>
        </div>

        {/* About */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الجولة" : "About This Tour"}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {lang === "ar"
            ? "جولة صوتية ذاتية تأخذك عبر أجمل المعالم والقصص المحلية. استمع وأنت تمشي، واكتشف الأماكن المخفية والحكايات التي لا يعرفها إلا أهل المنطقة."
            : "A self-guided audio tour that takes you through the most beautiful landmarks and local stories. Listen as you walk, discovering hidden spots and tales known only to locals."}
        </p>

        {/* Narrator */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "الراوي" : "Narrator"}</h2>
        {(() => {
          const narrator = tourNarrators[tour.id];
          if (!narrator) return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">🎙️</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "راوي محلي" : "Local Narrator"}</p>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "مرشد معتمد" : "Verified guide"}</p>
              </div>
            </div>
          );
          return (
            <div className="rounded-xl bg-surface mb-6 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={narrator.image} alt={narrator.name[lang]} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{narrator.name[lang]}</p>
                  <p className="text-xs text-muted-foreground">{narrator.title[lang]}</p>
                </div>
              </div>
              <div className="px-3 pb-3 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed pt-2.5">{narrator.bio[lang]}</p>
              </div>
            </div>
          );
        })()}

        {/* Tour Stops */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "محطات الجولة" : "Tour Stops"}</h2>
        <TourStopsMap stops={mapStops} />
        <div className="relative mb-6">
          {stops.map((stop, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</div>
                {i < stops.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{stop[lang]}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "نصائح" : "Tips"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: "🎧", text: lang === "ar" ? "أحضر سماعات" : "Bring headphones" },
            { icon: "👟", text: lang === "ar" ? "ارتدِ حذاء مريح" : "Wear comfy shoes" },
            { icon: "📱", text: lang === "ar" ? "حمّل مسبقاً" : "Download in advance" },
            { icon: "🧴", text: lang === "ar" ? "أحضر واقي شمس" : "Bring sunscreen" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">
            {tour.price === 0 ? t("common.free") : `${tour.price} ${t("common.egp")}`}
          </span>
          <span className="text-xs text-muted-foreground block">{t("common.audioTour")}</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm">
            <Download className="w-4 h-4 inline mr-1" />
            {lang === "ar" ? "تحميل" : "Download"}
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
          >
            <Play className="w-4 h-4 inline mr-1" />
            {lang === "ar" ? "استمع" : "Listen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioTourDetail;
