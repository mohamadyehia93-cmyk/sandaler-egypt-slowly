import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchOwnedExperience, generateSlotDrafts } from "@/lib/experienceSlots";
import { daysOfWeek } from "@/components/experience-wizard/types";

import { ArrowLeft, CalendarPlus, Clock, Plus, Trash2, Users, Wand2, Check, X } from "lucide-react";
import { toast } from "sonner";

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  price: number;
  spots_available: number;
};

const inputClass =
  "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-[11px] font-semibold text-foreground mb-1 block";

const ExperienceSlots = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // single-slot form
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [price, setPrice] = useState("");
  const [spots, setSpots] = useState("10");

  // bulk generator
  const [showBulk, setShowBulk] = useState(false);
  const [bulkDays, setBulkDays] = useState<string[]>([]);
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["owned-experience", id, user?.id],
    enabled: !authLoading,
    queryFn: () => fetchOwnedExperience(id, user?.id),
  });

  const experience = access?.state === "ok" ? access.experience : null;

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["manage-slots", id],
    enabled: !!experience,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_slots")
        .select("id, slot_date, start_time, end_time, price, spots_available")
        .eq("experience_id", id)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Slot[];
    },
  });

  // Booked counts per slot so a slot with bookings is never silently removed.
  const { data: bookedBySlot = {} } = useQuery({
    queryKey: ["slot-bookings", id],
    enabled: !!experience,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("slot_id, guests, status")
        .eq("experience_id", id);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((b) => {
        if (!b.slot_id) return;
        if (["cancelled", "declined", "expired", "refunded"].includes(b.status)) return;
        map[b.slot_id] = (map[b.slot_id] ?? 0) + (b.guests ?? 0);
      });
      return map;
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setStartTime("09:00");
    setEndTime("12:00");
    setPrice("");
    setSpots("10");
  };

  const startEdit = (s: Slot) => {
    setEditingId(s.id);
    setDate(s.slot_date);
    setStartTime(s.start_time?.slice(0, 5) ?? "09:00");
    setEndTime(s.end_time?.slice(0, 5) ?? "12:00");
    setPrice(String(s.price ?? ""));
    setSpots(String(s.spots_available ?? 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["manage-slots", id] });
    queryClient.invalidateQueries({ queryKey: ["experience-slots", id] });
  };

  const saveSlot = async () => {
    if (!date) {
      toast.error(ar ? "اختر التاريخ" : "Pick a date");
      return;
    }
    const payload = {
      experience_id: id,
      slot_date: date,
      start_time: startTime,
      end_time: endTime,
      price: parseInt(price) || experience?.price || 0,
      spots_available: parseInt(spots) || 0,
    };
    setBusy(true);
    const { error } = editingId
      ? await supabase.from("experience_slots").update(payload).eq("id", editingId)
      : await supabase.from("experience_slots").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? (ar ? "تم تحديث الموعد" : "Slot updated") : (ar ? "تمت إضافة الموعد" : "Slot added"));
    resetForm();
    refresh();
  };

  const removeSlot = async (s: Slot) => {
    const booked = bookedBySlot[s.id] ?? 0;
    if (booked > 0) {
      toast.error(
        ar
          ? `لا يمكن حذف هذا الموعد: يوجد ${booked} ضيف محجوز. ألغِ الحجوزات أولاً.`
          : `Cannot delete this slot: ${booked} guest(s) are booked on it. Cancel those bookings first.`
      );
      return;
    }
    if (!window.confirm(ar ? "حذف هذا الموعد؟" : "Delete this slot?")) return;
    setBusy(true);
    const { error } = await supabase.from("experience_slots").delete().eq("id", s.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? "تم الحذف" : "Deleted");
    refresh();
  };

  const runBulk = async () => {
    const drafts = generateSlotDrafts({
      days: bulkDays,
      startTime,
      endTime,
      from: bulkFrom,
      to: bulkTo,
      price: parseInt(price) || experience?.price || 0,
      spots: parseInt(spots) || 0,
    });
    if (!drafts.length) {
      toast.error(ar ? "اختر أيامًا ونطاق تاريخ صحيحًا" : "Pick weekdays and a valid date range");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("experience_slots")
      .insert(drafts.map((d) => ({ ...d, experience_id: id })));
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? `تم إنشاء ${drafts.length} موعدًا` : `${drafts.length} slots created`);
    setShowBulk(false);
    setBulkDays([]);
    refresh();
  };

  const header = (
    <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
      <button onClick={() => navigate(-1)} className="p-1" aria-label={ar ? "رجوع" : "Back"}>
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight">{ar ? "إدارة المواعيد" : "Manage availability"}</h1>
        {experience && (
          <p className="text-[11px] opacity-80 line-clamp-1">{ar ? experience.title_ar : experience.title_en}</p>
        )}
      </div>
    </header>
  );

  // Clear terminal states — never an endless spinner.
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-surface">
        {header}
        <p className="text-center text-sm text-muted-foreground px-6 py-16">
          {ar ? "يرجى تسجيل الدخول لإدارة مواعيد تجربتك." : "Please sign in to manage this listing's availability."}
        </p>
      </div>
    );
  }

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-surface">
        {header}
        <p className="text-center text-sm text-muted-foreground px-6 py-16">{ar ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  if (!experience) {
    const msg =
      access?.state === "not-provider"
        ? ar
          ? "لا يوجد ملف مزود خدمة لحسابك."
          : "Your account has no provider profile yet."
        : access?.state === "not-owner"
        ? ar
          ? "هذه التجربة ليست ملكك، لذلك لا يمكنك إدارة مواعيدها."
          : "This listing is not yours, so you cannot manage its availability."
        : ar
        ? "لم يتم العثور على هذه التجربة."
        : "This listing could not be found.";
    return (
      <div className="min-h-screen bg-surface">
        {header}
        <p className="text-center text-sm text-muted-foreground px-6 py-16">{msg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {header}

      <div className="px-4 py-4 space-y-4">
        {/* Add / edit one slot */}
        <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-role-service-provider" />
            {editingId ? (ar ? "تعديل موعد" : "Edit slot") : ar ? "إضافة موعد" : "Add a slot"}
          </h2>
          <div>
            <label className={labelClass}>{ar ? "التاريخ" : "Date"}</label>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{ar ? "من" : "Start"}</label>
              <input type="time" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{ar ? "إلى" : "End"}</label>
              <input type="time" className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{ar ? "السعر للفرد (ج.م)" : "Price per guest (EGP)"}</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={price}
                placeholder={String(experience.price ?? 0)}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "الأماكن المتاحة" : "Spots available"}</label>
              <input type="number" min="0" className={inputClass} value={spots} onChange={(e) => setSpots(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveSlot}
              disabled={busy}
              className="flex-1 bg-role-service-provider text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? (ar ? "حفظ" : "Save") : ar ? "إضافة" : "Add"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 rounded-xl border border-border text-sm font-medium text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowBulk((v) => !v)}
            className="w-full text-[12px] font-semibold text-role-service-provider flex items-center justify-center gap-1.5 pt-1"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {ar ? "إنشاء مواعيد لموسم كامل" : "Generate a season of slots"}
          </button>

          {showBulk && (
            <div className="border-t border-border pt-3 space-y-3">
              <p className="text-[11px] text-muted-foreground">
                {ar
                  ? "يستخدم الوقت والسعر والأماكن من الأعلى، ويكرّرها على الأيام المختارة."
                  : "Uses the time, price and spots above, repeated on the weekdays you pick."}
              </p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((d) => (
                  <button
                    key={d.en}
                    onClick={() =>
                      setBulkDays((prev) => (prev.includes(d.en) ? prev.filter((x) => x !== d.en) : [...prev, d.en]))
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      bulkDays.includes(d.en)
                        ? "bg-role-service-provider text-white border-role-service-provider"
                        : "bg-card text-foreground border-border"
                    }`}
                  >
                    {ar ? d.ar : d.en}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{ar ? "من تاريخ" : "From"}</label>
                  <input type="date" className={inputClass} value={bulkFrom} onChange={(e) => setBulkFrom(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>{ar ? "إلى تاريخ" : "To"}</label>
                  <input type="date" className={inputClass} value={bulkTo} onChange={(e) => setBulkTo(e.target.value)} />
                </div>
              </div>
              <button
                onClick={runBulk}
                disabled={busy}
                className="w-full bg-role-service-provider/10 text-role-service-provider rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {ar ? "إنشاء المواعيد" : "Generate slots"}
              </button>
            </div>
          )}
        </div>

        {/* Existing slots */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-role-service-provider" />
            {ar ? "المواعيد المنشورة" : "Published availability"}
            <span className="text-[11px] font-normal text-muted-foreground">({slots.length})</span>
          </h2>
          {slotsLoading ? (
            <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              {ar
                ? "لا توجد مواعيد بعد. الزوار يمكنهم إرسال طلب حجز، لكن بدون مواعيد لا يوجد جدول للاختيار منه."
                : "No slots yet. Visitors can still send a booking request, but without slots there is no schedule to choose from."}
            </p>
          ) : (
            slots.map((s) => {
              const booked = bookedBySlot[s.id] ?? 0;
              return (
                <div key={s.id} className="py-2.5 border-b border-border last:border-0 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(`${s.slot_date}T00:00:00`).toLocaleDateString(ar ? "ar-EG" : "en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {s.price} {ar ? "ج.م" : "EGP"} · <Users className="w-3 h-3" /> {s.spots_available}{" "}
                      {ar ? "مكان" : "spots"}
                      {booked > 0 && (
                        <span className="text-role-service-provider font-semibold">
                          · {booked} {ar ? "محجوز" : "booked"}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(s)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-role-service-provider/10 text-role-service-provider"
                  >
                    {ar ? "تعديل" : "Edit"}
                  </button>
                  <button
                    onClick={() => removeSlot(s)}
                    disabled={busy}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive disabled:opacity-50"
                    aria-label={ar ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSlots;
