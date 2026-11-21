import { redirect } from 'next/navigation';
import { getAuthDestination } from '@/features/auth/server/getAuthDestination';

export default async function Home() {
  redirect(await getAuthDestination());
}
