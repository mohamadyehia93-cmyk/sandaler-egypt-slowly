// Maps content IDs to provider IDs for cross-linking
// Experience → Service Provider
export const experienceToProvider: Record<string, string> = {
  e1: "p2", e2: "p2", e3: "p2", e4: "p2", e5: "p2",
  e6: "p2", e7: "p2", e8: "p2", e9: "p2", e10: "p2",
  e11: "p2", e12: "p2", e13: "p2", e14: "p2", e15: "p2",
  e16: "p2", e17: "p2", e18: "p2", e19: "p2", e20: "p2",
};

// Accommodation → Host
export const accommodationToProvider: Record<string, string> = {
  a1: "p3", a2: "p3", a3: "p3", a4: "p3", a5: "p3",
  a6: "p3", a7: "p3", a8: "p3", a9: "p3", a10: "p3",
};

// Trip → Trip Organizer
export const tripToProvider: Record<string, string> = {
  t1: "p5", t2: "p5", t3: "p5", t4: "p5", t5: "p5",
  t6: "p5", t7: "p5", t8: "p5", t9: "p5", t10: "p5",
};

// Transport → Transport Provider
export const transportToProvider: Record<string, string> = {
  tr1: "p4", tr2: "p4", tr3: "p4", tr4: "p4", tr5: "p4",
  tr6: "p4", tr7: "p4", tr8: "p4",
};

// Product → Product Seller
export const productToProvider: Record<string, string> = {
  pr1: "p6", pr2: "p6", pr3: "p6", pr4: "p6", pr5: "p6",
  pr6: "p6", pr7: "p6", pr8: "p6",
};

// Provider short info for card display
export const providerShortInfo: Record<string, { name: { en: string; ar: string }; avatar: string }> = {
  p1: { name: { en: "Ahmed Hassan", ar: "أحمد حسن" }, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" },
  p2: { name: { en: "Hassan Mahmoud", ar: "حسن محمود" }, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" },
  p3: { name: { en: "Fatma Nubian", ar: "فاطمة النوبية" }, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" },
  p4: { name: { en: "Captain Youssef", ar: "الريّس يوسف" }, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" },
  p5: { name: { en: "Semsemia Trips", ar: "سمسمية تريبس" }, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80" },
  p6: { name: { en: "Fatma Abdullah", ar: "فاطمة عبدالله" }, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" },
  p7: { name: { en: "Children's Library", ar: "مكتبة أطفال طنطا" }, avatar: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80&q=80" },
  p8: { name: { en: "Sara Ahmed", ar: "سارة أحمد" }, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" },
};
