'use client';

import React, { useState, Suspense } from 'react';
import Screen from '@/components/Screen';
import Menu from '@/components/Menu';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { InfomationProvider, useInfo } from '@/context/InfomationContext';
import CustomInfo from '@/components/CustomInfo';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import GlobalLoader from '@/components/GlobalLoader';
import { DialogueProvider, useDialogue } from '@/context/DialogueContext';
import { DeleteDialogueProvider } from '@/context/DeleteDialogueContext';
import { ErrorProvider, useError } from '@/context/ErrorContext';
import { TitleProvider, useTitle } from '@/context/TitleContext';

Amplify.configure(outputs);

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      router.push('/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Suspense fallback={<div>読み込み中...</div>}>
        <ErrorProvider>
          <LoadingProvider>
            <DialogueProvider>
              <InfomationProvider>
                <DeleteDialogueProvider>
                  <TitleProvider>
                    <CustomAlertWrapper />
                    <GlobalLoader />
                    <ScreenWrapper onToggleMenu={handleToggleMenu}>{children}</ScreenWrapper>
                  </TitleProvider>
                </DeleteDialogueProvider>
              </InfomationProvider>
            </DialogueProvider>
          </LoadingProvider>
        </ErrorProvider>
      </Suspense>

      <Menu isMenuOpen={isMenuOpen} onCloseMenu={handleCloseMenu} onSignOut={handleSignOut} />
    </>
  );
}

function ScreenWrapper({ children, onToggleMenu }: { children: React.ReactNode; onToggleMenu: () => void }) {
  const { titleName } = useTitle();

  return (
    <Screen onToggleMenu={onToggleMenu} titleName={titleName}>
      {children}
    </Screen>
  );
}

function CustomAlertWrapper() {
  const { message, show, clearInfo } = useInfo();
  return <CustomInfo show={show} message={message} onClose={clearInfo} />;
}
