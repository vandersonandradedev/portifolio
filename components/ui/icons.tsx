type IconProps = {
  className?: string;
  filled?: boolean;
};

export function HeartIcon({ className = 'h-3.5 w-3.5', filled = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20.5s-7.2-4.35-9.4-8.55C1.2 9.05 2.35 5.5 5.7 4.55c1.9-.55 3.85.2 5.05 1.7 1.2-1.5 3.15-2.25 5.05-1.7 3.35.95 4.5 4.5 3.1 7.4C19.2 16.15 12 20.5 12 20.5z" />
    </svg>
  );
}

export function EyeIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
