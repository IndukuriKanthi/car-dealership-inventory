interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
