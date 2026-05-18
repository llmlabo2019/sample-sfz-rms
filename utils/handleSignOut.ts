'use client';

import { signOut } from 'aws-amplify/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * サインアウト処理を共通化
 * @param router Next.js の useRouter() で取得した router インスタンス
 */
export const handleSignOut = async (router: AppRouterInstance): Promise<void> => {
  try {
    await signOut();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    router.push('/login');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};