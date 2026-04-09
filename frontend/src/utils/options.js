export const STATUS_META = {
  APPLIED: {
    label: 'Applied',
    badgeClassName: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-400/30',
    chartColor: '#2563eb',
  },
  SCREENING: {
    label: 'Screening',
    badgeClassName: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30',
    chartColor: '#d97706',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClassName: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:ring-fuchsia-400/30',
    chartColor: '#a21caf',
  },
  OFFER: {
    label: 'Offer',
    badgeClassName: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30',
    chartColor: '#059669',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClassName: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30',
    chartColor: '#dc2626',
  },
  GHOSTED: {
    label: 'Ghosted',
    badgeClassName: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-600/30',
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
