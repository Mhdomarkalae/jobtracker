export const STATUS_META = {
  APPLIED: {
    label: 'Applied',
    badgeClassName:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/25 dark:bg-blue-950/35 dark:text-blue-200',
    chartColor: '#2563eb',
  },
  SCREENING: {
    label: 'Screening',
    badgeClassName:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/35 dark:text-amber-100',
    chartColor: '#d97706',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClassName:
      'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-500/25 dark:bg-fuchsia-950/35 dark:text-fuchsia-100',
    chartColor: '#a21caf',
  },
  OFFER: {
    label: 'Offer',
    badgeClassName:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/35 dark:text-emerald-100',
    chartColor: '#059669',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClassName:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/25 dark:bg-rose-950/35 dark:text-rose-100',
    chartColor: '#dc2626',
  },
  GHOSTED: {
    label: 'Ghosted',
    badgeClassName:
      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600/40 dark:bg-slate-800/50 dark:text-slate-300',
    chartColor: '#64748b',
  },
}

export const APPLICATION_STATUS_OPTIONS = Object.keys(STATUS_META)

export const INTERVIEW_TYPE_LABELS = {
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  FINAL: 'Final',
  OTHER: 'Other',
}

export const INTERVIEW_TYPE_OPTIONS = Object.keys(INTERVIEW_TYPE_LABELS)
