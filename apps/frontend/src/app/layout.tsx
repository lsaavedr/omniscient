import './globals.css';

export const metadata = {
  title: 'Production Orders',
  description: 'Mini Production Orders SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
