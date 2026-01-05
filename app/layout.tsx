import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n';
import { HideDevIndicator } from '@/components/hide-dev-indicator';
import './globals.css';

export const metadata: Metadata = {
  title: 'FocusDock - Developer Dashboard',
  description: 'Visualize your development journey with GitHub, work hours, and Spotify integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <I18nProvider>{children}</I18nProvider>
        <HideDevIndicator />
      </body>
    </html>
  );
}
