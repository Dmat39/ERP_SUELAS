import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERP Suelas',
  description: 'Sistema de gestión para fábrica de suelas de zapato',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
