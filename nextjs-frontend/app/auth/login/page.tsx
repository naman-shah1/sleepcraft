'use client';

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { push: showToast } = useToast();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Sign-In button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(
            buttonRef.current,
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '100%',
            }
          );
        }

        // Optionally show One Tap prompt
        // window.google.accounts.id.prompt();
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      console.log('[Login Page] Google callback received');
      const result = await apiClient.post('/auth/google', {
        credential: response.credential,
      });

      console.log('[Login Page] OAuth response:', result.data);

      if (result.data.success) {
        const { tokens, user } = result.data.data;
        
        console.log('[Login Page] Calling login() with tokens:', tokens);
        login(user, tokens);
        showToast('Successfully signed in with Google!', 'success');
        router.push('/');
      } else {
        showToast(result.data.error || 'Login failed', 'error');
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Failed to sign in with Google';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-poppins font-semibold mb-6 text-center">Sign In</h1>

        <div className="space-y-4">
          <p className="text-gray-600 text-center mb-6">
            Sign in with your Google account to continue
          </p>
          
          {/* Google Sign-In Button will be rendered here */}
          <div ref={buttonRef} className="w-full flex justify-center"></div>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Don't have an account? Sign in with Google to create one automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

