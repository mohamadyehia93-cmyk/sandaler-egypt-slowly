export interface ExperienceFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  photos: File[];
  photoPreviewUrls: string[];
  price: string;
  priceType: "per-person" | "per-group";
  duration: string;
  durationUnit: "hours" | "days";
  groupSizeMin: string;
  groupSizeMax: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  seasonStart: string;
  seasonEnd: string;
  cancellationPolicy: string;
  ageRestriction: string;
  fitnessLevel: string;
  whatToBring: string[];
  includes: string[];
  excludes: string[];
  location: string;
  meetingPointName: string;
  meetingPointLat: string;
  meetingPointLng: string;
  itinerary: { step: string }[];
}

export const defaultFormData: ExperienceFormData = {
  title_en: "",
  title_ar: "",
  description_en: "",
  description_ar: "",
  category: "",
  photos: [],
  photoPreviewUrls: [],
  price: "",
  priceType: "per-person",
  duration: "",
  durationUnit: "hours",
  groupSizeMin: "1",
  groupSizeMax: "10",
  availableDays: [],
  startTime: "09:00",
  endTime: "12:00",
  seasonStart: "",
  seasonEnd: "",
  cancellationPolicy: "flexible",
  ageRestriction: "none",
  fitnessLevel: "easy",
  whatToBring: [""],
  includes: [""],
  excludes: [""],
  location: "",
  meetingPointName: "",
  meetingPointLat: "",
  meetingPointLng: "",
  itinerary: [{ step: "" }],
};

export const categories = [
  { en: "Nature & Outdoors", ar: "طبيعة وهواء طلق" },
  { en: "Food & Cooking", ar: "طعام وطبخ" },
  { en: "History & Heritage", ar: "تاريخ وتراث" },
  { en: "Arts & Crafts", ar: "فنون وحرف" },
  { en: "Adventure & Sports", ar: "مغامرة ورياضة" },
  { en: "Spiritual & Wellness", ar: "روحانية وعافية" },
  { en: "Community & Volunteering", ar: "مجتمع وتطوع" },
];

export const daysOfWeek = [
  { en: "Mon", ar: "اثنين" },
  { en: "Tue", ar: "ثلاثاء" },
  { en: "Wed", ar: "أربعاء" },
  { en: "Thu", ar: "خميس" },
  { en: "Fri", ar: "جمعة" },
  { en: "Sat", ar: "سبت" },
  { en: "Sun", ar: "أحد" },
];
