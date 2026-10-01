import { notFound } from 'next/navigation';
import ProductDetailScreen from '@/screens/ProductDetail';
import { PRODUCT_OPTIONS } from '@/lib/catalog';

export const metadata = { title: 'Product | BusinessAI' };

export default async function Page({ params }) {
  const { id } = await params;
  if (!PRODUCT_OPTIONS.some(p => p.id === id)) notFound();
  return <ProductDetailScreen id={id} />;
}
