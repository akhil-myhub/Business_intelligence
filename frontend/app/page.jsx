import Landing from '@/landing/Landing';

export const metadata = {
  title: 'Aavtor — See your entire business. From data to decisions.',
  description: 'Connect your sales, operations, products, customers, supply and business data in one AI-powered intelligence platform for FMCG.'
};

// Public marketing page. The workspace lives behind /login → /ask.
export default function Page() {
  return <Landing />;
}
