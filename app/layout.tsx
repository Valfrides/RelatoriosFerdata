import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ferdata Informática - Gestão de Serviços & Relatórios Técnicos',
  description: 'Sistema para registro de serviços técnicos prestados a clientes e emissão de relatórios formais em PDF.',
  openGraph: {
    title: 'Ferdata Informática - Gestão de Serviços & Relatórios Técnicos',
    description: 'Sistema para registro de serviços técnicos prestados a clientes e emissão de relatórios formais em PDF.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferdata Informática - Gestão de Serviços & Relatórios Técnicos',
    description: 'Sistema para registro de serviços técnicos prestados a clientes e emissão de relatórios formais em PDF.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
