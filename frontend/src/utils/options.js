export const STATUS_META = {
  APPLIED: {
    label: 'Applied',
    badgeClassName: 'bg-blue-50 text-blue-700 ring-blue-200',
    chartColor: '#2563eb',
  },
  SCREENING: {
    label: 'Screening',
    badgeClassName: 'bg-amber-50 text-amber-700 ring-amber-200',
    chartColor: '#d97706',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClassName: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
    chartColor: '#a21caf',
  },
  OFFER: {
    label: 'Offer',
    badgeClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    chartColor: '#059669',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClassName: 'bg-rose-50 text-rose-700 ring-rose-200',
    chartColor: '#dc2626',
  },
  GHOSTED: {
    label: 'Ghosted',
    badgeClassName: 'bg-slate-100 text-slate-600 ring-slate-200',
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
