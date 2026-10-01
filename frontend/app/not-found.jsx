import Link from 'next/link';

export const metadata = { title: 'Page not found | Lumen AI' };

export default function NotFound() {
  return (
    <main className="boundary" style={{ minHeight: '100vh', color: '#fff' }}>
      <h2>Page not found</h2>
      <p style={{ color: '#d6defa' }}>The page you are looking for does not exist.</p>
      <Link href="/" className="btn primary">Back to workspace</Link>
    </main>
  );
}
