import type { Metadata } from 'next';
import '@/styles/tokens.css';
import '@/styles/fonts.css';
import '@/styles/type.css';
import '@/styles/globals.css';

const SITE_URL = 'https://remibousk.com';
const OG_IMAGE = '/images/9sFnJYCbSWOEMtc6kSRQadieHHY.png';
const DESCRIPTION =
  'leading design for founders, and global companies on new ventures, strategy and company defining experiences.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Remi Bouskila',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    title: 'Remi Bouskila',
    description: DESCRIPTION,
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remi Bouskila',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/favicon/icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('folio-theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';}else{document.documentElement.style.colorScheme='dark';}}catch(e){document.documentElement.style.colorScheme='dark';}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
