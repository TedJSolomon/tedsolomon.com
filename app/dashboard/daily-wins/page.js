import { redirect } from 'next/navigation';

export default function DailyWinsRedirect() {
  redirect('/dashboard/wins');
}
