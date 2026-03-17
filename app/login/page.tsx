'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import NavBar from '@/components/homepage/navbar';
import { loginWithGoogle, loginWithApple, login } from './actions';

export default function LanyardLogin() {
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <NavBar />

      {/* Background Image */}
      <Image
        src={isDark ? '/assets/background.png' : '/assets/background_light.png'}
        alt="Trading Terminal Dashboard Preview"
        fill
        priority
        className="object-cover object-center mt-12"
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          isDark ? 'bg-black/70 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md'
        }`}
      />

      {/* Login Card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`rounded-lg shadow-2xl border-4 overflow-hidden ${
            isDark ? 'bg-black bg-opacity-90 border-black' : 'bg-zinc-50 bg-opacity-95 border-white'
          }`}
          style={{ width: '280px', backdropFilter: 'blur(10px)' }}
        >
          {/* Header */}
          <div className={`py-1 px-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <div className="text-center relative">
              <div className="relative w-48 h-8 mx-auto">
                <Image
                  src={isDark ? '/assets/Design 1 (1).png' : '/assets/Design 1.png'}
                  alt="Logo"
                  fill
                  priority
                  className="object-contain object-top"
                />
              </div>
              <p className="text-xs font-medium mt-2">AUTHORIZED ACCESS</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Authentication section */}
            <div className="mb-4 text-center">
              <div className={`text-xs font-semibold tracking-widest mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                AUTHENTICATION
              </div>
              <div className={`h-px w-full ${isDark ? 'bg-white' : 'bg-black'} mb-3`} />
            </div>

            <div className="space-y-2 mb-3">
              <form action={loginWithGoogle}>
                <Button
                  type="submit"
                  variant="outline"
                  className={`relative w-full flex items-center gap-2 h-9 text-xs font-semibold ${
                    isDark
                      ? 'border-black bg-black hover:border-white hover:bg-black text-white hover:text-white'
                      : 'border-white bg-white hover:border-white hover:bg-black text-black hover:text-white'
                  }`}
                >
                  <GoogleIcon />
                  <span className="flex-1 text-left">Google</span>
                </Button>
              </form>

              <form action={loginWithApple}>
                <Button
                  type="submit"
                  variant="outline"
                  className={`relative w-full flex items-center gap-2 h-9 text-xs font-semibold ${
                    isDark
                      ? 'border-black bg-black hover:border-white hover:bg-black text-white hover:text-white'
                      : 'border-white bg-white hover:border-white hover:bg-black text-black hover:text-white'
                  }`}
                >
                  <AppleIcon isDark={isDark} />
                  <span className="flex-1 text-left">Apple</span>
                </Button>
              </form>
            </div>

            {/* Credentials section */}
            <div className="mb-4 text-center">
              <div className={`text-xs font-semibold tracking-widest mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                CREDENTIALS
              </div>
              <div className={`h-px w-full ${isDark ? 'bg-white' : 'bg-black'} mb-3`} />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
                  ID / EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@vdcapital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`h-9 text-xs font-mono ${
                    isDark
                      ? 'bg-black border-black text-white placeholder-zinc-200 focus:border-black'
                      : 'bg-white border-white text-black placeholder-zinc-800 focus:border-white'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
                  PIN / PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`h-9 text-xs font-mono ${
                    isDark
                      ? 'bg-black border-black text-white placeholder-zinc-200 focus:border-black'
                      : 'bg-white border-white text-black placeholder-zinc-800 focus:border-white'
                  }`}
                />
              </div>

              <form action={login}>
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
                <Button
                  type="submit"
                  className={`relative w-full h-10 font-bold shadow-lg text-xs tracking-widest mt-3 ${
                    isDark
                      ? 'bg-black text-white hover:bg-white hover:text-black border border-white'
                      : 'bg-white text-black hover:bg-black hover:text-white border border-black'
                  }`}
                >
                  GRANT ACCESS
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className={`text-center text-xs mt-4 pt-3 border-t ${isDark ? 'border-slate-700 text-slate-500' : 'border-zinc-200 text-zinc-800'}`}>
              <div className="font-mono text-xs mb-1">SEC-ID: VDC-2025-AUTH</div>
              <div className="text-xs">
                <a href="#" className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-500 hover:text-black'}`}>
                  Request Access
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={isDark ? '#fff' : '#000'}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}