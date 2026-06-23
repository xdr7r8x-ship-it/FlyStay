const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DISCLAIMER = 'المعلومات المعروضة إرشادية لمساعدتك في اختيار الرحلة. الأسعار والتوفر والتأكيد النهائي يتم بعد مراجعة الطلب أو الربط مع مزود الحجز.';

type DestinationSeed = {
  slug: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  continentAr: string;
  regionAr?: string;
  styles: string[];
  budgetLevel: 'ECONOMY' | 'MID' | 'LUXURY' | 'MIXED';
};

const destinations: DestinationSeed[] = [
  ['riyadh', 'الرياض', 'Riyadh', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة الرياض', ['FAMILY', 'BUSINESS', 'CULTURE', 'LUXURY'], 'MIXED'],
  ['jeddah', 'جدة', 'Jeddah', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة مكة المكرمة', ['FAMILY', 'BEACH', 'SHOPPING', 'CULTURE'], 'MIXED'],
  ['makkah', 'مكة المكرمة', 'Makkah', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة مكة المكرمة', ['RELIGIOUS', 'FAMILY', 'CULTURE'], 'MIXED'],
  ['madinah', 'المدينة المنورة', 'Madinah', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة المدينة المنورة', ['RELIGIOUS', 'FAMILY', 'CULTURE'], 'MIXED'],
  ['khobar', 'الخبر', 'Khobar', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'المنطقة الشرقية', ['FAMILY', 'BEACH', 'RELAX', 'BUSINESS'], 'MID'],
  ['dammam', 'الدمام', 'Dammam', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'المنطقة الشرقية', ['FAMILY', 'BUSINESS', 'BEACH'], 'MID'],
  ['abha', 'أبها', 'Abha', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة عسير', ['FAMILY', 'NATURE', 'RELAX', 'ADVENTURE'], 'MID'],
  ['taif', 'الطائف', 'Taif', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة مكة المكرمة', ['FAMILY', 'NATURE', 'RELAX'], 'MID'],
  ['alula', 'العلا', 'AlUla', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة المدينة المنورة', ['CULTURE', 'ADVENTURE', 'LUXURY', 'NATURE'], 'LUXURY'],
  ['tabuk', 'تبوك', 'Tabuk', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة تبوك', ['NATURE', 'ADVENTURE', 'FAMILY'], 'MID'],
  ['neom', 'نيوم', 'NEOM', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة تبوك', ['LUXURY', 'NATURE', 'ADVENTURE'], 'LUXURY'],
  ['jazan', 'جازان', 'Jazan', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة جازان', ['BEACH', 'NATURE', 'FAMILY'], 'MID'],
  ['hail', 'حائل', 'Hail', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة حائل', ['CULTURE', 'NATURE', 'FAMILY'], 'MID'],
  ['yanbu', 'ينبع', 'Yanbu', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة المدينة المنورة', ['BEACH', 'RELAX', 'FAMILY'], 'MID'],
  ['albaha', 'الباحة', 'Al Baha', 'المملكة العربية السعودية', 'Saudi Arabia', 'آسيا', 'منطقة الباحة', ['NATURE', 'FAMILY', 'RELAX'], 'MID'],
  ['dubai', 'دبي', 'Dubai', 'الإمارات العربية المتحدة', 'United Arab Emirates', 'آسيا', 'الخليج العربي', ['FAMILY', 'LUXURY', 'SHOPPING', 'BUSINESS'], 'LUXURY'],
  ['abu-dhabi', 'أبوظبي', 'Abu Dhabi', 'الإمارات العربية المتحدة', 'United Arab Emirates', 'آسيا', 'الخليج العربي', ['FAMILY', 'CULTURE', 'LUXURY', 'BUSINESS'], 'LUXURY'],
  ['sharjah', 'الشارقة', 'Sharjah', 'الإمارات العربية المتحدة', 'United Arab Emirates', 'آسيا', 'الخليج العربي', ['FAMILY', 'CULTURE', 'SHOPPING'], 'MID'],
  ['bahrain', 'البحرين', 'Bahrain', 'البحرين', 'Bahrain', 'آسيا', 'الخليج العربي', ['FAMILY', 'BUSINESS', 'RELAX'], 'MID'],
  ['doha', 'الدوحة', 'Doha', 'قطر', 'Qatar', 'آسيا', 'الخليج العربي', ['FAMILY', 'LUXURY', 'BUSINESS', 'CULTURE'], 'LUXURY'],
  ['kuwait', 'الكويت', 'Kuwait City', 'الكويت', 'Kuwait', 'آسيا', 'الخليج العربي', ['FAMILY', 'BUSINESS', 'SHOPPING'], 'MID'],
  ['muscat', 'مسقط', 'Muscat', 'عمان', 'Oman', 'آسيا', 'الخليج العربي', ['CULTURE', 'NATURE', 'FAMILY', 'RELAX'], 'MID'],
  ['salalah', 'صلالة', 'Salalah', 'عمان', 'Oman', 'آسيا', 'الخليج العربي', ['NATURE', 'RELAX', 'FAMILY'], 'MID'],
  ['istanbul', 'إسطنبول', 'Istanbul', 'تركيا', 'Turkey', 'آسيا', 'الأناضول', ['FAMILY', 'CULTURE', 'SHOPPING', 'FOOD'], 'MIXED'],
  ['cairo', 'القاهرة', 'Cairo', 'مصر', 'Egypt', 'أفريقيا', 'شمال أفريقيا', ['CULTURE', 'FAMILY', 'FOOD'], 'ECONOMY'],
  ['sharm-el-sheikh', 'شرم الشيخ', 'Sharm El Sheikh', 'مصر', 'Egypt', 'أفريقيا', 'البحر الأحمر', ['BEACH', 'RELAX', 'FAMILY'], 'MID'],
  ['amman', 'عمان', 'Amman', 'الأردن', 'Jordan', 'آسيا', 'بلاد الشام', ['CULTURE', 'FOOD', 'FAMILY'], 'MID'],
  ['beirut', 'بيروت', 'Beirut', 'لبنان', 'Lebanon', 'آسيا', 'بلاد الشام', ['FOOD', 'CULTURE', 'RELAX'], 'MID'],
  ['casablanca', 'الدار البيضاء', 'Casablanca', 'المغرب', 'Morocco', 'أفريقيا', 'المغرب العربي', ['BUSINESS', 'CULTURE', 'FOOD'], 'MID'],
  ['marrakech', 'مراكش', 'Marrakech', 'المغرب', 'Morocco', 'أفريقيا', 'المغرب العربي', ['CULTURE', 'LUXURY', 'SHOPPING', 'COUPLES'], 'MID'],
  ['kuala-lumpur', 'كوالالمبور', 'Kuala Lumpur', 'ماليزيا', 'Malaysia', 'آسيا', 'جنوب شرق آسيا', ['FAMILY', 'SHOPPING', 'FOOD'], 'MID'],
  ['bangkok', 'بانكوك', 'Bangkok', 'تايلاند', 'Thailand', 'آسيا', 'جنوب شرق آسيا', ['SHOPPING', 'FOOD', 'CULTURE'], 'MID'],
  ['phuket', 'بوكيت', 'Phuket', 'تايلاند', 'Thailand', 'آسيا', 'جنوب شرق آسيا', ['BEACH', 'RELAX', 'COUPLES'], 'MID'],
  ['bali', 'بالي', 'Bali', 'إندونيسيا', 'Indonesia', 'آسيا', 'جنوب شرق آسيا', ['BEACH', 'RELAX', 'COUPLES', 'NATURE'], 'MID'],
  ['jakarta', 'جاكرتا', 'Jakarta', 'إندونيسيا', 'Indonesia', 'آسيا', 'جنوب شرق آسيا', ['BUSINESS', 'SHOPPING', 'FOOD'], 'MID'],
  ['singapore', 'سنغافورة', 'Singapore', 'سنغافورة', 'Singapore', 'آسيا', 'جنوب شرق آسيا', ['FAMILY', 'BUSINESS', 'LUXURY'], 'LUXURY'],
  ['tokyo', 'طوكيو', 'Tokyo', 'اليابان', 'Japan', 'آسيا', 'شرق آسيا', ['FAMILY', 'CULTURE', 'FOOD', 'SHOPPING'], 'LUXURY'],
  ['seoul', 'سيول', 'Seoul', 'كوريا الجنوبية', 'South Korea', 'آسيا', 'شرق آسيا', ['SHOPPING', 'CULTURE', 'FOOD'], 'MID'],
  ['manila', 'مانيلا', 'Manila', 'الفلبين', 'Philippines', 'آسيا', 'جنوب شرق آسيا', ['FAMILY', 'FOOD', 'BUSINESS'], 'MID'],
  ['hanoi', 'هانوي', 'Hanoi', 'فيتنام', 'Vietnam', 'آسيا', 'جنوب شرق آسيا', ['CULTURE', 'FOOD', 'ECONOMY'], 'ECONOMY'],
  ['ho-chi-minh-city', 'هو تشي منه', 'Ho Chi Minh City', 'فيتنام', 'Vietnam', 'آسيا', 'جنوب شرق آسيا', ['FOOD', 'CULTURE', 'BUSINESS'], 'ECONOMY'],
  ['mumbai', 'مومباي', 'Mumbai', 'الهند', 'India', 'آسيا', 'جنوب آسيا', ['BUSINESS', 'FOOD', 'CULTURE'], 'MID'],
  ['delhi', 'دلهي', 'Delhi', 'الهند', 'India', 'آسيا', 'جنوب آسيا', ['CULTURE', 'FOOD', 'FAMILY'], 'MID'],
  ['maldives', 'المالديف', 'Maldives', 'المالديف', 'Maldives', 'آسيا', 'المحيط الهندي', ['BEACH', 'LUXURY', 'COUPLES', 'RELAX'], 'LUXURY'],
  ['sri-lanka', 'سريلانكا', 'Sri Lanka', 'سريلانكا', 'Sri Lanka', 'آسيا', 'جنوب آسيا', ['NATURE', 'BEACH', 'CULTURE', 'FAMILY'], 'MID'],
  ['london', 'لندن', 'London', 'المملكة المتحدة', 'United Kingdom', 'أوروبا', 'أوروبا الغربية', ['FAMILY', 'CULTURE', 'SHOPPING', 'BUSINESS'], 'LUXURY'],
  ['paris', 'باريس', 'Paris', 'فرنسا', 'France', 'أوروبا', 'أوروبا الغربية', ['COUPLES', 'CULTURE', 'SHOPPING', 'LUXURY'], 'LUXURY'],
  ['rome', 'روما', 'Rome', 'إيطاليا', 'Italy', 'أوروبا', 'جنوب أوروبا', ['CULTURE', 'FOOD', 'COUPLES'], 'MID'],
  ['milan', 'ميلان', 'Milan', 'إيطاليا', 'Italy', 'أوروبا', 'جنوب أوروبا', ['SHOPPING', 'BUSINESS', 'LUXURY'], 'LUXURY'],
  ['venice', 'البندقية', 'Venice', 'إيطاليا', 'Italy', 'أوروبا', 'جنوب أوروبا', ['COUPLES', 'CULTURE', 'RELAX'], 'LUXURY'],
  ['madrid', 'مدريد', 'Madrid', 'إسبانيا', 'Spain', 'أوروبا', 'جنوب أوروبا', ['CULTURE', 'FOOD', 'FAMILY'], 'MID'],
  ['barcelona', 'برشلونة', 'Barcelona', 'إسبانيا', 'Spain', 'أوروبا', 'جنوب أوروبا', ['BEACH', 'CULTURE', 'FOOD'], 'MID'],
  ['geneva', 'جنيف', 'Geneva', 'سويسرا', 'Switzerland', 'أوروبا', 'أوروبا الوسطى', ['LUXURY', 'BUSINESS', 'RELAX'], 'LUXURY'],
  ['zurich', 'زيورخ', 'Zurich', 'سويسرا', 'Switzerland', 'أوروبا', 'أوروبا الوسطى', ['LUXURY', 'BUSINESS', 'SHOPPING'], 'LUXURY'],
  ['interlaken', 'إنترلاكن', 'Interlaken', 'سويسرا', 'Switzerland', 'أوروبا', 'أوروبا الوسطى', ['NATURE', 'ADVENTURE', 'COUPLES'], 'LUXURY'],
  ['munich', 'ميونخ', 'Munich', 'ألمانيا', 'Germany', 'أوروبا', 'أوروبا الوسطى', ['FAMILY', 'CULTURE', 'BUSINESS'], 'MID'],
  ['berlin', 'برلين', 'Berlin', 'ألمانيا', 'Germany', 'أوروبا', 'أوروبا الوسطى', ['CULTURE', 'BUSINESS', 'FOOD'], 'MID'],
  ['vienna', 'فيينا', 'Vienna', 'النمسا', 'Austria', 'أوروبا', 'أوروبا الوسطى', ['CULTURE', 'COUPLES', 'FAMILY'], 'MID'],
  ['amsterdam', 'أمستردام', 'Amsterdam', 'هولندا', 'Netherlands', 'أوروبا', 'أوروبا الغربية', ['CULTURE', 'RELAX', 'FAMILY'], 'MID'],
  ['brussels', 'بروكسل', 'Brussels', 'بلجيكا', 'Belgium', 'أوروبا', 'أوروبا الغربية', ['BUSINESS', 'FOOD', 'CULTURE'], 'MID'],
  ['prague', 'براغ', 'Prague', 'التشيك', 'Czech Republic', 'أوروبا', 'أوروبا الوسطى', ['CULTURE', 'COUPLES', 'ECONOMY'], 'MID'],
  ['athens', 'أثينا', 'Athens', 'اليونان', 'Greece', 'أوروبا', 'جنوب أوروبا', ['CULTURE', 'FOOD', 'BEACH'], 'MID'],
  ['lisbon', 'لشبونة', 'Lisbon', 'البرتغال', 'Portugal', 'أوروبا', 'جنوب أوروبا', ['CULTURE', 'FOOD', 'RELAX'], 'MID'],
  ['oslo', 'أوسلو', 'Oslo', 'النرويج', 'Norway', 'أوروبا', 'شمال أوروبا', ['NATURE', 'FAMILY', 'RELAX'], 'LUXURY'],
  ['stockholm', 'ستوكهولم', 'Stockholm', 'السويد', 'Sweden', 'أوروبا', 'شمال أوروبا', ['FAMILY', 'CULTURE', 'RELAX'], 'LUXURY'],
  ['new-york', 'نيويورك', 'New York', 'الولايات المتحدة', 'United States', 'أمريكا الشمالية', 'الساحل الشرقي', ['SHOPPING', 'BUSINESS', 'CULTURE', 'FAMILY'], 'LUXURY'],
  ['los-angeles', 'لوس أنجلوس', 'Los Angeles', 'الولايات المتحدة', 'United States', 'أمريكا الشمالية', 'الساحل الغربي', ['ENTERTAINMENT', 'BEACH', 'SHOPPING'], 'LUXURY'],
  ['miami', 'ميامي', 'Miami', 'الولايات المتحدة', 'United States', 'أمريكا الشمالية', 'فلوريدا', ['BEACH', 'RELAX', 'SHOPPING'], 'LUXURY'],
  ['orlando', 'أورلاندو', 'Orlando', 'الولايات المتحدة', 'United States', 'أمريكا الشمالية', 'فلوريدا', ['FAMILY', 'ENTERTAINMENT'], 'MID'],
  ['las-vegas', 'لاس فيغاس', 'Las Vegas', 'الولايات المتحدة', 'United States', 'أمريكا الشمالية', 'نيفادا', ['ENTERTAINMENT', 'LUXURY', 'FOOD'], 'LUXURY'],
  ['toronto', 'تورونتو', 'Toronto', 'كندا', 'Canada', 'أمريكا الشمالية', 'أونتاريو', ['FAMILY', 'BUSINESS', 'CULTURE'], 'MID'],
  ['vancouver', 'فانكوفر', 'Vancouver', 'كندا', 'Canada', 'أمريكا الشمالية', 'كولومبيا البريطانية', ['NATURE', 'FAMILY', 'RELAX'], 'MID'],
  ['cape-town', 'كيب تاون', 'Cape Town', 'جنوب أفريقيا', 'South Africa', 'أفريقيا', 'كيب الغربية', ['NATURE', 'BEACH', 'ADVENTURE'], 'MID'],
  ['johannesburg', 'جوهانسبرغ', 'Johannesburg', 'جنوب أفريقيا', 'South Africa', 'أفريقيا', 'غاوتنغ', ['BUSINESS', 'CULTURE', 'SHOPPING'], 'MID'],
  ['zanzibar', 'زنجبار', 'Zanzibar', 'تنزانيا', 'Tanzania', 'أفريقيا', 'المحيط الهندي', ['BEACH', 'RELAX', 'COUPLES'], 'MID'],
  ['mauritius', 'موريشيوس', 'Mauritius', 'موريشيوس', 'Mauritius', 'أفريقيا', 'المحيط الهندي', ['BEACH', 'LUXURY', 'COUPLES'], 'LUXURY'],
  ['seychelles', 'سيشل', 'Seychelles', 'سيشل', 'Seychelles', 'أفريقيا', 'المحيط الهندي', ['BEACH', 'LUXURY', 'COUPLES'], 'LUXURY'],
  ['sydney', 'سيدني', 'Sydney', 'أستراليا', 'Australia', 'أوقيانوسيا', 'نيو ساوث ويلز', ['BEACH', 'FAMILY', 'BUSINESS'], 'LUXURY'],
  ['melbourne', 'ملبورن', 'Melbourne', 'أستراليا', 'Australia', 'أوقيانوسيا', 'فيكتوريا', ['CULTURE', 'FOOD', 'FAMILY'], 'LUXURY'],
  ['auckland', 'أوكلاند', 'Auckland', 'نيوزيلندا', 'New Zealand', 'أوقيانوسيا', 'الجزيرة الشمالية', ['NATURE', 'FAMILY', 'ADVENTURE'], 'LUXURY'],
].map(([slug, cityAr, cityEn, countryAr, countryEn, continentAr, regionAr, styles, budgetLevel]) => ({
  slug, cityAr, cityEn, countryAr, countryEn, continentAr, regionAr, styles, budgetLevel,
})) as DestinationSeed[];

function destinationData(seed: DestinationSeed) {
  const isSaudi = seed.countryEn === 'Saudi Arabia';
  const isBeach = seed.styles.includes('BEACH');
  const isLuxury = seed.styles.includes('LUXURY');
  const summary = `${seed.cityAr} وجهة ${seed.styles.includes('FAMILY') ? 'مناسبة للعائلة' : 'مميزة'} تجمع بين التجربة المحلية وسهولة التخطيط للمسافر العربي.`;
  return {
    slug: seed.slug,
    cityAr: seed.cityAr,
    cityEn: seed.cityEn,
    countryAr: seed.countryAr,
    countryEn: seed.countryEn,
    continentAr: seed.continentAr,
    regionAr: seed.regionAr,
    descriptionAr: `${seed.cityAr} في ${seed.countryAr} خيار مهم ضمن موسوعة FlyStay للسفر العالمي. تعرض هذه الصفحة طبيعة الوجهة، أنسب أنماط الرحلات، المناطق المقترحة، وأنشطة تساعدك على بناء طلب سفر واضح قبل المراجعة. ${DISCLAIMER}`,
    shortSummaryAr: summary,
    heroImageUrl: null,
    galleryImages: [],
    travelStyles: seed.styles,
    bestForAr: [
      seed.styles.includes('FAMILY') ? 'رحلات عائلية منظمة' : 'رحلات فردية أو ثنائية مرنة',
      isBeach ? 'أجواء بحرية واسترخاء' : 'استكشاف المدينة والمعالم',
      isLuxury ? 'تجارب راقية عند توفر مزود مناسب' : 'خيارات متعددة حسب الميزانية',
    ],
    notBestForAr: ['من يحتاج إلى سعر نهائي قبل مراجعة الطلب', 'من يبحث عن تأكيد فوري بدون مزود حجز فعلي'],
    popularAreasAr: ['وسط المدينة', 'منطقة الواجهة أو المركز', 'الأحياء القريبة من الخدمات'],
    topActivitiesAr: ['جولة تعريفية بالمدينة', 'زيارة المعالم الرئيسية', 'تجربة المطاعم والأسواق المحلية'],
    suggestedDurations: ['رحلة قصيرة', 'رحلة متوسطة', 'رحلة ممتدة'],
    budgetLevel: seed.budgetLevel,
    seasonNotesAr: isSaudi ? 'تتحسن التجربة غالبًا في المواسم المعتدلة، مع مراعاة اختلاف الطقس بين المناطق.' : 'تختلف أفضل المواسم حسب الطقس والفعاليات، ويتم تأكيد الأنسب عند مراجعة الطلب.',
    airportInfoAr: `الوصول عادة عبر أقرب مطار يخدم ${seed.cityAr} أو المدن المجاورة، ويتم تأكيد المسار عند مراجعة الطلب.`,
    visaNotesAr: 'متطلبات التأشيرة تختلف حسب جنسية المسافر والأنظمة السارية، ولا يتم اعتبار هذه المعلومة موافقة سفر.',
    transportNotesAr: 'يفضل تحديد طريقة التنقل بعد معرفة مدة الرحلة ومكان الإقامة المقترح.',
    familyNotesAr: seed.styles.includes('FAMILY') ? 'مناسبة للعوائل مع اختيار مناطق إقامة قريبة من الخدمات.' : 'يمكن تهيئتها للعوائل عند اختيار برنامج هادئ ومناطق مناسبة.',
    honeymoonNotesAr: seed.styles.includes('COUPLES') || isLuxury ? 'مناسبة لرحلات شهر العسل عند ترتيب برنامج هادئ وتجارب خاصة بعد المراجعة.' : 'يمكن تحويلها إلى رحلة ثنائية هادئة حسب الموسم والمنطقة.',
    safetyNotesAr: 'ينصح بالالتزام بالتعليمات المحلية ومراجعة متطلبات السفر الرسمية قبل المغادرة.',
    localTipsAr: 'اختر منطقة إقامة قريبة من الهدف الرئيسي للرحلة لتقليل وقت التنقل.',
    status: 'ACTIVE',
    sourceType: 'CURATED',
    lastReviewedAt: new Date(),
  };
}

function templateFor(seed: DestinationSeed, index: number) {
  const serviceType = index % 5 === 0 ? 'MIXED' : 'PACKAGE';
  return {
    slug: `${seed.slug}-travel-idea`,
    titleAr: `فكرة رحلة إلى ${seed.cityAr}`,
    serviceType,
    cityAr: seed.cityAr,
    summaryAr: `قالب إرشادي لبناء طلب رحلة إلى ${seed.cityAr} بدون أسعار أو توفر مباشر.`,
    idealFor: seed.styles.slice(0, 3),
    durationDays: [3, 4, 5, 6][index % 4],
    includesAr: ['اقتراح مناطق مناسبة للإقامة', 'تصور عام للأنشطة', 'مراجعة الطلب قبل أي تأكيد'],
    itinerary: [
      { day: 1, titleAr: 'وصول وتعرف على المنطقة' },
      { day: 2, titleAr: 'أنشطة رئيسية حسب نمط الرحلة' },
      { day: 3, titleAr: 'وقت حر ومراجعة خيارات إضافية' },
    ],
    budgetLevel: seed.budgetLevel,
    requirementsAr: ['تحديد عدد المسافرين', 'تحديد تواريخ تقريبية', 'إضافة أي ملاحظات خاصة'],
    disclaimersAr: [DISCLAIMER],
    status: 'ACTIVE',
  };
}

function stayGuideFor(seed: DestinationSeed, index: number) {
  const type = (['HOTEL', 'CHALET', 'RESTHOUSE'] as const)[index % 3];
  const typeAr = type === 'HOTEL' ? 'فنادق' : type === 'CHALET' ? 'شاليهات' : 'استراحات';
  return {
    type,
    cityAr: seed.cityAr,
    titleAr: `دليل ${typeAr} ${seed.cityAr}`,
    descriptionAr: `دليل إرشادي لاختيار نوع إقامة مناسب في ${seed.cityAr} حسب عدد المسافرين ونمط الرحلة. لا يعرض توفرًا مباشرًا أو أسعارًا نهائية.`,
    capacityHintAr: type === 'HOTEL' ? 'مناسب للأفراد والعائلات حسب نوع الغرف بعد المراجعة.' : 'تحدد السعة المناسبة بعد مراجعة عدد الضيوف.',
    featuresAr: type === 'HOTEL' ? ['قرب الخدمات', 'خيارات عائلية', 'تنقل أسهل'] : ['مساحات جلوس', 'خصوصية أعلى', 'مناسب للتجمعات'],
    idealFor: seed.styles.includes('FAMILY') ? ['FAMILY', 'RELAX'] : ['COUPLES', 'FRIENDS'],
    hasPoolHint: type !== 'HOTEL' ? index % 2 === 0 : null,
    hasOutdoorSeatingHint: type !== 'HOTEL' ? true : null,
    budgetLevel: seed.budgetLevel,
    disclaimerAr: DISCLAIMER,
    status: 'ACTIVE',
  };
}

async function seedAdminIfConfigured() {
  const adminEmail = process.env.ADMIN_EMAIL || 'hrq@hotmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.log('ADMIN_PASSWORD not set; skipping admin user seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: 'ADMIN', email: adminEmail },
    create: { name: 'Admin', email: adminEmail, passwordHash, role: 'ADMIN' },
  });
  console.log(`Admin user ensured: ${adminEmail}`);
}

async function main() {
  await seedAdminIfConfigured();

  const destinationBySlug = new Map<string, string>();
  for (const seed of destinations) {
    const record = await prisma.travelDestination.upsert({
      where: { slug: seed.slug },
      update: destinationData(seed),
      create: destinationData(seed),
    });
    destinationBySlug.set(seed.slug, record.id);
  }

  for (let index = 0; index < 40; index += 1) {
    const seed = destinations[index];
    const template = templateFor(seed, index);
    await prisma.tripTemplate.upsert({
      where: { slug: template.slug },
      update: { ...template, destinationId: destinationBySlug.get(seed.slug) },
      create: { ...template, destinationId: destinationBySlug.get(seed.slug) },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const seed = destinations[index];
    const guide = stayGuideFor(seed, index);
    const existing = await prisma.stayGuide.findFirst({
      where: { titleAr: guide.titleAr, cityAr: guide.cityAr, type: guide.type },
    });
    if (existing) {
      await prisma.stayGuide.update({
        where: { id: existing.id },
        data: { ...guide, destinationId: destinationBySlug.get(seed.slug) },
      });
    } else {
      await prisma.stayGuide.create({
        data: { ...guide, destinationId: destinationBySlug.get(seed.slug) },
      });
    }
  }

  await prisma.travelDestination.upsert({
    where: { slug: 'draft-hidden-test' },
    update: { ...destinationData({ ...destinations[0], slug: 'draft-hidden-test', cityAr: 'وجهة مسودة' }), status: 'DRAFT' },
    create: { ...destinationData({ ...destinations[0], slug: 'draft-hidden-test', cityAr: 'وجهة مسودة' }), status: 'DRAFT' },
  });
  await prisma.travelDestination.upsert({
    where: { slug: 'inactive-hidden-test' },
    update: { ...destinationData({ ...destinations[1], slug: 'inactive-hidden-test', cityAr: 'وجهة غير نشطة' }), status: 'INACTIVE' },
    create: { ...destinationData({ ...destinations[1], slug: 'inactive-hidden-test', cityAr: 'وجهة غير نشطة' }), status: 'INACTIVE' },
  });

  const [activeDestinations, activeTemplates, activeStayGuides] = await Promise.all([
    prisma.travelDestination.count({ where: { status: 'ACTIVE' } }),
    prisma.tripTemplate.count({ where: { status: 'ACTIVE' } }),
    prisma.stayGuide.count({ where: { status: 'ACTIVE' } }),
  ]);

  console.log(`Seed completed. ACTIVE destinations=${activeDestinations}, tripTemplates=${activeTemplates}, stayGuides=${activeStayGuides}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
