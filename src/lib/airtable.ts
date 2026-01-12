// src/lib/airtable.ts
import { unstable_cache } from 'next/cache';
import Airtable from 'airtable';

// ... (Your existing config) ...
export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(process.env.AIRTABLE_BASE_ID!);

export interface Guest {
  recordId: string;
  id: string;
  name: string;
  rsvpStatus: string;
  allowedEvents: string[]; // 🟢 NEW: Array of strings
  wish?: string; // 🟢 Added this
  // 🟢 NEW FIELDS
  maxAdults?: number; 
  maxKids?: number;
  relationship: string;
  group: string;
}

async function _getGuestByCode(code: string): Promise<Guest | null> {
  if (!code) return null;
  try {
    const records = await base('Guests')
      .select({
        filterByFormula: `{Guest ID} = '${code}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) return null;

    const record = records[0];
    
    const greetingName = record.get('Greeting Name') as string;
    const technicalName = record.get('Guest') as string;

    return {
      recordId: record.id,
      id: record.get('Guest ID') as string,
      name: greetingName || technicalName,
      rsvpStatus: (record.get('RSVP Status') as string) || 'Pending',
      // 🟢 NEW: Fetch the multiselect field
      allowedEvents: (record.get('Allowed Events') as string[]) || [] ,
      wish: (record.get('Wish') as string) || '', // 🟢 WE READ IT HERE
      maxAdults: (record.get('Adult Count') as number) || 1, 
      maxKids: (record.get('Kids Count') as number) || 0,
      relationship: record.fields['Relationship'] as string,
      group: record.get('Group') as string
    };
  } catch (error) {
    console.error('Error fetching guest:', error);
    return null;
  }
}

export const getGuestByCode = unstable_cache(
  async (code) => _getGuestByCode(code),
  ['guest-data'], 
  { 
    tags: ['guest'], // General tag for all guests
    revalidate: 3600 
  }
);

// Keep your update function here too...
export async function updateGuestRSVP(
  recordId: string, 
  data: { rsvpStatus: string; dietaryNotes?: string; mealChoice?: string; }
) {
  try {
    // Console log to verify data is reaching this function
    console.log("Attempting to update:", recordId, data); 

    await base('Guests').update([
      {
        id: recordId,
        fields: {
          'RSVP Status': data.rsvpStatus,           // MUST match Airtable column exactly
          'Dietary Requirements': data.dietaryNotes || '', // MUST match Airtable column exactly
          'Meal Choice': data.mealChoice || ''      // MUST match Airtable column exactly
        },
      },
    ]);
    console.log("Update Success!");
    return { success: true };
  } catch (error) {
    // 🔴 THIS IS THE IMPORTANT PART
    console.error('Airtable Update Failed:', error);
    return { success: false };
  }
}

async function _getWishes() {
    try {
    const records = await base('Guests').select({
      filterByFormula: "NOT({Wish} = '')",
      fields: ['Guest', 'Greeting Name', 'Wish', 'Wish Time'], 
      sort: [{ field: 'Wish Time', direction: 'desc' }] 
    }).all();

    return records.map(record => ({
      name: (record.get('Greeting Name') as string) || (record.get('Guest') as string),
      message: record.get('Wish') as string,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 2. Export the CACHED version
export const getWishes = unstable_cache(
  async () => _getWishes(),
  ['public-wishes'], // Internal cache ID
  { 
    tags: ['wishes'], // 🟢 KEY: We use this tag to clear cache later
    revalidate: 3600  // Auto-refresh every 1 hour even if no new wishes
  }
);