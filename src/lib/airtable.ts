// src/lib/airtable.ts
import Airtable from 'airtable';

// 🟢 Add 'export' before const base
export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID!
);

// ... rest of the file stays the same

export interface Guest {
  recordId: string;
  id: string;
  name: string;
  rsvpStatus: string;
  allowedEvents: string[]; // 🟢 NEW: Array of strings
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
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
      allowedEvents: (record.get('Allowed Events') as string[]) || [] 
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