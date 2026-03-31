import { ArrowLeft, Heart, Star, MapPin, Share2, Clock, Users, MessageCircle, ShieldCheck, Leaf, HandHeart, Headphones, ChevronRight } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { experiences } from "@/lib/sampleData";
import { experienceToProvider } from "@/lib/providerMappings";
import DetailTestimonials from "@/components/DetailTestimonials";

const experienceHosts: Record<string, { name: { en: string; ar: string }; image: string; bio: { en: string; ar: string }; years: number; languages: { en: string; ar: string } }> = {
  e1: { name: { en: "Hassan El-Masry", ar: "حسن المصري" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", bio: { en: "A lifelong birdwatcher and wetlands conservationist who grew up on the shores of Lake Manzala. Hassan can identify over 200 bird species by sound alone and has led nature expeditions across the Delta for 12 years.", ar: "مراقب طيور وعالم أراضٍ رطبة نشأ على ضفاف بحيرة المنزلة. يستطيع حسن التعرف على أكثر من ٢٠٠ نوع طائر من صوته فقط وقاد رحلات طبيعية عبر الدلتا لمدة ١٢ عاماً." }, years: 12, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e4: { name: { en: "Captain Youssef", ar: "الريّس يوسف" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", bio: { en: "A third-generation felucca captain from Rosetta. Youssef's family has sailed the Nile for over a century. He knows every bend of the river and shares incredible stories of Rosetta's maritime history during each ride.", ar: "ريّس فلوكة من الجيل الثالث في رشيد. عائلة يوسف أبحرت في النيل لأكثر من قرن. يعرف كل منعطف في النهر ويشارك قصصاً مذهلة عن تاريخ رشيد البحري." }, years: 20, languages: { en: "Arabic", ar: "العربية" } },
  e10: { name: { en: "Tarek Nile", ar: "طارق نايل" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", bio: { en: "A certified kayaking instructor and Luxor native who combines his passion for the Nile with a deep knowledge of ancient Egyptian river traditions. Tarek has guided sunrise kayaking trips for 8 years.", ar: "مدرب تجديف معتمد وابن الأقصر يجمع بين شغفه بالنيل ومعرفته العميقة بتقاليد النهر المصرية القديمة." }, years: 8, languages: { en: "Arabic, English, German", ar: "العربية، الإنجليزية، الألمانية" } },
  e5: { name: { en: "Dr. Samira Fawzy", ar: "د. سميرة فوزي" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", bio: { en: "An archaeologist and historian specializing in the Ptolemaic period. Samira has spent 15 years studying Rosetta's heritage and brings ancient stories to life with her engaging storytelling style.", ar: "عالمة آثار ومؤرخة متخصصة في العصر البطلمي. أمضت سميرة ١٥ عاماً في دراسة تراث رشيد وتُحيي القصص القديمة بأسلوبها الشيق." }, years: 15, languages: { en: "Arabic, English, French", ar: "العربية، الإنجليزية، الفرنسية" } },
  e6: { name: { en: "Khaled Sayed", ar: "خالد سيد" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", bio: { en: "A Port Said native and urban history enthusiast. Khaled grew up hearing stories of the canal's construction from his grandfather and now shares the city's multicultural heritage with visitors.", ar: "ابن بورسعيد وعاشق التاريخ الحضري. نشأ خالد على قصص بناء القناة من جده ويشارك الآن التراث متعدد الثقافات مع الزوار." }, years: 7, languages: { en: "Arabic, English, Italian", ar: "العربية، الإنجليزية، الإيطالية" } },
  e11: { name: { en: "Prof. Ayman Sobhy", ar: "أ.د. أيمن صبحي" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", bio: { en: "A retired Egyptology professor who brings decades of academic knowledge to immersive temple tours. His passion for ancient architecture makes every column and carving come alive.", ar: "أستاذ مصريات متقاعد يجلب عقوداً من المعرفة الأكاديمية لجولات المعابد. شغفه بالعمارة القديمة يجعل كل عمود ونقش ينبض بالحياة." }, years: 25, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e7: { name: { en: "Teta Hanem", ar: "تيتة هانم" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", bio: { en: "A beloved grandmother from Rosetta who has been cooking traditional Delta cuisine for over 50 years. Her kitchen is legendary among travelers, and her stuffed vine leaves are unforgettable.", ar: "جدة محبوبة من رشيد تطبخ المطبخ الدلتاوي التقليدي لأكثر من ٥٠ عاماً. مطبخها أسطوري بين المسافرين ومحشي ورق العنب لديها لا يُنسى." }, years: 6, languages: { en: "Arabic", ar: "العربية" } },
  e12: { name: { en: "Captain Adel", ar: "الريّس عادل" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", bio: { en: "A fisherman turned experience host on Lake Timsah. Adel shares his decades of fishing expertise and cooks the freshest catch right on the boat using traditional Suez Canal recipes.", ar: "صياد تحول لمضيف تجارب على بحيرة التمساح. يشارك عادل خبرته في الصيد ويطبخ أطازج صيد على القارب بوصفات قناة السويس التقليدية." }, years: 10, languages: { en: "Arabic", ar: "العربية" } },
  e3: { name: { en: "Omar Siwan", ar: "عمر سيوي" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", bio: { en: "A Siwan Berber guide and desert sports enthusiast. Omar knows every dune and salt lake in the Western Desert and has been leading sandboarding adventures since he was a teenager.", ar: "مرشد أمازيغي سيوي وعاشق رياضات الصحراء. يعرف عمر كل كثيب وبحيرة ملحية في الصحراء الغربية ويقود مغامرات التزلج على الرمال منذ مراهقته." }, years: 14, languages: { en: "Arabic, Siwi, English", ar: "العربية، السيوية، الإنجليزية" } },
  e13: { name: { en: "Uncle Mahmoud", ar: "عم محمود" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", bio: { en: "A Delta fisherman who has fished Lake Burullus for 40 years. His night fishing trips combine traditional techniques with unforgettable lakeside storytelling under the stars.", ar: "صياد دلتا صاد في بحيرة البرلس لمدة ٤٠ عاماً. رحلات الصيد الليلي تجمع بين التقنيات التقليدية وحكايات لا تُنسى تحت النجوم." }, years: 40, languages: { en: "Arabic", ar: "العربية" } },
  e16: { name: { en: "Sherif Dive", ar: "شريف دايف" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", bio: { en: "A PADI-certified dive master born and raised in Dahab. Sherif has explored the Blue Hole over 1,000 times and is passionate about marine conservation in the Red Sea.", ar: "مدرب غوص معتمد من PADI ولد وترعرع في دهب. استكشف شريف الحفرة الزرقاء أكثر من ١٠٠٠ مرة وشغوف بالحفاظ على البيئة البحرية." }, years: 16, languages: { en: "Arabic, English, Russian", ar: "العربية، الإنجليزية، الروسية" } },
  e8: { name: { en: "Fatma Nubian", ar: "فاطمة النوبية" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", bio: { en: "A Nubian artist and potter who learned the craft from her grandmother. Fatma's colorful pottery workshop celebrates centuries-old Nubian artistic traditions passed down through generations.", ar: "فنانة وخزّافة نوبية تعلمت الحرفة من جدتها. ورشة فاطمة الملونة تحتفي بتقاليد فنية نوبية عمرها قرون." }, years: 11, languages: { en: "Arabic, Nubian, English", ar: "العربية، النوبية، الإنجليزية" } },
  e14: { name: { en: "Hajj Mostafa", ar: "الحاج مصطفى" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", bio: { en: "A master palm weaver from Damietta with over 30 years of experience. Hajj Mostafa's workshop is a living museum of traditional weaving techniques that he teaches with patience and pride.", ar: "حرفي نسج نخيل من دمياط بأكثر من ٣٠ عاماً من الخبرة. ورشة الحاج مصطفى متحف حي لتقنيات النسج التقليدية يعلمها بصبر وفخر." }, years: 30, languages: { en: "Arabic", ar: "العربية" } },
  e9: { name: { en: "Nour El-Din", ar: "نور الدين" }, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", bio: { en: "A youth educator and community organizer in Rosetta. Nour founded the children's library to promote literacy and cultural pride among young people in the Delta region.", ar: "معلم شباب ومنظم مجتمعي في رشيد. أسس نور مكتبة الأطفال لتعزيز القراءة والفخر الثقافي بين الشباب في منطقة الدلتا." }, years: 5, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e15: { name: { en: "Sarah Ahmed", ar: "سارة أحمد" }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", bio: { en: "An English teacher and volunteer coordinator in Aswan. Sarah connects international volunteers with village schools, creating meaningful cultural exchanges that benefit both sides.", ar: "معلمة إنجليزي ومنسقة تطوع في أسوان. تربط سارة المتطوعين الدوليين بمدارس القرى لخلق تبادلات ثقافية هادفة." }, years: 4, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e17: { name: { en: "Dr. Hany Mansour", ar: "د. هاني منصور" }, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", bio: { en: "A history professor at Mansoura University specializing in Crusader-era Egypt. His walking tours bring the dramatic Battle of Mansoura to vivid life through storytelling and historical maps.", ar: "أستاذ تاريخ بجامعة المنصورة متخصص في مصر عصر الحروب الصليبية. جولاته تُحيي معركة المنصورة الدرامية من خلال السرد والخرائط التاريخية." }, years: 18, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e18: { name: { en: "Sheikh Taha", ar: "الشيخ طه" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", bio: { en: "A Sufi scholar and cultural guide in Tanta. Sheikh Taha brings deep spiritual knowledge to the Moulid festival experience, explaining the significance of each ritual and tradition.", ar: "عالم صوفي ومرشد ثقافي في طنطا. يجلب الشيخ طه معرفة روحية عميقة لتجربة المولد، يشرح أهمية كل طقس وتقليد." }, years: 22, languages: { en: "Arabic", ar: "العربية" } },
  e19: { name: { en: "Eng. Wael Mahalla", ar: "م. وائل محلة" }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", bio: { en: "A retired textile engineer who spent 25 years at Egypt's largest textile factory. Wael's factory tours reveal the fascinating story of Egyptian cotton and the workers' movement.", ar: "مهندس نسيج متقاعد أمضى ٢٥ عاماً في أكبر مصنع نسيج مصري. جولات وائل تكشف قصة القطن المصري وحركة العمال." }, years: 6, languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" } },
  e20: { name: { en: "Usta Ibrahim", ar: "أسطى إبراهيم" }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", bio: { en: "A master carpet weaver from Fuwwah, continuing a 500-year-old tradition. His workshop produces handmade carpets using techniques unchanged since the Mamluk era.", ar: "حرفي نسج سجاد من فوة يواصل تقليداً عمره ٥٠٠ عام. ورشته تنتج سجاداً يدوياً بتقنيات لم تتغير منذ عصر المماليك." }, years: 35, languages: { en: "Arabic", ar: "العربية" } },
};

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const exp = experiences.find((e) => e.id === id) || experiences[0];

  const steps = [
    { en: "Meet at the village entrance", ar: "الالتقاء عند مدخل القرية" },
    { en: "Walk through the old town", ar: "المشي في المدينة القديمة" },
    { en: "Traditional lunch with a local family", ar: "غداء تقليدي مع عائلة محلية" },
    { en: "Visit the craft workshop", ar: "زيارة ورشة الحرف" },
    { en: "Sunset photo session", ar: "جلسة تصوير عند الغروب" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Photo Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-0.5 h-64">
          <img src={exp.image} alt="" className="w-full h-full object-cover col-span-2" />
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-1">{exp.title[lang]}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {exp.rating} ({exp.reviews})</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {exp.region[lang]}</span>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ icon: Clock, label: "3 hours" }, { icon: Users, label: "Up to 14 guests" }].map((tag, i) => (
            <span key={i} className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <tag.icon className="w-3.5 h-3.5" /> {tag.label}
            </span>
          ))}
        </div>

        {/* Host Bio */}
        {(() => {
          const host = experienceHosts[exp.id];
          if (!host) return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">👤</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "بإرشاد مرشد محلي" : "Hosted by a local guide"}</p>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "مرشد محلي معتمد" : "Verified local guide"}</p>
              </div>
            </div>
          );
          return (
            <div className="rounded-xl bg-surface mb-6 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={host.image} alt={host.name[lang]} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "بإرشاد" : "Hosted by"} {host.name[lang]}</p>
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? `${host.years} سنوات خبرة` : `${host.years} years experience`} · {host.languages[lang]}</p>
                </div>
                <button className="p-2 rounded-full bg-secondary">
                  <MessageCircle className="w-4 h-4 text-secondary-foreground" />
                </button>
              </div>
              <div className="px-3 pb-3 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed pt-2.5">{host.bio[lang]}</p>
              </div>
            </div>
          );
        })()}

        {/* What You'll Do */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "ماذا ستفعل" : "What You'll Do"}</h2>
        <div className="relative mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</div>
                {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{step[lang]}</p>
            </div>
          ))}
        </div>

        {/* Availability */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المواعيد المتاحة" : "Upcoming Availability"}</h2>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
          {["Dec 26", "Dec 28", "Jan 2", "Jan 5"].map((d) => (
            <button key={d} className="min-w-[100px] py-3 px-4 rounded-lg border border-border bg-card text-center hover:border-primary transition-colors">
              <span className="text-xs text-muted-foreground block">{d}</span>
              <span className="text-[10px] text-accent block mt-0.5">14 spots</span>
            </button>
          ))}
        </div>

        {/* Things to Know */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "أشياء يجب معرفتها" : "Things to Know"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: "🎒", text: lang === "ar" ? "أحضر ماء ووجبة خفيفة" : "Bring water & snack" },
            { icon: "🏃", text: lang === "ar" ? "مستوى نشاط متوسط" : "Moderate activity" },
            { icon: "🗣️", text: lang === "ar" ? "عربي وإنجليزي" : "Arabic & English" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٢٤ ساعة" : "Free cancel 24h before" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Why Book with Sandal */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "لماذا تحجز مع صندل؟" : "Why Book with Sandal?"}</h2>
        <div className="space-y-3 mb-6">
          {[
            { icon: ShieldCheck, title: { en: "Verified Local Hosts", ar: "مضيفون محليون موثقون" }, desc: { en: "Every host is personally vetted and trained to ensure authentic, safe experiences.", ar: "كل مضيف يتم فحصه وتدريبه شخصياً لضمان تجارب أصيلة وآمنة." } },
            { icon: HandHeart, title: { en: "Community-First Impact", ar: "أثر مجتمعي أولاً" }, desc: { en: "80% of your booking goes directly to local communities and artisans.", ar: "٨٠٪ من حجزك يذهب مباشرة للمجتمعات المحلية والحرفيين." } },
            { icon: Leaf, title: { en: "Sustainable & Responsible", ar: "مستدام ومسؤول" }, desc: { en: "Low-footprint experiences designed to protect Egypt's heritage and nature.", ar: "تجارب منخفضة الأثر مصممة لحماية تراث مصر وطبيعتها." } },
            { icon: Headphones, title: { en: "24/7 Local Support", ar: "دعم محلي على مدار الساعة" }, desc: { en: "Our team is always available before, during, and after your experience.", ar: "فريقنا متاح دائماً قبل وأثناء وبعد تجربتك." } },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title[lang]}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{exp.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=experience&id=${exp.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default ExperienceDetail;
