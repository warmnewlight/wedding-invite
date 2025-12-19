'use server';

import { revalidatePath } from 'next/cache';
import { base } from '../lib/airtable';


export async function submitRSVP(formData: FormData) {
  const recordId = formData.get('recordId') as string;
  
  // 1. Get the general text fields
  const dietary = formData.get('dietary') as string;

  if (!recordId) return { success: false, message: 'Missing Record ID' };

  // 2. Prepare the data object for Airtable
  // We start with the general columns
  const fieldsToUpdate: Record<string, any> = {
    'RSVP Status': 'Responded', // 🟢 AUTOMATED STATUS
    'Dietary Requirements': dietary || '', // 🟢 MATCHING YOUR NAME
  };

  // 3. Loop through all form data to find the Events
  // The form sends keys like "rsvp_Holy Matrimony"
  // We need to convert them to "RSVP - Holy Matrimony"
  for (const [key, value] of Array.from(formData.entries())) {
    
    // Handle "RSVP - EventName"
    if (key.startsWith('rsvp_')) {
      const eventName = key.replace('rsvp_', ''); // Remove prefix
      fieldsToUpdate[`RSVP - ${eventName}`] = value; // 🟢 CREATES "RSVP - Holy Matrimony"
    }

    // Handle "Adult Count - EventName"
    if (key.startsWith('count_adults_')) {
      const eventName = key.replace('count_adults_', '');
      fieldsToUpdate[`Adult Count - ${eventName}`] = parseInt(value as string); // 🟢 CREATES "Adult Count - Holy Matrimony"
    }

    // Handle "Kids Count - EventName"
    if (key.startsWith('count_kids_')) {
      const eventName = key.replace('count_kids_', '');
      fieldsToUpdate[`Kids Count - ${eventName}`] = parseInt(value as string); // 🟢 CREATES "Kids Count - Holy Matrimony"
    }
  }

  try {
    // 4. Send to Airtable
    await base('Guests').update([{ 
      id: recordId, 
      fields: fieldsToUpdate 
    }]);
    
    // 5. Refresh the page data
    revalidatePath('/');
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
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to submit wish:', error);
    return { success: false };
  }
}