'use client';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Full-bleed background art, swapped purely via CSS based on the .dark class
// on <html> — no JS state needed, reacts instantly to the Header toggle.
export default function AppBackground() {
  return (
    <>
      <div
        aria-hidden
        className="block dark:hidden fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${BASE_PATH}/backgrounds/bg-light.png)` }}
      />
      <div
        aria-hidden
        className="hidden dark:block fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${BASE_PATH}/backgrounds/bg-dark.png)` }}
      />
    </>
  );
}
