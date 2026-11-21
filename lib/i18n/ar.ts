/**
 * Textes arabes (arabe standard).
 * ⚠️ À faire relire par un locuteur natif : ces traductions n'ont pas encore
 * été vérifiées. Seuls l'en-tête, les menus, le carrousel et la barre mobile
 * sont traduits ; le reste du site reste en français.
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

  navHome: "الرئيسية",
  navProducts: "المنتجات",
  navCategories: "الفئات",
  navServices: "الخدمات",
  navContact: "اتصل بنا",
  topbarLong: "استشارة تقنية وعرض سعر خلال 24 ساعة",
  topbarShort: "عرض سعر خلال 24 ساعة",
  searchPlaceholder: "مضخة، وصلة، قطر…",
  searchMobilePlaceholder: "ابحث عن منتج…",
  searchLabel: "ابحث عن منتج",
  searchSubmit: "ابدأ البحث",
  searchOk: "بحث",
  quoteWhatsapp: "عرض سعر عبر واتساب",
  requestQuote: "اطلب عرض سعر",
  openMenu: "فتح القائمة",
  menu: "القائمة",
  homeLabel: "Saqia — الصفحة الرئيسية",
  languageSwitch: "تغيير اللغة",

  slogan: "الماء في المكان المناسب.",
  hero1Text:
    "مضخات ووصلات وأطقم ري للمزارع في المغرب. أنشئ قائمتك، وأرسلها عبر واتساب، واحصل على عرض السعر.",
  heroCtaWhatsapp: "اطلب عرض سعر عبر واتساب",
  heroCtaCatalog: "تصفح الكتالوج",
  hero2Title: "ضخ زراعي بالقدرة المناسبة.",
  hero2Text:
    "مضخات غاطسة ونابذة ومضخات بمحرك للآبار والأحواض. نساعدك على اختيار التدفق والارتفاع المناسبين.",
  hero2Cta: "عرض المضخات",
  hero3Title: "بيوت محمية وشبكات تحت الضغط.",
  hero3Text: "وصلات PE/PVC وصمامات وملحقات لشبكات ري محكمة، من البئر إلى البيت المحمي.",
  hero3Cta: "عرض الوصلات",
  sliderLabel: "تقديم Saqia",
  slidePrev: "الشريحة السابقة",
  slideNext: "الشريحة التالية",
  slidePause: "إيقاف التمرير التلقائي",
  slidePlay: "تشغيل التمرير التلقائي",
  slideGoto: "انتقل إلى الشريحة",
  mobileFreeQuote: "عرض سعر مجاني عبر واتساب",

  heroCount: (count: number) => `${count} مرجعًا متوفرًا على الإنترنت، وعرض السعر مجاني.`,
  slideOf: (index: number, total: number) => `${index} من ${total}`,
  whatsappGeneral: (brand: string) =>
    `مرحبًا ${brand} 👋، أرغب في الحصول على عرض سعر لمعدات الري / الضخ. هل يمكنكم مساعدتي؟`,
};
