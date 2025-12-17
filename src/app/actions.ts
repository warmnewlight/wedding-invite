'use server';

import { base } from '../lib/airtable';
import { revalidatePath } from 'next/cache';

// 🟢 MAP YOUR EXACT AIRTABLE COLUMNS HERE
const COLUMN_MAP: Record<string, string> = {
  // Event Name in Code  :  Exact Column Name in Airtable
  'Holy Matrimony':       'RSVP - Ceremony',
  'Dinner Reception':     'RSVP - Reception',
  'Indonesia Celebration': 'RSVP - Indo Celebration' // ⚠️ Check this full name in Airtable!
};

export async function submitRSVP(formData: FormData) {
  const recordId = formData.get('recordId') as string;
  const dietary = formData.get('dietary') as string;

  if (!recordId) return { success: false, message: 'Missing Record ID' };

  const fieldsToUpdate: Record<string, string> = {
    'Dietary Restrictions': dietary || '',
    'RSVP Status': 'Responded' 
  };

  const rsvpKeys = Array.from(formData.keys()).filter(k => k.startsWith('rsvp_'));

  for (const key of rsvpKeys) {
    const eventName = key.replace('rsvp_', '');
    const status = formData.get(key) as string;
    
    const adults = formData.get(`count_adults_${eventName}`);
    const kids = formData.get(`count_kids_${eventName}`);

    let finalValue = status;

    if (status === 'Attending' && adults) {
      let countString = `(${adults} Adults`;
      if (kids && parseInt(kids as string) > 0) {
        countString += `, ${kids} Kids`;
      }
      countString += ')';
      finalValue = `${status} ${countString}`;
    }

    // FIND THE MATCHING COLUMN
    const airtableColumnName = COLUMN_MAP[eventName];
    
    if (airtableColumnName) {
      fieldsToUpdate[airtableColumnName] = finalValue;
    } else {
      console.warn(`⚠️ No column mapped for event: "${eventName}". Check actions.ts`);
    }
  }

  try {
    await base('Guests').update([{ id: recordId, fields: fieldsToUpdate }]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Airtable Update Failed:', error);
    return { success: false, message: 'Database Error' };
  }
}