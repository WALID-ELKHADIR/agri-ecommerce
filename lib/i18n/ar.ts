/**
 * Textes arabes (arabe standard).
 * ⚠️ À faire relire par un locuteur natif avant publication : la langue arabe
 * n'est pas encore proposée sur le site (structure seulement).
 */
import type { Dictionary } from "./fr.ts";

export const ar: Dictionary = {
  addToQuote: "أضف إلى طلب السعر",
  added: "تمت الإضافة",
  myQuoteList: "قائمة طلب السعر",
  sendOnWhatsapp: "أرسل عبر واتساب",
  emptyList: "قائمتك فارغة.",
  catalog: "الكتالوج",
  contact: "اتصل بنا",
  home: "الرئيسية",
  freeQuote: "عرض سعر مجاني عبر واتساب",
  nationwideDelivery: "التوصيل إلى جميع أنحاء المغرب",
  technicalAdvice: "استشارة تقنية",
  quoteWithin24h: "عرض سعر خلال 24 ساعة",
  offline: "أنت غير متصل بالإنترنت",
  retry: "إعادة المحاولة",
  whatsappGeneral: (brand: string) =>
    `مرحبًا ${brand} 👋، أرغب في الحصول على عرض سعر لمعدات الري / الضخ. هل يمكنكم مساعدتي؟`,
};
