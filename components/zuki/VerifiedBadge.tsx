export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      aria-label="Verified by Zuki"
    >
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="white" />
      <path
        d="M10 10 L22 10 L10 22 L22 22"
        stroke="#2D2D2D"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
