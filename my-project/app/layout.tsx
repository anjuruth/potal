import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '../style/globals.css';

export const metadata: Metadata = {
  title: 'PlaceCell — Placement Portal',
  description: 'College placement management portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
