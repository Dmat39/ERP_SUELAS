// Marca de la casa: silueta de suela con líneas de huella, en el chip teal.
// Se usa en el sidebar, el inicio del admin, el login y el storefront.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.5c2.6 0 4.8 2 5.1 4.9.2 1.9-.5 3.2-1 4.9-.5 1.5-.5 3-.2 4.6.4 2.4-1.1 4.6-3.9 4.6s-4.3-2.2-3.9-4.6c.3-1.6.3-3.1-.2-4.6-.5-1.7-1.2-3-1-4.9C7.2 4.5 9.4 2.5 12 2.5z" />
        <path d="M9.3 8.2h5.4M9.3 11.2h5.4M9.8 17.5h4.4" />
      </svg>
    </div>
  );
}
