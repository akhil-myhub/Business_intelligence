import { authConfig } from '@/config/auth';
import LoginScreen from '@/screens/Login';

export const metadata = { title: 'Sign in | BusinessAI' };

// Only same-site relative paths are honoured after login (no open redirects).
const safeNext = v => (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/login') ? v : '/');

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const hint = authConfig.showHint ? { email: authConfig.email, password: authConfig.password } : null;
  return (
    <div className="app">
      <div className="bg" />
      <LoginScreen next={safeNext(next)} hint={hint} />
    </div>
  );
}
