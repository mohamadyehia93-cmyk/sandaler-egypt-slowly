import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { roleLabels, useUserRole, type UserRole, type LocalRole } from "@/hooks/useUserRole";
import { useRegions, useCities } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { becomeProvider, providerErrorMessage } from "@/lib/becomeProvider";
import { uploadImages } from "@/lib/dashboardForms";
import {
  saveOnboardingDraft,
  loadOnboardingDraft,
  clearOnboardingDraft,
  fileToCompactDataUrl,
  dataUrlToFile,
} from "@/lib/onboardingDraft";
import { supabase } from "@/integrations/supabase/client";
import {
  PROVIDER_INTENTS,
  getProviderIntent,
  rememberProviderIntent,
  type ProviderIntentKey,
} from "@/lib/providerIntents";
import { isPlausibleWhatsapp } from "@/lib/whatsapp";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import { toast } from "sonner";
import {
  User, Pen, Briefcase, Home, Truck, Map, ShoppingBag, Building2, Shield,
  ArrowLeft, ArrowRight, MapPin, Compass, Headphones, Heart, UtensilsCrossed,
  Camera, Music, Palette, Check, BookOpen, Mic, Landmark, Wheat, Tent, Car,
  Bus, Ship, Package, Gem, Leaf, GraduationCap, Users, HandHeart, Eye,
  Sparkles, Zap, Clock, DollarSign, Crown, Coins, Star, Globe, Mountain
} from "lucide-react";

type OnboardingStep =
  | "splash" | "language" | "role" | "localRole" | "roleDetails"
  | "city" | "interests" | "travelStyle" | "budget" | "profile";

type RoleQuestion = {
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  options: { key: string; icon: any; label: { en: string; ar: string } }[];
  multi?: boolean;
};

const roleQuestions: Record<string, RoleQuestion[]> = {
  "culture-actor": [
    {
      title: { en: "What do you create?", ar: "ماذا تنشئ؟" },
      subtitle: { en: "Select your content types", ar: "اختر أنواع المحتوى" },
      options: [
        { key: "articles", icon: BookOpen, label: { en: "Articles & Stories", ar: "مقالات وقصص" } },
        { key: "photography", icon: Camera, label: { en: "Photography", ar: "تصوير فوتوغرافي" } },
        { key: "audio", icon: Mic, label: { en: "Audio & Podcasts", ar: "صوتيات وبودكاست" } },
        { key: "video", icon: Eye, label: { en: "Video & Film", ar: "فيديو وأفلام" } },
        { key: "music-folklore", icon: Music, label: { en: "Music & Folklore", ar: "موسيقى وفلكلور" } },
        { key: "heritage", icon: Landmark, label: { en: "Heritage Research", ar: "بحث تراثي" } },
        { key: "audio-tours", icon: Headphones, label: { en: "Audio Tours", ar: "جولات صوتية" } },
        { key: "collections", icon: BookOpen, label: { en: "Curated Collections", ar: "مجموعات منسّقة" } },
      ],
      multi: true,
    },
    {
      title: { en: "Your expertise areas?", ar: "مجالات خبرتك؟" },
      subtitle: { en: "What topics do you cover?", ar: "ما المواضيع التي تغطيها؟" },
      options: [
        { key: "history", icon: Landmark, label: { en: "History & Archaeology", ar: "تاريخ وآثار" } },
        { key: "cuisine", icon: UtensilsCrossed, label: { en: "Food & Cuisine", ar: "طعام ومأكولات" } },
        { key: "crafts", icon: Palette, label: { en: "Crafts & Traditions", ar: "حرف وتقاليد" } },
        { key: "nature", icon: Leaf, label: { en: "Nature & Environment", ar: "طبيعة وبيئة" } },
        { key: "people", icon: Users, label: { en: "People & Communities", ar: "ناس ومجتمعات" } },
        { key: "architecture", icon: Building2, label: { en: "Architecture", ar: "عمارة" } },
      ],
      multi: true,
    },
  ],
  "service-provider": [
    {
      title: { en: "What experiences do you offer?", ar: "ما التجارب التي تقدمها؟" },
      subtitle: { en: "Select your experience types", ar: "اختر أنواع تجاربك" },
      options: [
        { key: "workshops", icon: Palette, label: { en: "Workshops & Classes", ar: "ورش عمل ودروس" } },
        { key: "guided-tours", icon: Compass, label: { en: "Guided Tours", ar: "جولات مرشدة" } },
        { key: "food-exp", icon: UtensilsCrossed, label: { en: "Food Experiences", ar: "تجارب طعام" } },
        { key: "nature-exp", icon: Leaf, label: { en: "Nature & Outdoor", ar: "طبيعة ونشاطات خارجية" } },
        { key: "cultural-events", icon: Music, label: { en: "Cultural Events", ar: "فعاليات ثقافية" } },
        { key: "wellness", icon: Heart, label: { en: "Wellness & Healing", ar: "صحة واستشفاء" } },
      ],
      multi: true,
    },
  ],
  "intent-host": [
    {
      title: { en: "What do you host?", ar: "بتستقبل ضيوف فين؟" },
      subtitle: { en: "Pick what fits your place", ar: "اختار اللي يوصف مكانك" },
      options: [
        { key: "room-in-home", icon: Home, label: { en: "A room in my home", ar: "غرفة في بيتي" } },
        { key: "whole-house", icon: Home, label: { en: "A whole house or flat", ar: "بيت أو شقة كاملة" } },
        { key: "guesthouse", icon: Building2, label: { en: "A guesthouse", ar: "بيت ضيافة" } },
        { key: "ecolodge", icon: Leaf, label: { en: "An eco-lodge", ar: "لودج بيئي" } },
        { key: "camp", icon: Tent, label: { en: "A camp", ar: "كامب" } },
        { key: "farm-stay", icon: Wheat, label: { en: "A farm stay", ar: "إقامة في مزرعة" } },
      ],
      multi: true,
    },
  ],
  "intent-drive": [
    {
      title: { en: "How do you drive people?", ar: "بتوصّل الناس إزاي؟" },
      subtitle: { en: "Pick what you offer", ar: "اختار اللي بتقدمه" },
      options: [
        { key: "car-with-driver", icon: Car, label: { en: "My car with me driving", ar: "عربيتي وأنا اللي بسوق" } },
        { key: "airport-transfer", icon: Bus, label: { en: "Station & airport transfers", ar: "توصيل من المحطة والمطار" } },
        { key: "day-hire", icon: Clock, label: { en: "Hire for the day", ar: "إيجار باليوم" } },
        { key: "intercity", icon: Map, label: { en: "Between towns", ar: "بين المدن" } },
        { key: "microbus", icon: Bus, label: { en: "Microbus / group", ar: "ميكروباص / مجموعات" } },
        { key: "boat", icon: Ship, label: { en: "Boat or felucca", ar: "قارب أو فلوكة" } },
      ],
      multi: true,
    },
  ],
  // No "whos-who" question set: the role is invitation-only and never selected here.

  "trip-organizer": [
    {
      title: { en: "What trips do you organize?", ar: "ما نوع الرحلات؟" },
      subtitle: { en: "Select trip styles", ar: "اختر أنماط الرحلات" },
      options: [
        { key: "day-trips", icon: Compass, label: { en: "Day Trips", ar: "رحلات يومية" } },
        { key: "multi-day", icon: Map, label: { en: "Multi-day Tours", ar: "جولات متعددة الأيام" } },
        { key: "hiking", icon: Mountain, label: { en: "Hiking & Trekking", ar: "مشي وتسلق" } },
        { key: "cultural-tours", icon: Landmark, label: { en: "Cultural Tours", ar: "جولات ثقافية" } },
        { key: "food-tours", icon: UtensilsCrossed, label: { en: "Food Tours", ar: "جولات طعام" } },
        { key: "photography-tours", icon: Camera, label: { en: "Photography Tours", ar: "جولات تصوير" } },
      ],
      multi: true,
    },
  ],
  "product-seller": [
    {
      title: { en: "What do you sell?", ar: "ماذا تبيع؟" },
      subtitle: { en: "Select product categories", ar: "اختر فئات المنتجات" },
      options: [
        { key: "textiles", icon: Palette, label: { en: "Textiles & Weaving", ar: "نسيج وحياكة" } },
        { key: "pottery", icon: Package, label: { en: "Pottery & Ceramics", ar: "فخار وسيراميك" } },
        { key: "jewelry", icon: Gem, label: { en: "Jewelry & Accessories", ar: "مجوهرات وإكسسوارات" } },
        { key: "food-products", icon: UtensilsCrossed, label: { en: "Food & Spices", ar: "طعام وتوابل" } },
        { key: "natural-products", icon: Leaf, label: { en: "Natural & Herbal", ar: "طبيعي وعشبي" } },
        { key: "woodwork", icon: Home, label: { en: "Woodwork & Furniture", ar: "أعمال خشبية وأثاث" } },
      ],
      multi: true,
    },
  ],
  "organization": [
    {
      title: { en: "What causes do you support?", ar: "ما القضايا التي تدعمها؟" },
      subtitle: { en: "Select your focus areas", ar: "اختر مجالات تركيزك" },
      options: [
        { key: "education", icon: GraduationCap, label: { en: "Education", ar: "تعليم" } },
        { key: "environment", icon: Leaf, label: { en: "Environment", ar: "بيئة" } },
        { key: "heritage-preservation", icon: Landmark, label: { en: "Heritage Preservation", ar: "حفظ التراث" } },
        { key: "women-empowerment", icon: Users, label: { en: "Women Empowerment", ar: "تمكين المرأة" } },
        { key: "community-dev", icon: Building2, label: { en: "Community Development", ar: "تنمية مجتمعية" } },
        { key: "health", icon: Heart, label: { en: "Health & Wellbeing", ar: "صحة ورفاهية" } },
      ],
      multi: true,
    },
    {
      title: { en: "What support do you need?", ar: "ما الدعم الذي تحتاجه؟" },
      subtitle: { en: "How can people help?", ar: "كيف يمكن للناس المساعدة؟" },
      options: [
        { key: "volunteers", icon: Users, label: { en: "Volunteers", ar: "متطوعين" } },
        { key: "donations", icon: HandHeart, label: { en: "Donations", ar: "تبرعات" } },
        { key: "consulting", icon: Briefcase, label: { en: "Expert Consulting", ar: "استشارات خبراء" } },
        { key: "gifts", icon: ShoppingBag, label: { en: "In-kind Gifts", ar: "هدايا عينية" } },
      ],
      multi: true,
    },
  ],
};

const topRoles = [
  { key: "visitor", icon: User, label: { en: "Visitor", ar: "زائر" }, desc: { en: "Discover rural Egypt as a traveler", ar: "اكتشف ريف مصر كمسافر" } },
  { key: "local", icon: Home, label: { en: "Local", ar: "محلي" }, desc: { en: "I live here and want to contribute", ar: "أعيش هنا وأريد المساهمة" } },
];

/**
 * Label lookup for the completion screen only — the role step itself renders
 * PROVIDER_INTENTS. `whos-who` is deliberately NOT here: it is invitation-only
 * and created by Sandal through /admin, never self-serve.
 */
const localRoles = [
  { key: "culture-actor", icon: Pen, label: { en: "Culture Actor", ar: "فاعل ثقافي" }, desc: { en: "Write, narrate audio tours, curate collections", ar: "اكتب، وسجّل جولات صوتية، ونسّق مجموعات" } },
  { key: "service-provider", icon: Briefcase, label: { en: "Service Provider", ar: "مقدم خدمة" }, desc: { en: "List experiences & activities", ar: "اعرض تجارب وأنشطة" } },

  { key: "trip-organizer", icon: Map, label: { en: "Trip Organizer", ar: "منظم رحلات" }, desc: { en: "Create & lead group trips", ar: "أنشئ وقُد رحلات جماعية" } },
  { key: "product-seller", icon: ShoppingBag, label: { en: "Product Seller", ar: "بائع منتجات" }, desc: { en: "Sell local crafts & goods", ar: "بِع حرفاً ومنتجات محلية" } },
  { key: "organization", icon: Building2, label: { en: "Organization", ar: "منظمة" }, desc: { en: "Recruit volunteers & donors", ar: "اجذب متطوعين ومتبرعين" } },
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

const travelStyles = [
  { key: "slow", icon: Clock, label: { en: "Slow & Immersive", ar: "بطيء وعميق" }, desc: { en: "Deep cultural dives, long stays", ar: "غوص ثقافي عميق وإقامات طويلة" } },
  { key: "adventure", icon: Mountain, label: { en: "Adventure & Active", ar: "مغامرة ونشاط" }, desc: { en: "Hiking, outdoor activities", ar: "مشي وأنشطة خارجية" } },
  { key: "social", icon: Users, label: { en: "Social & Community", ar: "اجتماعي ومجتمعي" }, desc: { en: "Meet locals, join events", ar: "قابل السكان المحليين وشارك في الفعاليات" } },
  { key: "explorer", icon: Globe, label: { en: "Explorer & Curious", ar: "مستكشف وفضولي" }, desc: { en: "See everything, cover more ground", ar: "شاهد كل شيء وغطِّ مساحة أكبر" } },
];

const budgetOptions = [
  { key: "budget", icon: Coins, label: { en: "Budget-Friendly", ar: "اقتصادي" }, desc: { en: "Under 500 EGP/day", ar: "أقل من ٥٠٠ ج.م/يوم" } },
  { key: "mid", icon: DollarSign, label: { en: "Mid-Range", ar: "متوسط" }, desc: { en: "500–1500 EGP/day", ar: "٥٠٠–١٥٠٠ ج.م/يوم" } },
  { key: "premium", icon: Crown, label: { en: "Premium", ar: "فاخر" }, desc: { en: "1500+ EGP/day", ar: "+١٥٠٠ ج.م/يوم" } },
  { key: "flexible", icon: Sparkles, label: { en: "Flexible", ar: "مرن" }, desc: { en: "Depends on the experience", ar: "يعتمد على التجربة" } },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const onboardingToUserRole: Record<string, UserRole> = {
  "visitor": "visitor",
  "culture-actor": "culture-actor",
  "service-provider": "service-provider",
  // whos-who is intentionally absent: it is an invitation-only, admin-created role.
  "trip-organizer": "trip-organizer",
  "product-seller": "product-seller",
  "organization": "organization",
};

const SplashPage = () => {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshRole, isProvider } = useUserRole();
  const { data: dbRegions } = useRegions();
  const { data: dbCities } = useCities();

  const [step, setStep] = useState<OnboardingStep>("splash");
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  /** Plain-language statement the person picked (see providerIntents.ts). */
  const [selectedIntent, setSelectedIntent] = useState<ProviderIntentKey | null>(null);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [selectedRoleAnswers, setSelectedRoleAnswers] = useState<Record<number, string[]>>({});
  const [roleQuestionIdx, setRoleQuestionIdx] = useState(0);
  /** True when we restored a draft saved before the sign-up redirect. */
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goTo = (next: OnboardingStep, dir = 1) => {
    setDirection(dir);
    setStep(next);
  };

  const roleDashboardPaths: Record<string, string> = {
    "culture-actor": "/dashboard/culture-actor",
    "service-provider": "/dashboard/service-provider",
    // whos-who is admin-created only (see useUserRole.tsx) — never reached here.
    "organization": "/dashboard/organization",
    "product-seller": "/dashboard/product-seller",
    "trip-organizer": "/dashboard/trip-organizer",
  };

  const persistPersonalization = async () => {
    // localStorage stays for anonymous/offline use; the DB is the source of
    // truth once the visitor is signed in.
    if (selectedInterests.length > 0) localStorage.setItem("sandal-interests", JSON.stringify(selectedInterests));
    if (selectedStyle) localStorage.setItem("sandal-travel-style", selectedStyle);
    if (selectedBudget) localStorage.setItem("sandal-budget", selectedBudget);
    if (selectedCities.length > 0) localStorage.setItem("sandal-cities", JSON.stringify(selectedCities));
    localStorage.setItem("sandal-onboarded", "true");

    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        interests: selectedInterests.length ? selectedInterests : null,
        travel_style: selectedStyle,
        budget: selectedBudget,
        cities: selectedCities.length ? selectedCities : null,
      })
      .eq("user_id", user.id);
  };

  /** Flatten the role-specific quiz answers into a specialties list. */
  const roleAnswerKeys = () =>
    Object.values(selectedRoleAnswers).flat().filter(Boolean);

  /** Readable labels for the same answers — used to seed satellite profiles. */
  /** Which question set to ask: the intent's own set when there is one. */
  const questionsKey = getProviderIntent(selectedIntent)?.questions || selectedRole || "";

  const roleAnswerLabels = () => {
    if (!questionsKey) return [];
    const questions = roleQuestions[questionsKey] || [];
    const keys = new Set(roleAnswerKeys());
    return questions
      .flatMap((q) => q.options)
      .filter((o) => keys.has(o.key))
      .map((o) => o.label.en);
  };

  const narratedLanguages = () => {
    const map: Record<string, string> = {
      "narrate-ar": "Arabic",
      "narrate-en": "English",
      "narrate-fr": "French",
      "narrate-de": "German",
    };
    const langs = roleAnswerKeys().map((k) => map[k]).filter(Boolean);
    return langs.length ? langs.join(", ") : null;
  };

  // Sandal supports one role per account: if the signed-in user already has a
  // different role we surface this confirmation instead of overwriting.
  const [roleConflict, setRoleConflict] = useState<
    { nextRole: LocalRole; currentRole: LocalRole } | null
  >(null);


  const completeProvider = async (
    role: LocalRole,
    withDetails = true,
    force = false
  ): Promise<"ok" | "failed" | "role-exists"> => {
    let avatarUrl: string | null = null;
    if (withDetails && avatarFiles.length > 0 && user) {
      try {
        const [url] = await uploadImages(avatarFiles, user.id, "profile-photos");
        avatarUrl = url ?? null;
      } catch {
        toast.error(lang === "ar" ? "تعذّر تحميل الصورة" : "Could not upload your photo");
      }
    }

    const city = selectedCities[0] ? citiesList.find((c) => c.id === selectedCities[0]) : null;
    const region = selectedRegion ? regionsList.find((r) => r.id === selectedRegion) : null;

    const result = await becomeProvider(
      role,
      withDetails
        ? {
            nameEn: name,
            nameAr,
            bioEn: bio,
            cityEn: city?.name_en ?? null,
            cityAr: city?.name_ar ?? null,
            cityId: city?.id ?? null,
            regionEn: region?.name_en ?? null,
            regionAr: region?.name_ar ?? null,
            regionId: region?.id ?? city?.region_id ?? null,
            avatar: avatarUrl,
            specialties: roleAnswerKeys(),
            answerLabels: roleAnswerLabels(),
            languages: narratedLanguages(),
            whatsapp: whatsapp.trim() || null,
          }
        : undefined,
      { force }
    );

    if (result.status === "role-exists") {
      setRoleConflict({ nextRole: role, currentRole: result.currentRole });
      return "role-exists";
    }

    if (result.status === "error") {
      console.error("becomeProvider failed:", result.error);
      // Never lose the typed form: we only toast and return, so name/bio/photo
      // and the quiz answers all stay in state for another attempt.
      toast.error(providerErrorMessage(result.error, lang));
      return "failed";
    }

    // The role works, but the public directory row failed — say so instead of
    // pretending everything succeeded.
    if (result.satelliteError) {
      toast.error(
        lang === "ar"
          ? "تم إنشاء حسابك لكن تعذّر إنشاء ملفك العام. حدّثه من تعديل الملف الشخصي."
          : "Your account was created but your public directory profile failed. Update it from Edit Profile."
      );
    }

    // The draft has served its purpose.
    clearOnboardingDraft();
    return "ok";
  };

  /** Explicit confirmation of a role switch — the only path that overwrites. */
  const confirmRoleSwitch = async () => {
    if (!roleConflict) return;
    const { nextRole } = roleConflict;
    setRoleConflict(null);
    const status = await completeProvider(nextRole, true, true);
    if (status !== "ok") return;
    await persistPersonalization();
    await refreshRole();
    const landing = getProviderIntent(selectedIntent)?.landing;
    navigate(landing || roleDashboardPaths[nextRole] || "/");
  };

  /**
   * Restore an onboarding draft saved before the sign-up redirect. We REHYDRATE
   * the form and drop the person back on the profile step to confirm — we never
   * auto-create a provider behind their back, which is how the old code shipped
   * providers named after an email prefix with no bio, city or photo.
   */
  useEffect(() => {
    if (restoredDraft) return;
    const draft = loadOnboardingDraft(user?.id ?? null);
    if (!draft) return;

    setSelectedRole(draft.role);
    setSelectedRegion(draft.region);
    setSelectedCities(draft.cities || []);
    setSelectedInterests(draft.interests || []);
    setSelectedStyle(draft.travelStyle);
    setSelectedBudget(draft.budget);
    setName(draft.name || "");
    setNameAr(draft.nameAr || "");
    setBio(draft.bio || "");
    setWhatsapp(draft.whatsapp || "");
    setSelectedIntent((draft.intent as ProviderIntentKey | null) ?? null);
    setSelectedRoleAnswers(draft.roleAnswers || {});
    if (draft.avatarDataUrl) {
      const file = dataUrlToFile(draft.avatarDataUrl);
      if (file) setAvatarFiles([file]);
    }
    setRestoredDraft(true);
    setStep("profile");
    sessionStorage.removeItem("sandal-pending-role");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const handleFinish = async () => {
    const mappedRole = selectedRole ? (onboardingToUserRole[selectedRole] || "visitor") : "visitor";

    // Visitor: no provider profile needed.
    if (mappedRole === "visitor") {
      await persistPersonalization();
      navigate("/");
      return;
    }

    // Provider role requires authentication so we can write the providers row.
    // Everything typed so far is persisted first so nothing is lost in the
    // round-trip through sign-up.
    if (!user) {
      setSubmitting(true);
      const avatarDataUrl = avatarFiles[0] ? await fileToCompactDataUrl(avatarFiles[0]) : null;
      saveOnboardingDraft({
        forUserId: null,
        role: selectedRole || mappedRole,
        intent: selectedIntent,
        lang: lang === "ar" ? "ar" : "en",
        name,
        nameAr,
        bio,
        whatsapp,
        region: selectedRegion,
        cities: selectedCities,
        interests: selectedInterests,
        travelStyle: selectedStyle,
        budget: selectedBudget,
        roleAnswers: selectedRoleAnswers,
        avatarDataUrl,
      });
      sessionStorage.setItem("sandal-pending-role", mappedRole);
      setSubmitting(false);
      toast.message(
        lang === "ar"
          ? "أنشئ حسابك لإكمال التسجيل — بياناتك محفوظة"
          : "Create your account to finish — your details are saved"
      );
      navigate(`/signup?next=${encodeURIComponent("/welcome")}`);
      return;
    }

    setSubmitting(true);
    const status = await completeProvider(mappedRole as LocalRole);
    setSubmitting(false);
    if (status !== "ok") return;

    await persistPersonalization();
    await refreshRole();
    const landing = getProviderIntent(selectedIntent)?.landing;
    navigate(landing || roleDashboardPaths[mappedRole] || "/");
  };

  const handleGuestMode = () => {
    localStorage.setItem("sandal-onboarded", "true");
    navigate("/");
  };

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

  // Build city list from database
  const regionsList = dbRegions || [];
  const citiesList = dbCities || [];
  const filteredCities = selectedRegion
    ? citiesList.filter(c => c.region_id === selectedRegion)
    : citiesList;

  // Progress indicator for visitor quiz
  const visitorSteps = ["interests", "travelStyle", "budget"] as const;
  const currentVisitorStep = visitorSteps.indexOf(step as any);

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
              <button
                onClick={handleGuestMode}
                className="mt-3 text-sm text-primary-foreground/80 underline underline-offset-4"
              >
                {lang === "ar" ? "المتابعة كضيف" : "Continue as guest"}
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

        {/* STEP 3b: Local Role Selection (8 cards) */}
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
                  {lang === "ar" ? "إنت بتعمل إيه؟" : "What do you do?"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "اختار الجملة اللي تشبهك" : "Pick the line that sounds like you"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-1 gap-2.5">
                {PROVIDER_INTENTS.map((intent) => {
                  const Icon = intent.icon;
                  return (
                    <button
                      key={intent.key}
                      onClick={() => {
                        setSelectedIntent(intent.key);
                        rememberProviderIntent(intent.key);
                        setSelectedRole(intent.role);
                        setRoleQuestionIdx(0);
                        setSelectedRoleAnswers({});
                        if (roleQuestions[intent.questions]) {
                          goTo("roleDetails");
                        } else {
                          goTo("city");
                        }
                      }}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-start border-border bg-card hover:border-primary/30 min-h-[64px]"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary text-secondary-foreground">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{intent.statement[lang]}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{intent.sub[lang]}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ms-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3c: Role-specific Questions */}
        {step === "roleDetails" && questionsKey && roleQuestions[questionsKey] && (() => {
          const questions = roleQuestions[questionsKey];
          const currentQ = questions[roleQuestionIdx];
          if (!currentQ) return null;
          const currentAnswers = selectedRoleAnswers[roleQuestionIdx] || [];

          const toggleAnswer = (key: string) => {
            setSelectedRoleAnswers(prev => {
              const curr = prev[roleQuestionIdx] || [];
              if (currentQ.multi === false) {
                return { ...prev, [roleQuestionIdx]: [key] };
              }
              return {
                ...prev,
                [roleQuestionIdx]: curr.includes(key) ? curr.filter(k => k !== key) : [...curr, key],
              };
            });
          };

          const handleNext = () => {
            if (roleQuestionIdx < questions.length - 1) {
              setRoleQuestionIdx(roleQuestionIdx + 1);
            } else {
              goTo("city");
            }
          };

          const handleBack = () => {
            if (roleQuestionIdx > 0) {
              setRoleQuestionIdx(roleQuestionIdx - 1);
            } else {
              goTo("localRole", -1);
            }
          };

          return (
            <motion.div
              key={`roleDetails-${roleQuestionIdx}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-screen bg-background flex flex-col"
            >
              <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <button onClick={handleBack} className="p-1.5 rounded-full hover:bg-secondary">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-foreground">{currentQ.title[lang]}</h1>
                  <p className="text-xs text-muted-foreground">{currentQ.subtitle[lang]}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {roleQuestionIdx + 1}/{questions.length}
                </span>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options.map(({ key, icon: Icon, label }) => {
                    const isSelected = currentAnswers.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleAnswer(key)}
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
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-4 border-t border-border bg-background space-y-2">
                <button
                  onClick={handleNext}
                  disabled={currentAnswers.length === 0}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {roleQuestionIdx < questions.length - 1
                    ? (lang === "ar" ? "التالي" : "Next")
                    : (lang === "ar" ? "التالي" : "Continue")
                  }
                </button>
                <button
                  onClick={handleNext}
                  className="w-full py-2 text-xs text-muted-foreground font-medium"
                >
                  {lang === "ar" ? "تخطي" : "Skip"}
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* STEP 4: City Selection (from database) */}
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
              <button onClick={() => {
                if (selectedRole === "visitor") {
                  goTo("role", -1);
                } else {
                  const questions = roleQuestions[selectedRole!];
                  if (questions && questions.length > 0) {
                    setRoleQuestionIdx(questions.length - 1);
                    goTo("roleDetails", -1);
                  } else {
                    goTo("localRole", -1);
                  }
                }
              }} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {selectedRole === "visitor"
                    ? (lang === "ar" ? "أي مدن تريد استكشافها؟" : "Cities to Explore")
                    : (lang === "ar" ? "أين تعمل؟" : "Where Are You Based?")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {selectedRole === "visitor"
                    ? (lang === "ar" ? "اختر المدن التي تهمك" : "Pick cities you'd like to visit")
                    : (lang === "ar" ? "اختر المدن التي تقدم خدماتك فيها" : "Select cities where you operate")}
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
              {regionsList.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === r.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {r.emoji} {lang === "ar" ? (r.name_ar || r.name_en) : r.name_en}
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
                      <span className="text-sm font-medium text-foreground truncate">
                        {lang === "ar" ? (city.name_ar || city.name_en) : city.name_en}
                      </span>
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
                onClick={() => goTo(selectedRole === "visitor" ? "interests" : "profile")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
              >
                {selectedCities.length > 0
                  ? `${lang === "ar" ? "التالي" : "Continue"} (${selectedCities.length})`
                  : lang === "ar" ? "التالي" : "Continue"
                }
              </button>
              <button
                onClick={() => goTo(selectedRole === "visitor" ? "interests" : "profile")}
                className="w-full py-2 text-xs text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5a: Interests (Visitor Quiz 1/3) */}
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
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "ما يهمك" : "What Interests You?"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "اختر ٣ أو أكثر لتخصيص تجربتك" : "Pick 3+ to personalize your feed"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">1/3</span>
            </header>

            {/* Progress bar */}
            <div className="h-1 bg-secondary">
              <div className="h-1 bg-primary transition-all" style={{ width: "33%" }} />
            </div>

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
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={() => goTo("travelStyle")}
                disabled={selectedInterests.length < 3}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === "ar" ? "التالي" : "Continue"} ({selectedInterests.length}/3+)
              </button>
              <button
                onClick={() => goTo("travelStyle")}
                className="w-full py-2 text-xs text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5b: Travel Style (Visitor Quiz 2/3) */}
        {step === "travelStyle" && (
          <motion.div
            key="travelStyle"
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
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "أسلوب سفرك" : "Your Travel Style"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "كيف تحب أن تسافر؟" : "How do you like to travel?"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">2/3</span>
            </header>

            <div className="h-1 bg-secondary">
              <div className="h-1 bg-primary transition-all" style={{ width: "66%" }} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-3">
                {travelStyles.map(({ key, icon: Icon, label, desc }) => {
                  const isSelected = selectedStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStyle(key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-start ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-card"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{label[lang]}</p>
                        <p className="text-xs text-muted-foreground">{desc[lang]}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={() => goTo("budget")}
                disabled={!selectedStyle}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === "ar" ? "التالي" : "Continue"}
              </button>
              <button
                onClick={() => goTo("budget")}
                className="w-full py-2 text-xs text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي" : "Skip"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5c: Budget (Visitor Quiz 3/3) */}
        {step === "budget" && (
          <motion.div
            key="budget"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-background flex flex-col"
          >
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => goTo("travelStyle", -1)} className="p-1.5 rounded-full hover:bg-secondary">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "ميزانيتك" : "Your Budget"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "كم تخطط لإنفاقه يومياً؟" : "How much do you plan to spend daily?"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">3/3</span>
            </header>

            <div className="h-1 bg-secondary">
              <div className="h-1 bg-primary transition-all" style={{ width: "100%" }} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-3">
                {budgetOptions.map(({ key, icon: Icon, label, desc }) => {
                  const isSelected = selectedBudget === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedBudget(key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-start ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-card"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{label[lang]}</p>
                        <p className="text-xs text-muted-foreground">{desc[lang]}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={() => goTo("profile")}
                disabled={!selectedBudget}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lang === "ar" ? "التالي" : "Continue"}
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
              <button onClick={() => goTo(selectedRole === "visitor" ? "budget" : "city", -1)} className="p-1.5 rounded-full hover:bg-secondary">
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
              {restoredDraft && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">
                    {lang === "ar"
                      ? "استعدنا ما أدخلته قبل إنشاء الحساب. راجع بياناتك ثم أكمل."
                      : "We restored what you entered before signing up. Check it and continue."}
                  </p>
                </div>
              )}

              {/* Avatar */}
              <div className="max-w-xs mx-auto w-full">
                <PhotoPicker
                  files={avatarFiles}
                  onChange={setAvatarFiles}
                  max={1}
                  hint={lang === "ar" ? "إضافة صورة" : "Add Photo"}
                />
              </div>

              {/* Name — the field in the user's own language is the primary one. */}
              {lang === "ar" ? (
                <>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      الاسم بالعربية
                    </label>
                    <input
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      dir="rtl"
                      placeholder="أدخل اسمك"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      الاسم بالإنجليزية (اختياري)
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      dir="ltr"
                      placeholder="Your name in English"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Arabic name (optional)
                    </label>
                    <input
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      dir="rtl"
                      placeholder="اسمك بالعربية"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </>
              )}

              {/* Short bio — optional */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "نبذة قصيرة (اختياري)" : "Short bio (optional)"}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={lang === "ar" ? "اكتب سطرين عن نفسك" : "A line or two about yourself"}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* WhatsApp — optional, but the number locals are actually reached on. */}
              {selectedRole && selectedRole !== "visitor" && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <label className="text-sm font-semibold text-foreground block mb-1">
                    {lang === "ar" ? "رقم واتساب (اختياري)" : "WhatsApp number (optional)"}
                  </label>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {lang === "ar"
                      ? "الزوار بيتواصلوا على واتساب بعد تأكيد الحجز أو الأوردر. سيبه فاضي لو مش عايز."
                      : "Visitors reach you on WhatsApp once a booking or order is confirmed. Leave it empty if you prefer."}
                  </p>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    dir="ltr"
                    inputMode="tel"
                    placeholder={lang === "ar" ? "رقم الواتساب" : "WhatsApp number"}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {whatsapp.trim() !== "" && !isPlausibleWhatsapp(whatsapp) && (
                    <p className="text-xs text-destructive mt-1.5">
                      {lang === "ar"
                        ? "الرقم قصير أوي — راجعه."
                        : "That does not look like a phone number — check it."}
                    </p>
                  )}
                </div>
              )}

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
                      {getProviderIntent(selectedIntent)?.statement[lang]
                        || allRoles.find(r => r.key === selectedRole)?.label[lang]}
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
                          const city = citiesList.find(c => c.id === id);
                          return city ? (lang === "ar" ? (city.name_ar || city.name_en) : city.name_en) : id;
                        }).join(", ")}
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

                {/* Travel Style */}
                {selectedStyle && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "أسلوبك" : "Your style"}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {travelStyles.find(s => s.key === selectedStyle)?.label[lang]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {selectedBudget && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "ميزانيتك" : "Your budget"}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {budgetOptions.find(b => b.key === selectedBudget)?.label[lang]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border bg-background space-y-2">
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="w-full min-h-[48px] py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-60"
              >
                {submitting
                  ? lang === "ar" ? "جارٍ الحفظ…" : "Saving…"
                  : selectedRole && selectedRole !== "visitor"
                  ? lang === "ar" ? "إنشاء ملفي" : "Create my profile"
                  : lang === "ar" ? "ابدأ الاستكشاف" : "Start Exploring"}
              </button>
              <button
                onClick={handleGuestMode}
                className="w-full min-h-[44px] py-2.5 text-sm text-muted-foreground font-medium"
              >
                {lang === "ar" ? "تخطي الآن" : "Skip for now"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {roleConflict && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-elevated">
            <h2 className="text-base font-bold text-foreground">
              {lang === "ar" ? "هذا الحساب مسجَّل بالفعل" : "This account already has a role"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? `حسابك مسجَّل حاليًا بصفة «${roleLabels[roleConflict.currentRole].ar}». يدعم سندال دورًا واحدًا لكل حساب حاليًا، لذا التحويل إلى «${roleLabels[roleConflict.nextRole].ar}» سيستبدل دورك الحالي. سيتم إخفاء ملفك العام السابق (وليس حذفه).`
                : `Your account is currently registered as a ${roleLabels[roleConflict.currentRole].en}. Sandal supports one role per account today, so switching to ${roleLabels[roleConflict.nextRole].en} will replace your current role. Your previous public profile will be unpublished, not deleted.`}
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  const path = roleDashboardPaths[roleConflict.currentRole] || "/";
                  setRoleConflict(null);
                  navigate(path);
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
              >
                {lang === "ar" ? "الذهاب إلى لوحتي الحالية" : "Go to my current dashboard"}
              </button>
              <button
                onClick={confirmRoleSwitch}
                className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-foreground"
              >
                {lang === "ar"
                  ? `نعم، حوّلني إلى «${roleLabels[roleConflict.nextRole].ar}»`
                  : `Yes, switch me to ${roleLabels[roleConflict.nextRole].en}`}
              </button>
              <button
                onClick={() => setRoleConflict(null)}
                className="w-full py-2.5 text-sm text-muted-foreground font-medium"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default SplashPage;
