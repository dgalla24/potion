import type { Metadata } from 'next';
import './globals.css';
import { PotionProvider } from '@/hooks/usePotion';
import { ThemeProvider } from '@/hooks/useTheme';

export const metadata: Metadata = {
  title: 'Potion - Productivity Tool',
  description: 'A simple productivity tool for managing assignments and tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <PotionProvider>
            {children}
          </PotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}