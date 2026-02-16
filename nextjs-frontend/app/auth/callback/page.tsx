'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handle = async () => {
      try {
        // First, check if tokens were provided in the URL fragment by the
        // backend redirect (we put tokens in the fragment for browser-based
        // redirects). Example: /auth/callback#access=...&refresh=...
        const hash = window.location.hash || '';
        if (hash.includes('access=')) {
          const frag = new URLSearchParams(hash.replace(/^#/, ''));
          const access = frag.get('access');
          const refresh = frag.get('refresh');
          if (access && refresh) {
            // Set cookies for frontend usage. For local http dev we avoid
            // marking Secure so cookies can be stored.
            const Cookies = (await import('js-cookie')).default;
            const isHttps = window.location.protocol === 'https:';
            Cookies.set('access_token', access, { expires: 1, secure: isHttps ? true : false, sameSite: 'strict' });
            Cookies.set('refresh_token', refresh, { expires: 7, secure: isHttps ? true : false, sameSite: 'strict' });
            setStatus('success');
            router.replace('/');
            return;
          }
        }

        // Otherwise, Google redirected back with code and state in query params.
        // We need to POST them back to the backend along with the redirect_uri
        // so the backend can validate the state (which is stored in the Flask session).
        // This ensures the browser sends the session cookie with the POST request.
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        if (!code) throw new Error('Missing `code` in callback URL');
        if (!state) throw new Error('Missing `state` in callback URL');

        const redirectUri = `${window.location.origin}/auth/callback`;
        
        // POST the code and state to the backend callback endpoint.
        // This ensures the Flask session cookie is sent with the request.
        const res = await apiClient.handleGoogleCallbackWithState(code, state, redirectUri);
        if (res.data?.data?.tokens) {
          const Cookies = (await import('js-cookie')).default;
          const isHttps = window.location.protocol === 'https:';
          Cookies.set('access_token', res.data.data.tokens.access, { 
            expires: 1,
            secure: isHttps,
            sameSite: 'Lax'
          });
          Cookies.set('refresh_token', res.data.data.tokens.refresh, { 
            expires: 7,
            secure: isHttps,
            sameSite: 'Lax'
          });
        }
        setStatus('success');
        router.replace('/');
      } catch (err: any) {
        console.error('Callback handling failed', err);
        console.error('Response data:', err?.response?.data);
        // Prefer detailed server error if available (we return JSON with 'error' and optional 'exception')
        const serverError = err?.response?.data?.error || err?.response?.data;
        if (serverError) {
          // show JSON if present
          const pretty = typeof serverError === 'string' ? serverError : JSON.stringify(serverError, null, 2);
          setMessage(pretty);
        } else {
          setMessage(err?.message || 'OAuth callback failed');
        }
        setStatus('error');
      }
    };

    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <div className="p-8 bg-white rounded shadow">Completing sign-in...</div>}
      {status === 'success' && <div className="p-8 bg-white rounded shadow text-green-600">Signed in — redirecting...</div>}
      {status === 'error' && <div className="p-8 bg-white rounded shadow text-red-600">{message}</div>}
    </div>
  );
}
