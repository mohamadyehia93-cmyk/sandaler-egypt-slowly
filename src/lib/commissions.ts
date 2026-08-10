// Commissions: a culture actor is not bookable. The transaction is an INVITATION
// to contribute a piece. Money is agreed off-platform — no payment is ever taken,
// held or guaranteed by Sandal. Never label the fee as paid or escrowed.

export const COMMISSION_KINDS = [
  { value: "article", en: "Article", ar: "مقال" },
  { value: "audio_narration", en: "Audio narration", ar: "تعليق صوتي" },
  { value: "photo_essay", en: "Photo essay", ar: "مقال مصور" },
  { value: "research", en: "Research", ar: "بحث" },
  { value: "talk", en: "Talk", ar: "محاضرة" },
  { value: "other", en: "Other", ar: "أخرى" },
] as const;

export const commissionKindLabel = (kind: string, ar: boolean) =>
  COMMISSION_KINDS.find((k) => k.value === kind)?.[ar ? "ar" : "en"] ?? kind;

export const commissionStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "بانتظار الرد" : "Pending";
    case "accepted": return ar ? "مقبولة" : "Accepted";
    case "declined": return ar ? "مرفوضة" : "Declined";
    case "delivered": return ar ? "تم التسليم" : "Delivered";
    case "completed": return ar ? "مكتملة" : "Completed";
    case "cancelled": return ar ? "ملغاة" : "Cancelled";
    default: return status;
  }
};

export const commissionStatusClasses = (status: string) => {
  if (status === "accepted" || status === "completed") return "bg-success/10 text-success";
  if (status === "pending") return "bg-warning/10 text-warning";
  if (status === "delivered") return "bg-primary/10 text-primary";
  if (status === "declined") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

export const feeDisclaimer = (ar: boolean) =>
  ar
    ? "رسوم استرشادية يتم الاتفاق عليها مباشرة بينك وبين الجهة الطالبة. لا يتم تحصيل أي مبلغ عبر التطبيق."
    : "Indicative fee, agreed directly between you and the commissioner. No payment is taken through the app.";
