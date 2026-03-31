import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Upload, Plus, Trash2, Clock, Users, MapPin, DollarSign, Tag, FileText, Image, ListChecks } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { en: "Nature & Outdoors", ar: "طبيعة وهواء طلق" },
  { en: "Food & Cooking", ar: "طعام وطبخ" },
  { en: "History & Heritage", ar: "تاريخ وتراث" },
  { en: "Arts & Crafts", ar: "فنون وحرف" },
  { en: "Adventure & Sports", ar: "مغامرة ورياضة" },
  { en: "Spiritual & Wellness", ar: "روحانية وعافية" },
  { en: "Community & Volunteering", ar: "مجتمع وتطوع" },
];

const NewExperience = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    groupSize: "",
    price: "",
    location: "",
    meetingPoint: "",
    includes: [""],
    itinerary: [{ step: "" }],
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const updateListItem = (key: "includes", idx: number, value: string) => {
    setForm((p) => {
      const arr = [...p[key]];
      arr[idx] = value;
      return { ...p, [key]: arr };
    });
  };

  const addListItem = (key: "includes") => {
    setForm((p) => ({ ...p, [key]: [...p[key], ""] }));
  };

  const removeListItem = (key: "includes", idx: number) => {
    setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };

  const updateItineraryStep = (idx: number, value: string) => {
    setForm((p) => {
      const arr = [...p.itinerary];
      arr[idx] = { step: value };
      return { ...p, itinerary: arr };
    });
  };

  const addItineraryStep = () => {
    setForm((p) => ({ ...p, itinerary: [...p.itinerary, { step: "" }] }));
  };

  const removeItineraryStep = (idx: number) => {
    setForm((p) => ({ ...p, itinerary: p.itinerary.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء التجربة بنجاح!" : "Experience created successfully!");
    navigate("/dashboard/service-provider");
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      {/* Header */}
      <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "تجربة جديدة" : "New Experience"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Photo Upload */}
        <div>
          <label className={labelClass}>
            <Image className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "صور التجربة" : "Experience Photos"}
          </label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "اسحب الصور أو اضغط للرفع" : "Drag photos or tap to upload"}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "حتى ٥ صور (الأولى هي الغلاف)" : "Up to 5 photos (first is cover)"}</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "عنوان التجربة *" : "Experience Title *"}
          </label>
          <input
            className={inputClass}
            placeholder={lang === "ar" ? "مثال: مراقبة الطيور في بحيرة المنزلة" : "e.g. Bird Watching in Manzala Lake"}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "الوصف *" : "Description *"}
          </label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder={lang === "ar" ? "اوصف تجربتك بالتفصيل..." : "Describe your experience in detail..."}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1000}
          />
          <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.description.length}/1000</span>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>
            <Tag className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "الفئة *" : "Category *"}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => set("category", cat.en)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.category === cat.en
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {lang === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Group Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              <Clock className="w-3.5 h-3.5 text-role-service-provider" />
              {lang === "ar" ? "المدة (ساعات)" : "Duration (hours)"}
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="3"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              min="0.5"
              max="48"
            />
          </div>
          <div>
            <label className={labelClass}>
              <Users className="w-3.5 h-3.5 text-role-service-provider" />
              {lang === "ar" ? "حجم المجموعة" : "Max Group Size"}
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="10"
              value={form.groupSize}
              onChange={(e) => set("groupSize", e.target.value)}
              min="1"
              max="100"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className={labelClass}>
            <DollarSign className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "السعر للفرد (ج.م) *" : "Price per person (EGP) *"}
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="350"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            min="0"
          />
        </div>

        {/* Location & Meeting Point */}
        <div>
          <label className={labelClass}>
            <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "الموقع" : "Location"}
          </label>
          <input
            className={inputClass}
            placeholder={lang === "ar" ? "مثال: رشيد، البحيرة" : "e.g. Rosetta, Beheira"}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <label className={labelClass}>
            <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "نقطة الالتقاء" : "Meeting Point"}
          </label>
          <input
            className={inputClass}
            placeholder={lang === "ar" ? "مثال: أمام مسجد أبو مندور" : "e.g. In front of Abu Mandour Mosque"}
            value={form.meetingPoint}
            onChange={(e) => set("meetingPoint", e.target.value)}
            maxLength={200}
          />
        </div>

        {/* What's Included */}
        <div>
          <label className={labelClass}>
            <ListChecks className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "ما يشمله السعر" : "What's Included"}
          </label>
          <div className="space-y-2">
            {form.includes.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  placeholder={lang === "ar" ? "مثال: غداء تقليدي" : "e.g. Traditional lunch"}
                  value={item}
                  onChange={(e) => updateListItem("includes", i, e.target.value)}
                  maxLength={100}
                />
                {form.includes.length > 1 && (
                  <button onClick={() => removeListItem("includes", i)} className="p-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addListItem("includes")} className="flex items-center gap-1 text-xs font-medium text-role-service-provider">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة عنصر" : "Add item"}
            </button>
          </div>
        </div>

        {/* Itinerary */}
        <div>
          <label className={labelClass}>
            <ListChecks className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "خطة الرحلة" : "Itinerary Steps"}
          </label>
          <div className="space-y-2">
            {form.itinerary.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-role-service-provider text-white flex items-center justify-center text-[10px] font-bold mt-2.5 shrink-0">{i + 1}</span>
                <input
                  className={`${inputClass} flex-1`}
                  placeholder={lang === "ar" ? "وصف الخطوة..." : "Describe this step..."}
                  value={item.step}
                  onChange={(e) => updateItineraryStep(i, e.target.value)}
                  maxLength={200}
                />
                {form.itinerary.length > 1 && (
                  <button onClick={() => removeItineraryStep(i)} className="p-2 text-destructive mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addItineraryStep()} className="flex items-center gap-1 text-xs font-medium text-role-service-provider ml-8">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة خطوة" : "Add step"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-role-service-provider text-white rounded-xl py-4 font-bold text-sm mt-4"
        >
          {lang === "ar" ? "نشر التجربة" : "Publish Experience"}
        </button>
      </div>
    </div>
  );
};

export default NewExperience;
