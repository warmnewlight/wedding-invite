'use client';

import { useState } from 'react';
import { submitRSVP } from '../app/actions';

// 🟢 CONFIGURATION: Which events allow kids?
const EVENTS_ALLOWING_KIDS = [
  'Holy Matrimony',
  'Indonesia Celebration'
  // 'Wedding Dinner' is NOT here, so it defaults to Adults only
];

interface Props {
  guestId: string;
  allowedEvents: string[];
}

export default function RsvpForm({ guestId, allowedEvents }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Local state to track acceptance so we can show/hide count inputs
  const [rsvps, setRsvps] = useState<Record<string, string>>({});

  const handleStatusChange = (eventName: string, status: string) => {
    setRsvps(prev => ({ ...prev, [eventName]: status }));
  };

  if (isDone) {
    return <div className="text-green-400 text-xl font-serif animate-pulse">Thank you for your response!</div>;
  }

  return (
    <form 
      action={async (formData) => {
        setIsSubmitting(true);
        await submitRSVP(formData);
        setIsSubmitting(false);
        setIsDone(true);
      }}
      className="flex flex-col gap-6 w-full max-w-sm text-black mx-auto"
    >
      <input type="hidden" name="recordId" value={guestId} />
      
      <div className="flex flex-col gap-4">
        {allowedEvents.map((eventName) => {
          const allowsKids = EVENTS_ALLOWING_KIDS.includes(eventName);
          const status = rsvps[eventName];

          return (
            <div key={eventName} className="bg-white/95 p-4 rounded-lg shadow-lg">
              <p className="font-serif font-bold text-lg mb-2 text-center text-[#2c2c2c]">{eventName}</p>
              
              {/* STATUS TOGGLE */}
              <div className="flex gap-2 justify-center mb-3">
                <label className="cursor-pointer">
                  <input 
                    type="radio" 
                    name={`rsvp_${eventName}`} 
                    value="Attending" 
                    className="peer sr-only" 
                    required 
                    onChange={() => handleStatusChange(eventName, 'Attending')}
                  />
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md peer-checked:bg-green-700 peer-checked:text-white transition-all text-sm uppercase tracking-wide">
                    Accept
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input 
                    type="radio" 
                    name={`rsvp_${eventName}`} 
                    value="Declined" 
                    className="peer sr-only"
                    onChange={() => handleStatusChange(eventName, 'Declined')}
                  />
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md peer-checked:bg-red-700 peer-checked:text-white transition-all text-sm uppercase tracking-wide">
                    Decline
                  </div>
                </label>
              </div>

              {/* 🟢 CONDITIONAL COUNT INPUTS */}
              {status === 'Attending' && (
                <div className="border-t border-gray-200 pt-3 animate-fade-in-down">
                  <div className="flex gap-4">
                    {/* ADULTS INPUT */}
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-gray-500 mb-1">Adults</label>
                      <input 
                        type="number" 
                        name={`count_adults_${eventName}`} 
                        min="1" 
                        defaultValue="1" 
                        className="w-full p-2 border border-gray-300 rounded text-center font-bold"
                      />
                    </div>

                    {/* KIDS INPUT (Only if allowed) */}
                    {allowsKids ? (
                      <div className="flex-1">
                        <label className="block text-xs uppercase text-gray-500 mb-1">Kids</label>
                        <input 
                          type="number" 
                          name={`count_kids_${eventName}`} 
                          min="0" 
                          defaultValue="0" 
                          className="w-full p-2 border border-gray-300 rounded text-center font-bold"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center opacity-50">
                        <span className="text-[10px] uppercase text-gray-400 border border-gray-200 px-2 py-1 rounded bg-gray-50">Adults Only</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <div className="bg-white/90 p-4 rounded-lg shadow-lg">
        <p className="font-serif font-bold text-sm mb-2 text-gray-600">Dietary Requirements</p>
        <textarea name="dietary" placeholder="Allergies, special needs..." className="w-full p-2 border border-gray-300 rounded text-sm min-h-[60px]"/>
      </div>

      <button type="submit" disabled={isSubmitting} className="bg-[#8b0000] text-white font-bold py-4 rounded shadow-xl hover:bg-[#600000] disabled:opacity-50 transition-all uppercase tracking-widest text-sm">
        {isSubmitting ? 'Sending...' : 'Confirm RSVP'}
      </button>
    </form>
  );
}