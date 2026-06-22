/**
 * FlyStay Encyclopedia Seed Data
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Encyclopedia...');

  const destinations = [
    {
      slug: 'riyadh',
      cityAr: 'الرياض',
      cityEn: 'Riyadh',
      countryAr: 'المملكة العربية السعودية',
      countryEn: 'Saudi Arabia',
      regionAr: 'منطقة الرياض',
      descriptionAr: 'عاصمة المملكة ونابض قلبها. تجمع بين عبق التاريخ وطابع الحداثة.',
      shortSummaryAr: 'عاصمة المملكة، قلب سياسي واقتصادي وثقافي.',
      travelStyles: ['FAMILY', 'BUSINESS', 'CULTURE', 'LUXURY'],
      bestForAr: ['العمل', 'الثقافة', 'التسوق', 'المطاعم الفاخرة'],
      popularAreasAr: ['حي العليا', 'حي الملقا', 'حي النخيل', 'الديرة'],
      topActivitiesAr: ['برج المملكة', 'رياض بارك', 'متحف الملك سعود', 'وادي حنيفة'],
      suggestedDurations: ['يومين', '3 أيام', 'أسبوع'],
      budgetLevel: 'MIXED',
      seasonNotesAr: 'أفضل وقت من نوفمبر إلى مارس.',
      airportInfoAr: 'مطار الملك خالد الدولي.',
      familyNotesAr: 'مناسبة للعوائل.',
      safetyNotesAr: 'آمنة جدًا.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'jeddah',
      cityAr: 'جدة',
      cityEn: 'Jeddah',
      countryAr: 'المملكة العربية السعودية',
      countryEn: 'Saudi Arabia',
      regionAr: 'منطقة مكة المكرمة',
      descriptionAr: 'عروس البحر الأحمر. تشتهر بتراثها البحري وثقافتها المتنوعة.',
      shortSummaryAr: 'عروس البحر الأحمر، بوابة الحرمين.',
      travelStyles: ['FAMILY', 'RELIGIOUS', 'CULTURE', 'SHOPPING'],
      bestForAr: ['القرب من الحرمين', 'التسوق', 'المأكولات البحرية', 'الكورنيش'],
      popularAreasAr: ['الكورنيش', 'حي الشاطئ', 'حي الروضة', 'حي الحمراء'],
      topActivitiesAr: ['المشي على الكورنيش', 'نافورة الملك فهد', 'حي مصر', 'جزيرة الفرسان'],
      suggestedDurations: ['3 أيام', '4 أيام', 'أسبوع'],
      budgetLevel: 'MIXED',
      seasonNotesAr: 'معتدلة شتاءً. أفضل وقت من أكتوبر إلى أبريل.',
      familyNotesAr: 'مثالية للعوائل.',
      safetyNotesAr: 'آمنة مع خدمات سياحية.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'dubai',
      cityAr: 'دبي',
      cityEn: 'Dubai',
      countryAr: 'الإمارات العربية المتحدة',
      countryEn: 'United Arab Emirates',
      descriptionAr: 'مدينة المستقبل ووجهة السياح الأولى. تجمع بين العراقة العربية والتطور.',
      shortSummaryAr: 'مدينة المستقبل، تسوق وفعاليات.',
      travelStyles: ['FAMILY', 'LUXURY', 'SHOPPING', 'BUSINESS', 'ADVENTURE'],
      bestForAr: ['التسوق', 'الفعاليات', 'العمارة', 'الشواطئ', 'الصحى'],
      popularAreasAr: ['بر دبي', 'ديرة', 'الجميرا', 'دبي مول'],
      topActivitiesAr: ['التسوق', 'برج خليفة', 'صحراء', 'مرسى دبي', 'جزر النخيل'],
      suggestedDurations: ['3 أيام', '4 أيام', 'أسبوع'],
      budgetLevel: 'LUXURY',
      seasonNotesAr: 'حارة صيفًا، معتدلة شتاءً. أفضل وقت من نوفمبر إلى مارس.',
      airportInfoAr: 'مطار دبي الدولي.',
      familyNotesAr: 'مثالية للعوائل.',
      safetyNotesAr: 'آمنة جدًا.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'abha',
      cityAr: 'أبها',
      cityEn: 'Abha',
      countryAr: 'المملكة العربية السعودية',
      countryEn: 'Saudi Arabia',
      regionAr: 'منطقة عسير',
      descriptionAr: 'عروس الجبل. تتميز بمناخها البارد الخضري وطبيعتها الساحرة.',
      shortSummaryAr: 'جبلية باردة، طبيعة خضراء.',
      travelStyles: ['FAMILY', 'ADVENTURE', 'RELAX', 'CULTURE'],
      bestForAr: ['الطبيعة', 'المناخ البارد', 'الاسترخاء'],
      popularAreasAr: ['مدينة أبها', 'رجال ألمع', 'بللجرشي', 'النماص'],
      topActivitiesAr: ['رجال ألمع', 'السودة', 'التخييم', 'الطبيعة'],
      suggestedDurations: ['3 أيام', '4 أيام', 'أسبوع'],
      budgetLevel: 'MID',
      seasonNotesAr: 'باردة دائمًا. أفضل وقت من مايو إلى سبتمبر.',
      familyNotesAr: 'مناسبة للعوائل.',
      safetyNotesAr: 'آمنة.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'alula',
      cityAr: 'العلا',
      cityEn: 'AlUla',
      countryAr: 'المملكة العربية السعودية',
      countryEn: 'Saudi Arabia',
      regionAr: 'منطقة المدينة المنورة',
      descriptionAr: 'كنز أثري وطبيعي استثنائي. إرث إنساني يعود لآلاف السنين.',
      shortSummaryAr: 'موقع أثري استثنائي.',
      travelStyles: ['ADVENTURE', 'CULTURE', 'LUXURY', 'HISTORY'],
      bestForAr: ['التاريخ', 'الآثار', 'الطبيعة الصحراوية', 'الفخامة'],
      popularAreasAr: ['مدرج هجر', 'الأوابد', 'وادي成才', 'جبل عكمة'],
      topActivitiesAr: ['جولة أثرية', 'التخييم الصحراوي', 'طيران مروحي'],
      suggestedDurations: ['3 أيام', '4 أيام', 'أسبوع'],
      budgetLevel: 'LUXURY',
      seasonNotesAr: 'معتدلة من أكتوبر إلى مارس.',
      safetyNotesAr: 'آمنة مع تنظيم سياحي.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'istanbul',
      cityAr: 'إسطنبول',
      cityEn: 'Istanbul',
      countryAr: 'تركيا',
      countryEn: 'Turkey',
      descriptionAr: 'مدينة القارتين حيث تلتقي أوروبا بآسيا. غنية بالتاريخ والثقافة.',
      shortSummaryAr: 'تقاطع الحضارات، تاريخ وثقافة.',
      travelStyles: ['FAMILY', 'CULTURE', 'SHOPPING', 'RELIGIOUS', 'ADVENTURE'],
      bestForAr: ['التاريخ', 'المعالم الأثرية', 'التسوق', 'المأكولات'],
      popularAreasAr: ['الفتح', 'بي أوغلو', 'السلطان أحمد'],
      topActivitiesAr: ['آيا صوفيا', 'مسجد السلطان أحمد', 'البازار الكبير', 'قصر توبكابي'],
      suggestedDurations: ['4 أيام', '5 أيام', 'أسبوع'],
      budgetLevel: 'MIXED',
      seasonNotesAr: 'معتدلة. أفضل وقت من أبريل إلى يونيو.',
      airportInfoAr: 'مطار إسطنبول الجديد.',
      familyNotesAr: 'مناسبة للعوائل.',
      safetyNotesAr: 'آمنة للسياح.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'paris',
      cityAr: 'باريس',
      cityEn: 'Paris',
      countryAr: 'فرنسا',
      countryEn: 'France',
      descriptionAr: 'عاصمة الأنوار ورومانسية. من أجمل مدن العالم.',
      shortSummaryAr: 'عاصمة الأنوار، رومانسية.',
      travelStyles: ['COUPLES', 'CULTURE', 'SHOPPING', 'LUXURY'],
      bestForAr: ['الرومانسية', 'المتاحف', 'الموضة', 'المطبخ'],
      popularAreasAr: ['الشانزليزيه', 'مونمارتر', 'اللوفر'],
      topActivitiesAr: ['برج إيفل', 'اللوفر', 'كاتدرائية نوتردام'],
      suggestedDurations: ['4 أيام', '5 أيام', 'أسبوع'],
      budgetLevel: 'LUXURY',
      seasonNotesAr: 'معتدلة. أفضل وقت من أبريل إلى يونيو.',
      airportInfoAr: 'مطار شارل ديغول.',
      safetyNotesAr: 'آمنة مع الحيطة.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
    {
      slug: 'london',
      cityAr: 'لندن',
      cityEn: 'London',
      countryAr: 'المملكة المتحدة',
      countryEn: 'United Kingdom',
      descriptionAr: 'عاصمة الضباب وواحدة من أهم مدن العالم.',
      shortSummaryAr: 'عاصمة الضباب، تاريخ ملكي.',
      travelStyles: ['FAMILY', 'CULTURE', 'SHOPPING', 'BUSINESS', 'LUXURY'],
      bestForAr: ['المتاحف', 'التاريخ', 'الملكية', 'التسوق'],
      popularAreasAr: ['وستمنستر', 'كنسينغتون', 'مايفير'],
      topActivitiesAr: ['قلعة لندن', 'قصر باكنغهام', 'المتحف البريطاني', 'عين لندن'],
      suggestedDurations: ['4 أيام', '5 أيام', 'أسبوع'],
      budgetLevel: 'LUXURY',
      seasonNotesAr: 'معتدلة. أفضل وقت من مايو إلى سبتمبر.',
      airportInfoAr: 'مطار هيثرو.',
      familyNotesAr: 'مناسبة للعوائل.',
      safetyNotesAr: 'آمنة.',
      status: 'ACTIVE',
      sourceType: 'CURATED',
    },
  ];

  for (const dest of destinations) {
    await prisma.travelDestination.upsert({
      where: { slug: dest.slug },
      update: dest,
      create: dest,
    });
    console.log('Created:', dest.cityAr);
  }

  // Templates
  const templates = [
    {
      slug: 'riyadh-weekend',
      titleAr: 'ويكند في الرياض',
      serviceType: 'PACKAGE',
      cityAr: 'الرياض',
      summaryAr: 'نهاية أسبوع في العاصمة.',
      idealFor: ['FAMILY', 'BUSINESS', 'SHOPPING'],
      durationDays: 2,
      includesAr: ['فنادق 4 نجوم', 'برنامج مقترح'],
      budgetLevel: 'MID',
      disclaimersAr: ['مستوى تكلفة تقريبي: متوسط. يتم التحديد بعد المراجعة.'],
      status: 'ACTIVE',
    },
    {
      slug: 'dubai-family',
      titleAr: 'باقة دبي العائلية',
      serviceType: 'PACKAGE',
      cityAr: 'دبي',
      summaryAr: 'رحلة عائلية إلى دبي.',
      idealFor: ['FAMILY'],
      durationDays: 4,
      includesAr: ['فنادق 4-5 نجوم', 'جولة المدينة'],
      budgetLevel: 'LUXURY',
      disclaimersAr: ['مستوى تكلفة تقريبي: فاخر. يتم التحديد بعد المراجعة.'],
      status: 'ACTIVE',
    },
    {
      slug: 'abha-mountains',
      titleAr: 'رحلة أبها الجبلية',
      serviceType: 'PACKAGE',
      cityAr: 'أبها',
      summaryAr: 'استمتع بمناخ أبها البارد.',
      idealFor: ['FAMILY', 'RELAX'],
      durationDays: 3,
      includesAr: ['فنادق أو منتجعات', 'برنامج مقترح'],
      budgetLevel: 'MID',
      disclaimersAr: ['مستوى تكلفة تقريبي: متوسط. يتم التحديد بعد المراجعة.'],
      status: 'ACTIVE',
    },
    {
      slug: 'alula-heritage',
      titleAr: 'رحلة العلا الأثرية',
      serviceType: 'PACKAGE',
      cityAr: 'العلا',
      summaryAr: 'اكتشف إرث العلا التاريخي.',
      idealFor: ['ADVENTURE', 'CULTURE', 'LUXURY'],
      durationDays: 3,
      includesAr: ['فنادق فاخرة', 'جولات أثرية'],
      budgetLevel: 'LUXURY',
      disclaimersAr: ['مستوى تكلفة تقريبي: فاخر. يتم التحديد بعد المراجعة.'],
      status: 'ACTIVE',
    },
    {
      slug: 'istanbul-shopping',
      titleAr: 'باقة إسطنبول للتسوق',
      serviceType: 'PACKAGE',
      cityAr: 'إسطنبول',
      summaryAr: 'رحلة تسوق في البازارات.',
      idealFor: ['SHOPPING', 'CULTURE'],
      durationDays: 4,
      includesAr: ['فنادق', 'برنامج تسوق', 'جولات ثقافية'],
      budgetLevel: 'MIXED',
      disclaimersAr: ['مستوى تكلفة تقريبي: مختلط. يتم التحديد بعد المراجعة.'],
      status: 'ACTIVE',
    },
  ];

  for (const template of templates) {
    await prisma.tripTemplate.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });
    console.log('Created template:', template.titleAr);
  }

  // Stay Guides
  const stayGuides = [
    {
      type: 'CHALET',
      cityAr: 'الرياض',
      titleAr: 'شاليهات الرياض العائلية',
      descriptionAr: 'شاليهات مجهزة للعوائل.',
      featuresAr: ['مسبح خاص', 'جلسة خارجية', 'مطبخ مجهز', 'مكيفات'],
      idealFor: ['FAMILY', 'FRIENDS'],
      hasPoolHint: true,
      hasOutdoorSeatingHint: true,
      budgetLevel: 'MID',
      status: 'ACTIVE',
    },
    {
      type: 'CHALET',
      cityAr: 'جدة',
      titleAr: 'شاليهات جدة الساحلية',
      descriptionAr: 'شاليهات قريبة من الكورنيش.',
      featuresAr: ['قرب البحر', 'جلسة خارجية', 'مسبح', 'مطبخ'],
      idealFor: ['FAMILY', 'COUPLES'],
      hasPoolHint: true,
      hasOutdoorSeatingHint: true,
      budgetLevel: 'MID',
      status: 'ACTIVE',
    },
    {
      type: 'CHALET',
      cityAr: 'الخبر',
      titleAr: 'شاليهات الخبر البحرية',
      descriptionAr: 'شاليهات هادئة على الخليج.',
      featuresAr: ['إطلالة بحرية', 'جلسة خارجية', 'مسبح', 'هادئ'],
      idealFor: ['COUPLES', 'FRIENDS', 'FAMILY'],
      hasPoolHint: true,
      hasOutdoorSeatingHint: true,
      budgetLevel: 'MID',
      status: 'ACTIVE',
    },
    {
      type: 'RESTHOUSE',
      cityAr: 'الرياض',
      titleAr: 'استراحات الرياض للشباب',
      descriptionAr: 'استراحات مناسبة للرحلات الشبابية.',
      featuresAr: ['اقتصادية', 'مطبخ', 'جلسة', 'قريبة من الخدمات'],
      idealFor: ['FRIENDS', 'ADVENTURE'],
      budgetLevel: 'ECONOMY',
      status: 'ACTIVE',
    },
  ];

  for (const guide of stayGuides) {
    await prisma.stayGuide.create({ data: guide });
    console.log('Created stay guide:', guide.titleAr);
  }

  console.log('Seeding complete!');
  console.log('Destinations:', destinations.length);
  console.log('Templates:', templates.length);
  console.log('Stay Guides:', stayGuides.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
