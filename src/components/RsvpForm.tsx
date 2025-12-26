'use client';

import { useState } from 'react';
import { submitRSVP } from '../app/actions';
import { useSwiper } from 'swiper/react'; 

// 🟢 CONFIGURATION: Which events allow kids?
const EVENTS_ALLOWING_KIDS = [
  'Holy Matrimony',
  'Indonesia Celebration'
];

interface Props {
  guestId: string;
  allowedEvents: string[];
  maxAdults: number;
  maxKids: number;
}

export default function RsvpForm({ guestId, allowedEvents, maxAdults, maxKids }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [rsvps, setRsvps] = useState<Record<string, string>>({});

  // Access Swiper to jump to the next slide
  const swiper = useSwiper(); 

  const handleStatusChange = (eventName: string, status: string) => {
    setRsvps(prev => ({ ...prev, [eventName]: status }));
  };

  const enforceLimit = (e: React.ChangeEvent<HTMLInputElement>, max: number, min: number) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    if (val > max) e.target.value = max.toString();
    else if (val < min) e.target.value = min.toString();
  };

  // --- SUCCESS STATE ---
  if (isDone) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in py-10">
        {/* Elegant Checkmark Circle */}
        <div className="w-16 h-16 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] mb-2 bg-[#d4af37]/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </div>
        
        <div className="text-3xl font-serif text-white">Response Saved</div>
        
        <p className="text-sm text-gray-300 max-w-xs text-center leading-relaxed font-sans">
          Thank you for letting us know. We have received your RSVP.
        </p>

        {/* 'Next Step' Button matches the theme */}
        <button 
          onClick={() => swiper.slideNext()} 
          className="mt-4 border border-white/30 text-white px-8 py-3 rounded uppercase font-bold text-xs tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Sign Guestbook
        </button>
      </div>
    );
  }

  // --- FORM STATE ---
  return (
    <form 
      action={async (formData) => {
        setIsSubmitting(true);
        await submitRSVP(formData);
        setIsSubmitting(false);
        setIsDone(true);
      }}
      className="flex flex-col gap-6 w-full max-w-md mx-auto text-left"
    >
      <input type="hidden" name="recordId" value={guestId} />
      
      <div className="flex flex-col gap-6">
        {allowedEvents.map((eventName) => {
          const allowsKids = EVENTS_ALLOWING_KIDS.includes(eventName);
          const status = rsvps[eventName];

          return (
            // 🟢 CARD STYLE: Dark, transparent, elegant borders
            <div key={eventName} className="bg-white/5 border border-white/10 p-6 rounded transition-all hover:bg-white/10 backdrop-blur-sm">
              <p className="font-serif text-xl mb-6 text-[#fdfbf7] text-center">{eventName}</p>
              
              {/* STATUS TOGGLE BUTTONS */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <label className="cursor-pointer relative">
                  <input 
                    type="radio" 
                    name={`rsvp_${eventName}`} 
                    value="Attending" 
                    className="peer sr-only" 
                    required 
                    onChange={() => handleStatusChange(eventName, 'Attending')}
                  />
                  {/* ACCEPT BUTTON: Turns Gold when selected */}
                  <div className="text-center py-3 border border-white/20 rounded text-[10px] uppercase tracking-[0.2em] text-gray-400 transition-all
                                peer-checked:bg-[#d4af37] peer-checked:text-black peer-checked:border-[#d4af37] peer-checked:font-bold
                                hover:border-white/40">
                    Accept
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input 
                    type="radio" 
                    name={`rsvp_${eventName}`} 
                    value="Declined" 
                    className="peer sr-only"
                    onChange={() => handleStatusChange(eventName, 'Declined')}
                  />
                  {/* DECLINE BUTTON: Simple subtle highlight when selected */}
                  <div className="text-center py-3 border border-white/20 rounded text-[10px] uppercase tracking-[0.2em] text-gray-400 transition-all
                                peer-checked:bg-white/10 peer-checked:text-white peer-checked:border-white/30
                                hover:border-white/40">
                    Decline
                  </div>
                </label>
              </div>

              {/* 🟢 COUNTERS: Only show if Attending */}
              {status === 'Attending' && (
                <div className="border-t border-white/10 pt-6 mt-4 animate-fade-in">
                  <div className="flex gap-4">
                    
                    {/* ADULTS */}
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 text-center">Adults</label>
                      <input 
                        type="number" 
                        name={`count_adults_${eventName}`} 
                        min="1" 
                        max={maxAdults} 
                        defaultValue={maxAdults} 
                        onChange={(e) => enforceLimit(e, maxAdults, 1)}
                        // Dark Input Style
                        className="w-full p-2 bg-black/20 border border-white/10 rounded text-center text-white font-serif text-lg focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* KIDS */}
                    {allowsKids ? (
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-2 text-center">Kids</label>
                        <input 
                          type="number" 
                          name={`count_kids_${eventName}`} 
                          min="0" 
                          max={maxKids} 
                          defaultValue={0} 
                          onChange={(e) => enforceLimit(e, maxKids, 0)}
                          className="w-full p-2 bg-black/20 border border-white/10 rounded text-center text-white font-serif text-lg focus:border-[#d4af37] focus:outline-none transition-colors"
                        />
                      </div>
                    ) : (
                      // Placeholder for alignment if no kids allowed
                      <div className="flex-1 flex flex-col justify-end">
                         <div className="w-full py-3 border border-transparent text-center opacity-30">
                            <span className="text-[9px] uppercase tracking-widest text-white">Adults Only</span>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* DIETARY SECTION */}
      <div className="bg-white/5 border border-white/10 p-6 rounded backdrop-blur-sm">
        <p className="font-serif text-lg mb-4 text-gray-200">Dietary Requirements</p>
        <textarea 
          name="dietary" 
          placeholder="Please list any allergies or dietary needs..." 
          className="w-full p-4 bg-black/20 border border-white/10 rounded text-sm text-white placeholder:text-gray-600 min-h-[100px] focus:border-[#d4af37] focus:outline-none transition-colors resize-none font-sans"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-[#d4af37] text-black font-bold py-4 rounded shadow-lg hover:bg-[#fdfbf7] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 mt-4"
      >
        {isSubmitting && (
           <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        )}
        <span>{isSubmitting ? 'Sending...' : 'Confirm Attendance'}</span>
      </button>
    </form>
  );
}