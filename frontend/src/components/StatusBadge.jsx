const statusMap = {
  pending: { label: 'Pending', className: 'badge-pending' },
  preparing: { label: 'Preparing', className: 'badge-preparing' },
  ready: { label: 'Ready!', className: 'badge-ready' },
  completed: { label: 'Completed', className: 'badge-completed' },
}

export default function StatusBadge({ status }) {
  const s = statusMap[status] || statusMap.pending
  return (
    <span className={s.className}>
      {s.label}
    </span>
  )
}
