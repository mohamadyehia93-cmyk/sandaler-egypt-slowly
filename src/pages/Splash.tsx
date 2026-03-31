import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Pen, Briefcase, Home, Truck, Map, ShoppingBag, Building2, Shield, ArrowLeft, ArrowRight, MapPin, Compass, Headphones, Heart, UtensilsCrossed, Camera, Music, Palette, Check } from "lucide-react";
import { regions, regionCities } from "@/lib/sampleData";

type OnboardingStep = "splash" | "language" | "role" | "localRole" | "city" | "interests" | "profile";

const topRoles = [
  { key: "visitor", icon: User, label: { en: "Visitor", ar: "زائر" }, desc: { en: "Discover rural Egypt as a traveler", ar: "اكتشف ريف مصر كمسافر" } },
  { key: "local", icon: Home, label: { en: "Local", ar: "محلي" }, desc: { en: "I live here and want to contribute", ar: "أعيش هنا وأريد المساهمة" } },
];

const localRoles = [
  { key: "culture-actor", icon: Pen, label: { en: "Culture Actor", ar: "فاعل ثقافي" }, desc: { en: "Share your community's story", ar: "شارك قصة مجتمعك" } },
  { key: "service-provider", icon: Briefcase, label: { en: "Service Provider", ar: "مقدم خدمة" }, desc: { en: "List experiences & activities", ar: "اعرض تجارب وأنشطة" } },
  { key: "accommodation-host", icon: Home, label: { en: "Accommodation Host", ar: "مضيف إقامة" }, desc: { en: "Host travelers in your home", ar: "استضف مسافرين في بيتك" } },
  { key: "transport-provider", icon: Truck, label: { en: "Transport Provider", ar: "مقدم مواصلات" }, desc: { en: "Offer rides & transport", ar: "قدم رحلات ومواصلات" } },
  { key: "trip-organizer", icon: Map, label: { en: "Trip Organizer", ar: "منظم رحلات" }, desc: { en: "Create & lead group trips", ar: "أنشئ وقُد رحلات جماعية" } },
  { key: "product-seller", icon: ShoppingBag, label: { en: "Product Seller", ar: "بائع منتجات" }, desc: { en: "Sell local crafts & goods", ar: "بِع حرفاً ومنتجات محلية" } },
  { key: "organization", icon: Building2, label: { en: "Organization", ar: "منظمة" }, desc: { en: "Recruit volunteers & donors", ar: "اجذب متطوعين ومتبرعين" } },
  { key: "ambassador", icon: Shield, label: { en: "Ambassador", ar: "سفير" }, desc: { en: "Verify & support providers", ar: "تحقق وادعم المقدمين" } },
];

const allRoles = [topRoles[0], ...localRoles];

const interests = [
  { key: "experiences", icon: Compass, label: { en: "Experiences", ar: "تجارب" } },
  { key: "audio-tours", icon: Headphones, label: { en: "Audio Tours", ar: "جولات صوتية" } },
  { key: "causes", icon: Heart, label: { en: "Local Causes", ar: "قضايا محلية" } },
  { key: "food", icon: UtensilsCrossed, label: { en: "Food & Cuisine", ar: "طعام ومأكولات" } },
  { key: "photography", icon: Camera, label: { en: "Photography", ar: "تصوير" } },
  { key: "music", icon: Music, label: { en: "Music & Folklore", ar: "موسيقى وفلكلور" } },
  { key: "crafts", icon: Palette, label: { en: "Crafts & Art", ar: "حرف وفنون" } },
  { key: "stays", icon: Home, label: { en: "Places to Stay", ar: "أماكن إقامة" } },
  { key: "shopping", icon: ShoppingBag, label: { en: "Local Products", ar: "منتجات محلية" } },
  { key: "trips", icon: Map, label: { en: "Group Trips", ar: "رحلات جماعية" } },
];

const regionNames: Record<string, { en: string; ar: string }> = {
  "nile-delta": { en: "Nile Delta", ar: "دلتا النيل" },
  "suez-canal": { en: "Suez Canal", ar: "قناة السويس" },
  "upper-egypt": { en: "Upper Egypt", ar: "صعيد مصر" },
  "frontiers": { en: "Frontiers", ar: "الحدود" },
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const SplashPage = () => {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("splash");
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState("");

  const goTo = (next: OnboardingStep, dir = 1) => {
    setDirection(dir);
    setStep(next);
  };

  const handleFinish = () => navigate("/");
  const handleGuestMode = () => navigate("/");

  const toggleCity = (cityId: string) => {
    setSelectedCities(prev =>
      prev.includes(cityId) ? prev.filter(c => c !== cityId) : [...prev, cityId]
    );
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
    );
  };

  const availableCities = Object.entries(regionCities).flatMap(([regionId, cities]) =>
    cities.map(c => ({ ...c, regionId }))
  );

  const filteredCities = selectedRegion
    ? regionCities[selectedRegion] || []
    : availableCities;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {/* STEP 1: Splash */}
        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative flex flex-col"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=800&q=80"
                alt="Rural Egypt"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-12 px-6">
              <div className="text-5xl mb-3">🌊</div>
              <h1 className="text-4xl font-extrabold text-primary-foreground mb-1 tracking-tight">Sandal</h1>
              <p className="text-lg text-primary-foreground/80 mb-1 font-medium">Discover Egypt. Slowly.</p>
              <p className="text-base text-primary-foreground/60 mb-8 font-cairo">اكتشف مصر. ببطء.</p>
              <button
                onClick={() => goTo("language")}
                className="w-full max-w-xs py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-elevated mb-3"
              >
                {t("splash.getStarted")}
              </button>
              <button
                onClick={() => goTo("language")}
                className="w-full max-w-xs py-3 rounded-xl bg-primary-foreground/10 backdrop-blur text-primary-foreground font-medium text-base border border-primary-foreground/20"
              >
                {t("splash.login")}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Language Selection */}
        {step === "language" && (
          <motion.div
            key="language"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center bg-background px-6"
          >
            <div className="text-4xl mb-2">🌊</div>
            <h1 className="text-2xl font-bold text-primary-dark mb-8">{t("splash.chooseLanguage")}</h1>
            <div className="flex gap-4 w-full max-w-xs mb-8">
              <button
                onClick={() => { setLang("en"); goTo("role"); }}
                className="flex-1 py-6 rounded-xl shadow-card bg-card border-2 border-primary/20 hover:border-primary transition-colors text-center"
              >
                <span className="text-2xl block mb-1">🇬🇧</span>
                <span className="text-lg font-semibold text-foreground">English</span>
              </button>
              <button
                onClick={() => { setLang("ar"); goTo("role"); }}
                className="flex-1 py-6 rounded-xl shadow-card bg-card border-2 border-primary/20 hover:border-primary transition-colors text-center"
              >
                <span className="text-2xl block mb-1">🇪🇬</span>
                <span className="text-lg font-semibold text-foreground font-cairo">العربية</span>
              </button>
            </div>
            <button onClick={handleGuestMode} className="text-sm text-muted-foreground underline">
              {lang === "ar" ? "تصفح كزائر" : "Browse as guest"}
            </button>
          </motion.div>
        )}

        {/* STEP 3: Visitor vs Local */}
        {step === "role" && (
          <motion.div
            key="role"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo("language", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "من أنت؟" : "Who are you?"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "يمكنك تغييره لاحقاً" : "You can change this later"}
                </p>
              </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              {topRoles.map(({ key, icon: Icon, label, desc }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "visitor") {
                      setSelectedRole("visitor");
                      goTo("city");
                    } else {
                      goTo("localRole");
                    }
                  }}
                  className="w-full max-w-xs flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all text-start shadow-card"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">{label[lang]}</p>
                    <p className="text-xs text-muted-foreground">{desc[lang]}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ms-auto" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3b: Local Role Selection */}
        {step === "localRole" && (
          <motion.div
            key="localRole"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo("role", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "اختر دورك" : "Choose Your Role"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "كيف تريد المساهمة؟" : "How do you want to contribute?"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-1 gap-2.5">
                {localRoles.map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-start ${
                      selectedRole === key
                        ? "border-primary bg-primary/5 shadow-card"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{label[lang]}</p>
                      <p className="text-xs text-muted-foreground">{desc[lang]}</p>
                    </div>
                    {selectedRole === key && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background">
              <button
                onClick={() => selectedRole && goTo("city")}
                disabled={!selectedRole}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === "ar" ? "التالي" : "Continue"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: City Selection */}
        {step === "city" && (
          <motion.div
            key="city"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo(selectedRole === "visitor" ? "role" : "localRole", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "اختر مدنك" : "Pick Your Cities"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "أي مدن تريد استكشافها؟" : "Which cities interest you?"}
                </p>
              </div>
            </header>

            {/* Region filter chips */}
            <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedRegion(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedRegion ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {lang === "ar" ? "الكل" : "All"}
              </button>
              {regions.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === r.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {r.emoji} {regionNames[r.id]?.[lang] || r.id}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="grid grid-cols-2 gap-2.5">
                {filteredCities.map((city) => {
                  const isSelected = selectedCities.includes(city.id);
                  return (
                    <button
                      key={city.id}
                      onClick={() => toggleCity(city.id)}
                      className={`relative flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-start ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground truncate">{city.name[lang]}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary absolute top-2 end-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={() => goTo("interests")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
              >
                {selectedCities.length > 0
                  ? `${lang === "ar" ? "التالي" : "Continue"} (${selectedCities.length})`
                  : lang === "ar" ? "التالي" : "Continue"
                }
              </button>
              <button
                onClick={() => goTo("interests")}
                className="w-full py-2 text-xs text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Interests */}
        {step === "interests" && (
          <motion.div
            key="interests"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo("city", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "ما يهمك" : "What Interests You?"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "اختر ٣ أو أكثر لتخصيص تجربتك" : "Pick 3+ to personalize your feed"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {interests.map(({ key, icon: Icon, label }) => {
                  const isSelected = selectedInterests.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleInterest(key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-card"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground text-center">{label[lang]}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={() => goTo("profile")}
                disabled={selectedInterests.length < 3}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === "ar" ? "التالي" : "Continue"} ({selectedInterests.length}/3+)
              </button>
              <button
                onClick={() => goTo("profile")}
                className="w-full py-2 text-xs text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: Profile Setup */}
        {step === "profile" && (
          <motion.div
            key="profile"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo("interests", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "أنشئ ملفك الشخصي" : "Set Up Your Profile"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "أخبرنا عن نفسك" : "Tell us about yourself"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
              {/* Avatar placeholder */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <button className="text-xs text-primary font-semibold">
                  {lang === "ar" ? "إضافة صورة" : "Add Photo"}
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "الاسم" : "Name"}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "ar" ? "أدخل اسمك" : "Enter your name"}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  placeholder={lang === "ar" ? "example@email.com" : "example@email.com"}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Summary badges */}
              <div className="space-y-2">
                {/* Role */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {(() => {
                      const role = allRoles.find(r => r.key === selectedRole);
                      if (!role) return null;
                      const RoleIcon = role.icon;
                      return <RoleIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{lang === "ar" ? "دورك" : "Your role"}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {allRoles.find(r => r.key === selectedRole)?.label[lang]}
                    </p>
                  </div>
                </div>

                {/* Cities */}
                {selectedCities.length > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "مدنك" : "Your cities"}</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {selectedCities.slice(0, 3).map(id => {
                          const city = availableCities.find(c => c.id === id);
                          return city?.name[lang];
                        }).filter(Boolean).join(", ")}
                        {selectedCities.length > 3 && ` +${selectedCities.length - 3}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interests */}
                {selectedInterests.length > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "اهتماماتك" : "Your interests"}</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {selectedInterests.slice(0, 3).map(key => {
                          const interest = interests.find(i => i.key === key);
                          return interest?.label[lang];
                        }).filter(Boolean).join(", ")}
                        {selectedInterests.length > 3 && ` +${selectedInterests.length - 3}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
              >
                {lang === "ar" ? "ابدأ الاستكشاف" : "Start Exploring"}
              </button>
              <button
                onClick={handleFinish}
                className="w-full py-2.5 text-sm text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي الآن" : "Skip for now"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashPage;
