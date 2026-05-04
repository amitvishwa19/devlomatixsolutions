'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation';

const GSI_SCRIPT_ID = 'google-identity-services';

function clearOneTapSuppressionCookie() {
  const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `g_state=; path=/; ${expires}`;
  document.cookie = `g_state=; path=/; domain=${window.location.hostname}; ${expires}`;
}

function loadGoogleIdentityScript(onReady) {
  if (window.google?.accounts?.id) {
    onReady();
    return;
  }

  const existingScript = document.getElementById(GSI_SCRIPT_ID);
  if (existingScript) {
    existingScript.addEventListener('load', onReady, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = GSI_SCRIPT_ID;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.addEventListener('load', onReady, { once: true });
  document.head.appendChild(script);
}

export default function GoogleOneTapLogin({ clientId, autoPrompt = true }) {
  const router = useRouter();
  const { status } = useSession({ required: false });
  const signingInRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    loadGoogleIdentityScript(() => setScriptReady(true));
  }, []);

  useEffect(() => {
    if (autoPrompt && scriptReady && !hasPrompted && status === 'unauthenticated') {
      setHasPrompted(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('crystal-aura:google-one-tap'));
      }, 100);
    }
  }, [autoPrompt, scriptReady, hasPrompted, status]);

  const promptOneTap = useCallback((event) => {
    if (!clientId || status !== 'unauthenticated' || !scriptReady || !window.google?.accounts?.id) return;

    const manual = event?.type === 'crystal-aura:google-one-tap';

    clearOneTapSuppressionCookie();

    window.__crystalAuraGoogleOneTap = window.__crystalAuraGoogleOneTap || {};
    window.__crystalAuraGoogleOneTap.onCredential = async (credentialResponse) => {
      if (signingInRef.current || !credentialResponse?.credential) return;

      signingInRef.current = true;
      const result = await signIn('google-one-tap', {
        credential: credentialResponse.credential,
        redirect: false,
      });

      signingInRef.current = false;

      if (!result?.error) {
        router.refresh();
      }
    };

    const oneTapState = window.__crystalAuraGoogleOneTap;

    if (oneTapState.initializedClientId !== clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          window.__crystalAuraGoogleOneTap?.onCredential?.(credentialResponse);
        },
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
      });

      oneTapState.initializedClientId = clientId;
    }

    window.google.accounts.id.prompt((notification) => {
      if (!manual) return;

      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        signIn('google', { callbackUrl: '/' }, { prompt: 'select_account' });
      }
    });
  }, [clientId, router, scriptReady, status]);

  useEffect(() => {
    window.addEventListener('crystal-aura:google-one-tap', promptOneTap);

    return () => {
      window.removeEventListener('crystal-aura:google-one-tap', promptOneTap);
    };
  }, [promptOneTap]);

  useEffect(() => {
    if (status === 'authenticated') {
      window.google?.accounts?.id?.cancel();
    }
  }, [status]);

  return null;
}
