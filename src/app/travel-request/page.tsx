'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, MapPin, Calendar, Users, Wallet, Briefcase, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const STEPS = [
  { id: 1, title: 'الوجهة', icon: MapPin },
  { id: 2, title: 'التواريخ', icon: Calendar },
  { id: 3, title: 'المسافرون', icon: Users },
  { id: 4, title: 'الميزانية', icon: Wallet },
  { id: 5, title: 'نوع الرحلة', icon: Briefcase },
  { id: 6, title: 'ملاحظات', icon: FileText },
  { id: 7, title: 'المراجعة', icon: CheckCircle },
];

const SERVICE_TYPES = [
  { value: 'FLIGHT', label: 'رحلات طيران' },
  { value: 'HOTEL', label: 'فنادق' },
  { value: 'PACKAGE', label: 'باقات' },
  { value: 'CHALET', label: 'شاليهات' },
  { value: 'RESTHOUSE', label: 'استراحات' },
  { value: 'MIXED', label: 'مختلطة' },
];

const BUDGET_LEVELS = [
  { value: 'ECONOMY', label: 'اقتصادية', desc: 'خيارات مناسبة للميزانية المحدودة' },
  { value: 'MID', label: 'متوسطة', desc: 'توازن بين الجودة والسعر' },
  { value: 'LUXURY', label: 'فاخرة', desc: 'تجارب استثنائية' },
  { value: 'MIXED', label: 'مختلطة', desc: 'اترك الخيار لنا' },
];

const POPULAR_DESTINATIONS = [
  'دبي', 'الرياض', 'جدة', 'القاهرة', 'اسطنبول', 'لندن', 'باريس', 'ماليزيا', 'تايلاند', 'المالديف'
];

export default function TravelRequestPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    destinationId: '',
    destinationName: '',
    templateId: '',
    serviceType: '',
    startDate: '',
    endDate: '',
    duration: '',
    guests: 1,
    rooms: 1,
    budgetLevel: '',
    notes: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData(prev => ({
      ...prev,
      destinationId: params.get('destinationId') || '',
      destinationName: params.get('destinationName') || '',
      templateId: params.get('templateId') || '',
    }));
  }, []);

  const updateForm = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.destinationName || formData.serviceType;
      case 2: return formData.startDate || formData.duration;
      case 3: return formData.guests > 0;
      case 4: return formData.budgetLevel;
      case 5: return formData.serviceType;
      case 6: return true;
      case 7: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/travel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'ENCYCLOPEDIA',
          serviceType: formData.serviceType || 'MIXED',
          destinationId: formData.destinationId || null,
          templateId: formData.templateId || null,
          cityAr: formData.destinationName || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          guests: formData.guests,
          rooms: formData.rooms,
          budgetLevel: formData.budgetLevel,
          notes: formData.notes || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setSubmitError('يلزم تسجيل الدخول لإرسال الطلب');
          return;
        }
        throw new Error(data.error?.message || 'حدث خطأ');
      }
      
      setSubmitSuccess(true);
      setReferenceNumber(data.data?.referenceNumber || null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBudgetLabel = (level: string) => BUDGET_LEVELS.find(b => b.value === level)?.label || '';
  const getServiceLabel = (type: string) => SERVICE_TYPES.find(s => s.value === type)?.label || '';

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-mist shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-cairo text-2xl font-bold text-charcoal mb-4">تم استلام طلبك</h1>
            <p className="font-cairo text-secondary mb-6">تم إرسال طلبك للمراجعة بنجاح</p>
            {referenceNumber && (
              <div className="bg-sand rounded-xl p-4 mb-6">
                <p className="font-cairo text-sm text-secondary mb-1">رقم الطلب</p>
                <p className="font-cairo font-bold text-charcoal text-lg">{referenceNumber}</p>
              </div>
            )}
            <div className="bg-champagne/10 rounded-xl p-4 mb-6 text-right">
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة مهمة:</strong> هذا ليس حجزًا مؤكدًا. الأسعار والتوفر يتم تأكيدها بعد المراجعة أو عبر مزود حجز فعلي.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push('/')} className="flex-1 py-3 bg-sand text-charcoal rounded-xl font-cairo font-semibold">العودة للرئيسية</button>
              <button onClick={() => router.push('/my-requests')} className="flex-1 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold">طلباتي</button>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-32">
      <Header />
      <div className="bg-charcoal text-white py-6 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-cairo text-2xl font-bold">طلب رحلة جديدة</h1>
          <p className="font-cairo text-champagne text-sm mt-1">أكمل النموذج خطوة بخطوة</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 -mt-4">
        <div className="bg-sand rounded-2xl p-4 border border-mist">
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button key={step.id} onClick={() => isCompleted && setCurrentStep(step.id)} disabled={!isCompleted && !isActive} className={'flex flex-col items-center ' + (isActive ? 'text-champagne' : isCompleted ? 'text-charcoal' : 'text-secondary')}>
                  <div className={'w-10 h-10 rounded-full flex items-center justify-center mb-1 ' + (isActive ? 'bg-champagne text-charcoal' : isCompleted ? 'bg-charcoal text-white' : 'bg-mist text-secondary')}>
                    <Icon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 border border-mist">
          {currentStep === 1 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">اختر الوجهة</h2>
              <div className="mb-4">
                <label className="block font-cairo text-sm text-secondary mb-2">أو اكتب اسم الوجهة</label>
                <input type="text" value={formData.destinationName} onChange={(e) => updateForm('destinationName', e.target.value)} placeholder="مثال: دبي، اسطنبول، لندن..." className="w-full px-4 py-3 border border-mist rounded-xl font-cairo focus:outline-none focus:border-champagne" />
              </div>
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">أو اختر من الأكثر شعبية</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button key={dest} onClick={() => updateForm('destinationName', dest)} className={'px-3 py-1.5 rounded-full text-sm font-cairo transition-all ' + (formData.destinationName === dest ? 'bg-champagne text-charcoal' : 'bg-sand text-charcoal hover:bg-champagne/20')}>{dest}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">متى تريد السفر؟</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">تاريخ البداية</label>
                  <input type="date" value={formData.startDate} onChange={(e) => updateForm('startDate', e.target.value)} className="w-full px-4 py-3 border border-mist rounded-xl font-cairo focus:outline-none focus:border-champagne" />
                </div>
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">تاريخ النهاية</label>
                  <input type="date" value={formData.endDate} onChange={(e) => updateForm('endDate', e.target.value)} className="w-full px-4 py-3 border border-mist rounded-xl font-cairo focus:outline-none focus:border-champagne" />
                </div>
              </div>
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">أو حدد المدة التقريبية</label>
                <div className="flex flex-wrap gap-2">
                  {['3 أيام', '5 أيام', '7 أيام', '10 أيام', '14 يوم', 'أكثر'].map((d) => (
                    <button key={d} onClick={() => updateForm('duration', d)} className={'px-4 py-2 rounded-full text-sm font-cairo transition-all ' + (formData.duration === d ? 'bg-champagne text-charcoal' : 'bg-sand text-charcoal hover:bg-champagne/20')}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">عدد المسافرين</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">عدد المسافرين</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateForm('guests', Math.max(1, formData.guests - 1))} className="w-12 h-12 bg-sand rounded-xl font-bold text-xl flex items-center justify-center">-</button>
                    <span className="font-cairo text-2xl font-bold flex-1 text-center">{formData.guests}</span>
                    <button onClick={() => updateForm('guests', formData.guests + 1)} className="w-12 h-12 bg-sand rounded-xl font-bold text-xl flex items-center justify-center">+</button>
                  </div>
                </div>
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">عدد الغرف</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateForm('rooms', Math.max(1, formData.rooms - 1))} className="w-12 h-12 bg-sand rounded-xl font-bold text-xl flex items-center justify-center">-</button>
                    <span className="font-cairo text-2xl font-bold flex-1 text-center">{formData.rooms}</span>
                    <button onClick={() => updateForm('rooms', formData.rooms + 1)} className="w-12 h-12 bg-sand rounded-xl font-bold text-xl flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">ما مستوى الميزانية؟</h2>
              <div className="space-y-3">
                {BUDGET_LEVELS.map((level) => (
                  <button key={level.value} onClick={() => updateForm('budgetLevel', level.value)} className={'w-full p-4 rounded-xl border text-right transition-all ' + (formData.budgetLevel === level.value ? 'border-champagne bg-champagne/10' : 'border-mist hover:border-champagne/50')}>
                    <div className="font-cairo font-semibold text-charcoal">{level.label}</div>
                    <div className="font-cairo text-sm text-secondary">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">نوع الرحلة</h2>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_TYPES.map((type) => (
                  <button key={type.value} onClick={() => updateForm('serviceType', type.value)} className={'p-4 rounded-xl border text-center transition-all ' + (formData.serviceType === type.value ? 'border-champagne bg-champagne/10' : 'border-mist hover:border-champagne/50')}>
                    <div className="font-cairo font-semibold text-charcoal">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentStep === 6 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">ملاحظات إضافية</h2>
              <textarea value={formData.notes} onChange={(e) => updateForm('notes', e.target.value)} placeholder="اكتب أي ملاحظات أو متطلبات خاصة..." rows={5} className="w-full px-4 py-3 border border-mist rounded-xl font-cairo focus:outline-none focus:border-champagne resize-none" />
              <p className="font-cairo text-sm text-secondary mt-2">يمكنك كتابة تفضيلات خاصة، متطلبات معينة، أو أي معلومات إضافية</p>
            </div>
          )}
          {currentStep === 7 && (
            <div>
              <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">مراجعة طلبك</h2>
              <div className="space-y-4">
                <div className="bg-sand rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="font-cairo text-sm text-secondary">الوجهة</p><p className="font-cairo font-semibold">{formData.destinationName || 'غير محدد'}</p></div>
                    <div><p className="font-cairo text-sm text-secondary">نوع الرحلة</p><p className="font-cairo font-semibold">{getServiceLabel(formData.serviceType) || 'غير محدد'}</p></div>
                    <div><p className="font-cairo text-sm text-secondary">التاريخ</p><p className="font-cairo font-semibold">{formData.startDate || formData.duration || 'غير محدد'}</p></div>
                    <div><p className="font-cairo text-sm text-secondary">الميزانية</p><p className="font-cairo font-semibold">{getBudgetLabel(formData.budgetLevel) || 'غير محدد'}</p></div>
                    <div><p className="font-cairo text-sm text-secondary">المسافرون</p><p className="font-cairo font-semibold">{formData.guests} مسافر</p></div>
                    <div><p className="font-cairo text-sm text-secondary">الغرف</p><p className="font-cairo font-semibold">{formData.rooms} غرفة</p></div>
                  </div>
                </div>
                {formData.notes && (
                  <div className="bg-sand rounded-xl p-4"><p className="font-cairo text-sm text-secondary mb-1">الملاحظات</p><p className="font-cairo">{formData.notes}</p></div>
                )}
                <div className="bg-champagne/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
                    <p className="font-cairo text-sm text-charcoal"><strong>ملاحظة:</strong> هذا الطلب يتم إرساله للمراجعة فقط. هذا ليس حجزًا مؤكدًا. يتم تأكيد السعر والتوفر بعد المراجعة أو عبر مزود الحجز.</p>
                  </div>
                </div>
              </div>
              {submitError && <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200"><p className="font-cairo text-red-600">{submitError}</p></div>}
            </div>
          )}
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 border border-mist flex gap-3">
          {currentStep > 1 && <button onClick={() => setCurrentStep(currentStep - 1)} className="flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo font-semibold"><ChevronRight className="w-5 h-5" />السابق</button>}
          <div className="flex-1" />
          {currentStep < 7 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold disabled:opacity-50">التالي<ChevronLeft className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold disabled:opacity-50">{isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}</button>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
