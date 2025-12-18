'use client';

import React, { useState, useEffect } from 'react';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Parallax } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Guest } from '../lib/airtable';
import EventTimeline from './EventTimeline';
import RsvpForm from './RsvpForm';
import { submitWish } from '../app/actions';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../app/globals.css';

// --- COUNTDOWN COMPONENT ---
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date('2026-09-19T11:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return clearInterval(interval);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex gap-4 text-center mt-8 animate-fade-in font-sans" data-swiper-parallax="-100">
       {Object.entries(timeLeft).map(([label, value]) => (
         <div key={label} className="flex flex-col">
           <span className="text-2xl md:text-3xl font-bold">{value}</span>
           <span className="text-[10px] uppercase tracking-widest opacity-70">{label}</span>
         </div>
       ))}
    </div>
  );
}

// --- WISHES FORM COMPONENT (FIXED DEFINITION) ---
// 🟢 UPDATED WISHES FORM
function WishesForm({ guest, allWishes }: { guest: Guest | null, allWishes: { name: string, message: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false); // New success state
  
  const initialWish = guest?.wish || '';

  // If we just sent a message, show the success screen temporarily
  if (isSent) {
    return (
      <div className="w-full max-w-md h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-white/10 p-6 rounded-full mb-4 text-[#d4af37]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-white mb-2">Message Posted!</h3>
        <button 
          onClick={() => setIsSent(false)}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Write another?
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 h-full">
      
      {/* FORM SECTION */}
      {/* 🟢 Added 'swiper-no-swiping' to prevent drag interference */}
      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          await submitWish(formData);
          setIsSubmitting(false);
          setIsSent(true); // Show success message
        }} 
        className="w-full flex flex-col gap-4 shrink-0 swiper-no-swiping"
      >
        <input type="hidden" name="recordId" value={guest?.recordId || ''} />
        <textarea 
          name="wish"
          className="w-full p-4 rounded bg-white/10 border border-white/30 text-white placeholder:text-gray-400 min-h-[100px] focus:outline-none focus:border-[#d4af37] transition-colors" 
          placeholder="Leave a note for the couple..." 
          defaultValue={initialWish}
          required 
        />
        <button 
          disabled={isSubmitting}
          className="bg-white text-black py-3 rounded uppercase font-bold tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Posting...' : (initialWish ? 'Update Message' : 'Post to Guestbook')}
        </button>
      </form>

      {/* WALL OF LOVE */}
      {/* 🟢 CHANGE: Added 'pb-32' to the end of this class list */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left border-t border-white/10 pt-4 swiper-no-swiping pb-32">
        <h3 className="text-[#d4af37] text-xs uppercase tracking-widest text-center mb-4">Latest Wishes</h3>
        
        {allWishes.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic">Be the first to leave a wish!</p>
        ) : (
          allWishes.map((w, i) => (
            <div key={i} className="bg-white/5 p-4 rounded border border-white/10">
              <p className="text-sm text-gray-200 font-serif mb-2">"{w.message}"</p>
              <p className="text-[10px] text-[#d4af37] uppercase tracking-wider text-right">- {w.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- DYNAMIC FAQ LOGIC ---
const getFaqs = (allowedEvents: string[]) => {
  const faqs = [];
  faqs.push({ q: "Is there a dress code?", a: "Yes, strictly Black Tie. Please dress to impress!" });

  if (allowedEvents.includes('Holy Matrimony')) {
    faqs.push({ q: "Where do I park for the Ceremony?", a: "Limited parking is available at St. Mary's Cathedral. We recommend arriving 15 minutes early." });
  }

  if (allowedEvents.includes('Dinner Reception')) {
    faqs.push({ q: "Where do I park for the Reception?", a: "Valet parking is available at the Grand Ballroom entrance." });
    faqs.push({ q: "Are kids invited to the Dinner?", a: "We love your little ones, but the Dinner Reception is an adults-only affair." });
  }

  return faqs;
};

// --- MAIN COMPONENT ---
interface Props {
  guest: Guest | null;
  publicWishes: { name: string, message: string }[];
}

export default function VerticalSwipe({ guest, publicWishes }: Props) {
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);

  const currentFaqs = guest ? getFaqs(guest.allowedEvents) : [];

  const handleOpenEnvelope = () => {
    if (isOpening) return; 
    setIsOpening(true);
    setTimeout(() => { setShowEnvelope(false); }, 3500); 
  };

  const handleBackToTop = () => {
    if (swiperRef) swiperRef.slideTo(0);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white font-serif overflow-hidden">
      
      {!showEnvelope && (
        <button onClick={handleBackToTop} className="absolute bottom-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 transition-all shadow-lg animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
        </button>
      )}

      {showEnvelope && (
        <div onClick={handleOpenEnvelope} className={`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-[1500ms] ease-in-out cursor-pointer ${isOpening ? 'opacity-0 pointer-events-none delay-[2500ms]' : 'opacity-100'}`}>
          <div className="absolute inset-0 opacity-60 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/linen.jpg')" }}></div>
          <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
          <div className="relative w-[90vw] max-w-md aspect-[4/3]">
              <div className="absolute inset-0 bg-[#e6e2d8] shadow-2xl rounded-sm z-0"></div>
              <div className={`absolute left-6 right-6 bottom-0 bg-[#fdfbf7] shadow-md flex flex-col items-center z-10 border border-stone-100 origin-bottom overflow-hidden transition-[height] duration-[2500ms] cubic-bezier(0.2, 0.8, 0.2, 1) ${isOpening ? 'h-[140%]' : 'h-[80%]'}`}>
                  <div className="w-full px-4 pt-16 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">You are invited to the wedding of</p>
                    <h1 className="text-2xl md:text-3xl font-serif text-stone-800 mb-8">Daniel & Alicia</h1>
                    <div className="w-8 h-[1px] bg-stone-300 mx-auto my-6"></div>
                    <p className="text-stone-500 text-xs italic mb-6">Saturday, September 19th, 2026</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400">Tap to Open</p>
                  </div>
              </div>
              <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-xl" viewBox="0 0 400 300" preserveAspectRatio="none">
                <path d="M0,300 L200,160 L400,300 Z" fill="#f0eae0" />
                <path d="M0,0 L0,300 L200,160 Z" fill="#f7f3ec" />
                <path d="M400,0 L400,300 L200,160 Z" fill="#f7f3ec" />
              </svg>
              <div className={`absolute top-0 left-0 w-full h-[60%] z-30 transition-all duration-1000 origin-top ease-in-out transform-style-3d ${isOpening ? 'rotate-x-180 z-0' : 'rotate-x-0 z-30'}`} style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}>
                  <svg className="w-full h-full drop-shadow-md" viewBox="0 0 400 240" preserveAspectRatio="none"><path d="M0,0 L200,240 L400,0 Z" fill="#f7f3ec" /></svg>
                  <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-24 h-24 z-40 flex items-center justify-center">
                     <img src="/seal.png" alt="Wax Seal" className="absolute inset-0 w-full h-full object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
                     <span className="relative z-10 font-seal text-2xl text-[#2c2c2c] opacity-90 drop-shadow-sm">D&A</span>
                  </div>
              </div>
              <div className={`absolute bottom-[5%] left-0 w-full text-center z-40 transition-opacity duration-500 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
                <p className="font-serif italic text-stone-600 text-xl md:text-2xl drop-shadow-sm px-4">{guest ? guest.name : 'The Guest'}</p>
                <p className="text-[10px] text-stone-400 mt-2 animate-pulse">Tap to view</p>
              </div>
          </div>
        </div>
      )}

      <SwiperComponent
        onSwiper={setSwiperRef}
        direction={'horizontal'}
        slidesPerView={1}
        navigation={true}    
        pagination={{ clickable: true, dynamicBullets: true }}
        keyboard={{ enabled: true }}
        speed={1000}
        parallax={true}
        modules={[Navigation, Pagination, Keyboard, Parallax]} 
        className="h-full w-full z-10 bg-black"
      >
        {/* SLIDE 1 */}
        <SwiperSlide className="relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/intro.jpg)' }} data-swiper-parallax="-50%">
             <div className="absolute inset-0 bg-black/40"></div>
           </div>
           <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
             <h1 className="text-5xl md:text-7xl font-bold mb-4" data-swiper-parallax="-300">Daniel & Alicia</h1>
             <p className="text-xl tracking-widest uppercase mb-4" data-swiper-parallax="-200">September 19, 2026</p>
             <Countdown />
             <div className="mt-16 animate-bounce flex flex-col items-center opacity-70" data-swiper-parallax="-100">
                <p className="text-[10px] uppercase tracking-[0.3em] mb-2">Swipe to Begin</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
             </div>
           </div>
        </SwiperSlide>

        {/* SLIDE 2 & 3: PROFILES */}
        <SwiperSlide className="relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/daniel.jpg)' }} data-swiper-parallax="-50%"><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div></div>
           <div className="relative z-10 flex flex-col items-center justify-end pb-20 h-full text-center px-6">
             <h2 className="text-6xl font-serif mb-2" data-swiper-parallax="-300">Daniel</h2>
             <p className="max-w-md text-lg text-gray-200" data-swiper-parallax="-200">"The calm in the storm (usually)."</p>
           </div>
        </SwiperSlide>
        <SwiperSlide className="relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/alicia.jpg)' }} data-swiper-parallax="-50%"><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div></div>
           <div className="relative z-10 flex flex-col items-center justify-end pb-20 h-full text-center px-6">
             <h2 className="text-6xl font-serif mb-2" data-swiper-parallax="-300">Alicia</h2>
             <p className="max-w-md text-lg text-gray-200" data-swiper-parallax="-200">"The one who brings the chaos and the coffee."</p>
           </div>
        </SwiperSlide>

        {/* SLIDE 4: SCHEDULE */}
        <SwiperSlide className="relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/lights.jpg)' }} data-swiper-parallax="-50%"><div className="absolute inset-0 bg-black/70"></div></div>
           <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
             <h2 className="text-4xl mb-8 font-serif" data-swiper-parallax="-300">The Schedule</h2>
             <div data-swiper-parallax="-200">
                {guest ? <EventTimeline events={guest.allowedEvents} /> : <p>Loading...</p>}
             </div>
           </div>
        </SwiperSlide>

        {/* 🟢 SLIDE 5: DYNAMIC FAQ */}
        <SwiperSlide className="relative overflow-hidden bg-[#111]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/faq.jpg)' }} data-swiper-parallax="-50%"><div className="absolute inset-0 bg-black/80"></div></div>
           <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center overflow-y-auto py-20">
             <h2 className="text-4xl font-serif mb-12">F.A.Q.</h2>
             <div className="max-w-lg text-left space-y-6">
                {currentFaqs.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-lg text-[#d4af37]">{faq.q}</h3>
                    <p className="text-sm text-gray-400">{faq.a}</p>
                  </div>
                ))}
             </div>
           </div>
        </SwiperSlide>

        {/* SLIDE 6: RSVP */}
        <SwiperSlide className="relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/rsvp.jpg)' }} data-swiper-parallax="-50%"><div className="absolute inset-0 bg-black/80"></div></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 w-full overflow-y-auto py-20">
            <h2 className="text-4xl mb-6 font-serif" data-swiper-parallax="-300">RSVP</h2>
            {guest ? (
               <div className="w-full flex justify-center" data-swiper-parallax="-200">
                  <RsvpForm guestId={guest.recordId} allowedEvents={guest.allowedEvents} />
               </div>
            ) : null}
          </div>
        </SwiperSlide>

        {/* SLIDE 7: WISHES (UPDATED) */}
        <SwiperSlide className="relative overflow-hidden bg-[#1a1a1a]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/wish.jpg)' }} data-swiper-parallax="-50%">
             <div className="absolute inset-0 bg-black/70"></div>
           </div>
           {/* Added h-full and py-20 to ensure scrolling fits */}
           <div className="absolute inset-0 flex flex-col items-center justify-start pt-24 pb-10 px-6 text-center">
              <h2 className="text-4xl font-serif mb-2">Guestbook</h2>
              <p className="text-sm text-gray-400 mb-6">Leave a note for the couple.</p>
              {/* 🟢 PASS THE DATA */}
              <WishesForm guest={guest} allWishes={publicWishes} />
           </div>
        </SwiperSlide>

        {/* SLIDE 8: LIVESTREAM */}
        <SwiperSlide className="relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/photos/watch.jpg)' }} data-swiper-parallax="-50%">
             <div className="absolute inset-0 bg-black/70"></div>
           </div>
           <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <h2 className="text-3xl font-serif mb-6">Watch Live</h2>
              <div className="w-full max-w-2xl aspect-video bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                 <p className="text-gray-400">Livestream Player will appear here on the day.</p>
              </div>
           </div>
        </SwiperSlide>

        {/* SLIDE 9: THANK YOU */}
        <SwiperSlide className="relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(photos/laughing.jpg)' }} data-swiper-parallax="-50%">
             <div className="absolute inset-0 bg-black/60"></div>
           </div>
           <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
             <h2 className="text-5xl md:text-7xl font-serif mb-6">Thank You</h2>
             <p className="text-xl max-w-lg">We can't wait to celebrate with you.</p>
             <p className="mt-12 text-sm opacity-50">Daniel & Alicia © 2026</p>
           </div>
        </SwiperSlide>

      </SwiperComponent>
    </div>
  );
}