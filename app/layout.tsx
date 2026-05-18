import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { Amplify } from 'aws-amplify';
import '@/sass/app.scss';
import '@aws-amplify/ui-react/styles.css';
import outputs from '@/amplify_outputs.json';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage } from 'aws-amplify/utils';

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

Amplify.configure(outputs);
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'SF-Zero webApps | Mayekawa',
  description: 'A web application that includes all user functions for the SF-Zero.',
  creator: 'Takeo Fujimoto',
  robots: {
    index: false,
    follow: false,
    nocache: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}
