import { STATUS_META } from '../utils/options'

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.APPLIED

  return (
    <span
      className={`status-badge ${meta.badgeClassName}`}
    >
      <span 
        className="h-1.5 w-1.5 rounded-full" 
        style={{ backgroundColor: meta.chartColor }}
      />
      {meta.label}
    </span>
  )
}

export default StatusBadge
