// src/lib/airtable.ts
import Airtable from 'airtable';

// 🟢 CONTROL SWITCH: Set this to 'true' while coding, 'false' when testing real data
const USE_MOCK_DATA = true;

// ... (Your existing config) ...
export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(process.env.AIRTABLE_BASE_ID!);

// --- THE FAKE GUEST (For testing without API calls) ---
const MOCK_GUEST = {
  recordId: 'recTest12345',
  name: 'Daniel & Alicia (Preview)',
  group: '',
  relationship: "Church friends",
  maxAdults: 2,
  maxKids: 1, // Change this to 0 to test "Adults Only" logic
  allowedEvents: ['Holy Matrimony', 'Dinner Reception', 'Indonesia Celebration'],
  rsvpStatus: 'Pending', // or 'Confirmed'
  greetingName: 'Uncle Daniel',
  id: 'test99',
  wish: 'We wish you a Merry Christmas'
};

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

export async function getGuestByCode(code: string): Promise<Guest | null> {
  // 🟢 1. CHECK: Are we in Mock Mode?
  if (USE_MOCK_DATA) {
    console.log(`⚠️ MOCK MODE: Returning fake data for code "${code}"`);
    // Simulate a short delay so it feels like a real network request
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_GUEST;
  }
  
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

export async function getWishes() {
  try {
    const records = await base('Guests').select({
      filterByFormula: "NOT({Wish} = '')",
      // 🟢 FETCH GREETING NAME TOO
      fields: ['Guest', 'Greeting Name', 'Wish', 'Wish Time'], 
      sort: [{ field: 'Wish Time', direction: 'desc' }] 
    }).all();

    const wishes = records.map(record => ({
      // 🟢 LOGIC: Use Greeting Name if it exists, otherwise Guest Name
      name: (record.get('Greeting Name') as string) || (record.get('Guest') as string),
      message: record.get('Wish') as string,
    }));
    
    return wishes;

  } catch (error: any) {
    console.error('❌ AIRTABLE ERROR:', error.statusCode, error.message);
    return [];
  }
}