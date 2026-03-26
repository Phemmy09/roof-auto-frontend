const COLORS = {
  pending:    'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  review:     'bg-blue-100 text-blue-700',
  complete:   'bg-green-100 text-green-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${COLORS[status] || COLORS.pending}`}>
      {status === 'processing' && (
        <span className="mr-1 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
      )}
      {status}
    </span>
  )
}
