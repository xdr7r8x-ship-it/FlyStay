'use client';

import { AlertCircle, Inbox } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'حدث خطأ',
  message = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-error">
        <AlertCircle size={48} />
      </div>
      <h3 className="font-cairo text-xl font-semibold text-charcoal">{title}</h3>
      <p className="font-cairo text-secondary max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium hover:opacity-90 transition-opacity"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'heart' | 'bell' | 'orders' | 'package';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  inbox: Inbox,
  search: Inbox,
  heart: Inbox,
  bell: Inbox,
  orders: Inbox,
  package: Inbox,
};

export function EmptyState({
  icon = 'inbox',
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي عناصر.',
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-champagne">
        <Inbox size={64} />
      </div>
      <h3 className="font-cairo text-xl font-semibold text-charcoal">{title}</h3>
      <p className="font-cairo text-secondary max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
