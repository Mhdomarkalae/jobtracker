import { STATUS_META } from '../utils/options'

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.APPLIED

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  )
}

export default StatusBadge
