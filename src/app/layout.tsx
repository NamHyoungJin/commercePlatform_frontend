import type { Metadata } from 'next';
import { Noto_Sans_KR, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthBootstrap from '@/components/auth/AuthBootstrap';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '오직 한가지! www.onlyonemusic.kr',
  description: '온리원뮤직 악보',
  /**
   * 파비콘은 `public/`에 두어야 `output: 'export'` 정적 배포에서도 `/favicon.ico` 등으로 그대로 제공됨.
   * (`src/app/icon.png`만 두면 빌드 산출물·배포에 안 실릴 수 있음)
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${sourceSerif.variable} h-full`}>
      {/* 확장 프로그램이 body에 속성을 주입하면(예: cz-shortcut-listen) hydration 불일치가 남 → 해당 노드만 경고 억제 */}
      <body
        className="flex min-h-full flex-col bg-background antialiased text-text-secondary"
        suppressHydrationWarning
      >
        <AuthBootstrap>
          <Header />
          <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
          <Footer />
        </AuthBootstrap>
      </body>
    </html>
  );
}
