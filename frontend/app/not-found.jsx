import Link from 'next/link';
import { StatusPage } from '@/components/StatusPage';

export const metadata = { title: 'Page not found | BusinessAI' };

export default function NotFound() {
  return (
    <StatusPage code="404" title="Page not found" message="The page you are looking for doesn't exist or has moved.">
      <Link href="/" className="btn primary">Back to workspace</Link>
    </StatusPage>
  );
}
