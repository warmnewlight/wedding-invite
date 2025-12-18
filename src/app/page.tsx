import VerticalSwipe from '../components/VerticalSwipe';
import { getGuestByCode } from '../lib/airtable';
import { getWishes } from '../lib/airtable'; // 🟢 Import getWishes

// 🟢 ADD THIS LINE HERE:
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  // 🟢 CHANGE 1: We now expect a "to" parameter, not "id"
  searchParams: Promise<{ to?: string }>; 
}) {
  const params = await searchParams;
  
  // 🟢 CHANGE 2: Extract the code from "to"
  const guestCode = params.to;
  
  // The rest of your logic stays the same!
  // We just pass the code (e.g. "agk77") to your existing function.
  const guest = guestCode ? await getGuestByCode(guestCode) : null;

  console.log("Found Guest:", guest);

  // 🟢 Fetch all public wishes
  const publicWishes = await getWishes();

  // 🟢 Pass them to the component
  return <VerticalSwipe guest={guest} publicWishes={publicWishes} />;
}