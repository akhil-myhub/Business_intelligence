import { BrandLoader } from '@/components/BrandLoader';

// Shown instantly while a screen's server component loads during navigation.
export default function Loading() {
  return <div className="route-loading"><BrandLoader size={46} label="Loading workspace" tone="light" showLabel /></div>;
}
