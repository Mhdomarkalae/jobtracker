import { format, parseISO } from 'date-fns'
import { INTERVIEW_TYPE_LABELS, STATUS_META } from './options'

export function formatDate(value) {
  if (!value) {
    return 'N/A'
  }

  return format(parseISO(value), 'MMM dd, yyyy')
}

export function formatDateTime(value) {
  if (!value) {
    return 'N/A'
  }

  return format(parseISO(value), 'MMM dd, yyyy hh:mm a')
}

export function formatStatusLabel(status) {
  return STATUS_META[status]?.label ?? status
}

export function formatInterviewTypeLabel(type) {
  return INTERVIEW_TYPE_LABELS[type] ?? type
}

export function toDateInputValue(value) {
  return value ? format(parseISO(value), 'yyyy-MM-dd') : ''
}

export function toDateTimeInputValue(value) {
  return value ? format(parseISO(value), "yyyy-MM-dd'T'HH:mm") : ''
}

export function sortApplicationsByDateApplied(applications) {
  return [...applications].sort((left, right) => {
    return parseISO(right.dateApplied).getTime() - parseISO(left.dateApplied).getTime()
  })
}

export function formatSalary(value) {
  if (value == null) {
    return ''
  }
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return String(value)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}
