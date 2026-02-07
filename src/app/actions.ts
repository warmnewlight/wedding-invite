'use server';

import { revalidatePath, revalidateTag } from 'next/cache'; // 🟢 Import revalidateTag
import { base } from '../lib/airtable';


export async function submitRSVP(formData: FormData) {
  const recordId = formData.get('recordId') as string;
  const dietary = formData.get('dietary') as string;
  // 🟢 NEW: Get the names
  const guestNames = formData.get('guestNames') as string; 

  if (!recordId) return { success: false, message: 'Missing Record ID' };

  const fieldsToUpdate: Record<string, any> = {
    'RSVP Status': 'Responded',
    'Dietary Requirements': dietary || '',
    'Guest Names': guestNames || '', // 🟢 NEW: Save to Airtable
  };

  // 3. Loop through all form data to find the Events
  // The form sends keys like "rsvp_Holy Matrimony"
  // We need to convert them to "RSVP - Holy Matrimony"
 for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith('rsvp_')) {
      const eventName = key.replace('rsvp_', '');
      fieldsToUpdate[`RSVP - ${eventName}`] = value;
    }
    if (key.startsWith('count_adults_')) {
      const eventName = key.replace('count_adults_', '');
      fieldsToUpdate[`Adult Count - ${eventName}`] = parseInt(value as string);
    }
    if (key.startsWith('count_kids_')) {
      const eventName = key.replace('count_kids_', '');
      fieldsToUpdate[`Kids Count - ${eventName}`] = parseInt(value as string);
    }
  }

  try {
    await base('Guests').update([{ 
      id: recordId, 
      fields: fieldsToUpdate 
    }]);
    
    revalidateTag('guest', 'max'); 
     
     return { success: true };
   } catch (error) {
    console.error('Failed to update RSVP:', error);
    return { success: false, message: 'Database Error' };
  }
}
// ---------------------------------------------------------
// WISH ACTION (Keep this if you have the Wish form too)
// ---------------------------------------------------------
export async function submitWish(formData: FormData) {
  const recordId = formData.get('recordId') as string;
  const wish = formData.get('wish') as string;

  if (!recordId) return { success: false };

  try {
    await base('Guests').update([{ 
      id: recordId, 
      fields: { 'Wish': wish } 
    }]);

    // 🟢 MAGICAL LINE: This tells Next.js "The 'wishes' data is old, fetch it fresh next time."
    revalidateTag('wishes', 'max'); 
    
    // Return the wish text back to the client so it can "update" itself
    return { success: true, wish: wish };
  } catch (error) {
    console.error('Failed to submit wish:', error);
    return { success: false };
  }
}