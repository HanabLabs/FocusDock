'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-12 pb-6 px-4 text-center text-xs text-gray-500">
      <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-4">
        <span>© {currentYear} FocusDock. All rights reserved.</span>
        <span className="hidden md:inline">•</span>
        <Link
          href="/terms"
          className="hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
        >
          Terms of Service
        </Link>
        <span className="hidden md:inline">•</span>
        <Link
          href="/privacy"
          className="hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
        >
          Privacy Policy
        </Link>
        <span className="hidden md:inline">•</span>
        <a
          href="mailto:habab@hanablabs.info"
          className="hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}

