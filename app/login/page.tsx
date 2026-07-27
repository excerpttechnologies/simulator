'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Unable to reach the server. Please try again later.');
    }
  }

  return (
    <main className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm"
        style={{
          background: '#222222',
          borderRadius: '20px',
          padding: '40px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="block text-center text-lg font-black tracking-tight text-white mb-6 hover:text-[#CCFF00] transition-colors"
        >
          Accountin.
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1 text-center">Welcome back</h1>
        <p className="text-sm mb-7 text-center" style={{ color: '#888888' }}>
          Sign in to your Accountin account
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-xl px-5 py-3 text-sm outline-none text-white"
            style={{
              background: '#333333',
              border: `1px solid ${error && !email.trim() ? '#ff5555' : '#444444'}`,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = error && !email.trim() ? '#ff5555' : '#444444')}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl px-5 py-3 text-sm outline-none text-white"
            style={{
              background: '#333333',
              border: `1px solid ${error && !password ? '#ff5555' : '#444444'}`,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = error && !password ? '#ff5555' : '#444444')}
          />

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs hover:text-[#CCFF00] transition-colors"
              style={{ color: '#888888' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-center rounded-lg px-3 py-2" style={{ color: '#ff5555', background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 mt-1 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#a8cc00' : '#CCFF00',
              color: '#000',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg
                  className="animate-spin"
                  width="16" height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#333' }} />
          <span className="text-xs" style={{ color: '#555' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#333' }} />
        </div>

        {/* Sign up link */}
        <p className="text-xs text-center" style={{ color: '#888888' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#CCFF00' }} className="font-semibold hover:underline">
            Sign up free →
          </Link>
        </p>
      </div>
    </main>
  );
}
