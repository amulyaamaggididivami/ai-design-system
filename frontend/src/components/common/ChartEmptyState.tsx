interface ChartEmptyStateProps {
  width: number;
  height: number;
  message?: string;
  'data-testid'?: string;
}

export function ChartEmptyState({
  width,
  height,
  message = 'No data available',
  'data-testid': testId,
}: ChartEmptyStateProps) {
  return (
    <div
      data-testid={testId}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
        fontFamily: "'Satoshi Variable', 'DM Sans', sans-serif",
      }}
    >
      {message}
    </div>
  );
}
