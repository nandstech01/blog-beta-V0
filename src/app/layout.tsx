import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sb1-zdcguq-beta-v1.vercel.app'),
  title: 'SB1 ZDCGUQ',
  description: 'SB1 ZDCGUQ website',
  openGraph: {
    title: 'Next Forward | 退職あんしん代行の労働問題解決ガイド',
    description: '退職交渉でお困りの方へ、プロフェッショナルが解決策をご提案。労働問題の専門家が、あなたの「次へ進むための一歩」をサポートします。退職代行サービスの活用方法から、働く人の権利まで、詳しく解説しています。',
    url: 'https://taishoku-anshin-daiko-blog.vercel.app',
    siteName: 'Next Forward - 退職あんしん代行',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Next Forward - 労働問題解決ガイド',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next Forward | 退職あんしん代行の労働問題解決ガイド',
    description: '退職交渉でお困りの方へ、プロフェッショナルが解決策をご提案。労働問題の専門家が、あなたの「次へ進むための一歩」をサポートします。',
  },
  alternates: {
    canonical: 'https://taishoku-anshin-daiko-blog.vercel.app',
  },
  keywords: 'Next Forward,退職代行,労働問題,退職交渉,退職方法,退職あんしん代行,キャリア相談,労働相談,転職支援',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  authors: [{ name: '退職あんしん代行' }],
  publisher: '株式会社エヌアンドエス',
  other: {
    'google-site-verification': 'your-google-verification-code',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}