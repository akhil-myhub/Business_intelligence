import SettingsScreen from '@/screens/Settings';
import { getServerUser } from '@/server/currentUser';

export const metadata = { title: 'Settings | BusinessAI' };

export default async function Page() {
  return <SettingsScreen user={await getServerUser()} />;
}
