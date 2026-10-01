import { notFound } from 'next/navigation';
import DrillScreen from '@/screens/Drill';
import { STATE_OPTIONS } from '@/lib/catalog';

export const metadata = { title: 'State drill-down | BusinessAI' };

export default async function Page({ params }) {
  const { state } = await params;
  if (!STATE_OPTIONS.some(s => s.slug === state)) notFound();
  return <DrillScreen slug={state} />;
}
