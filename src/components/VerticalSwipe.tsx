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

// --- 1. DESIGN SYSTEM CONSTANTS ---
const THEME = {
  // Typography
  title: "text-5xl md:text-7xl font-serif font-normal mb-6 text-[#fdfbf7] drop-shadow-lg leading-tight",
  heading: "text-3xl md:text-5xl font-serif font-normal mb-8 text-[#fdfbf7] drop-shadow-md",
  subtitle: "text-xs md:text-sm font-sans uppercase tracking-[0.2em] text-[#d4af37] mb-4",
  body: "text-sm md:text-lg font-sans text-gray-200 leading-relaxed max-w-lg mx-auto drop-shadow-sm",
  caption: "text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-4",
  
  // Layout
  slideWrapper: "relative h-full w-full overflow-hidden bg-black",
  contentContainer: "relative z-10 flex flex-col items-center h-full text-center px-6 w-full",
  
  // Centered Content (Intro, Profiles)
  centerContent: "justify-center",
  
  // Scrollable Content (RSVP, FAQ, Wishes)
  scrollContent: "justify-start pt-24 pb-20 overflow-y-auto no-scrollbar", 
  
  // Visuals
  overlay: "absolute inset-0 bg-black/60", // Standardized overlay opacity
};

// --- 2. REUSABLE SLIDE COMPONENT ---
// This ensures every slide looks identical in structure
interface SlideProps {
  bgImage: string;
  isScrollable?: boolean;
  children: React.ReactNode;
}

const SlideSection = ({ bgImage, isScrollable = false, children }: SlideProps) => {
  return (
    <>
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${bgImage})` }} 
        data-swiper-parallax="-50%"
      />
      
      {/* Unified Dark Overlay */}
      <div className={THEME.overlay} />
      
      {/* Content Wrapper */}
      <div className={`${THEME.contentContainer} ${isScrollable ? THEME.scrollContent : THEME.centerContent}`}>
        {children}
      </div>
    </>
  );
};

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
    <div className="flex gap-6 text-center mt-8 animate-fade-in font-sans" data-swiper-parallax="-100">
       {Object.entries(timeLeft).map(([label, value]) => (
         <div key={label} className="flex flex-col items-center">
           <span className="text-3xl md:text-4xl font-serif text-[#fdfbf7]">{value}</span>
           <span className="text-[9px] uppercase tracking-widest text-[#d4af37] opacity-80 mt-1">{label}</span>
         </div>
       ))}
    </div>
  );
}

// --- WISHES FORM (No Changes to logic, just applying theme styles internally if needed) ---
function WishesForm({ guest, allWishes }: { guest: Guest | null, allWishes: { name: string, message: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [wishText, setWishText] = useState(guest?.wish || '');

  useEffect(() => {
    if (guest?.wish) setWishText(guest.wish);
  }, [guest?.wish]);

  if (!guest) {
    return (
      <div className="w-full max-w-md flex flex-col gap-4 h-full pb-32">
        <div className="bg-white/10 p-6 rounded-lg text-center mb-4 border border-white/10 backdrop-blur-sm">
           <p className="text-sm text-gray-300 italic font-serif">"Join us in celebrating our special day."</p>
        </div>
        <h3 className={THEME.subtitle}>Guestbook Messages</h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left border-t border-white/10 pt-4 swiper-no-swiping">
           {allWishes.length === 0 ? <p className="text-gray-500 text-center text-sm">No messages yet.</p> : (
             allWishes.map((w, i) => (
               <div key={i} className="bg-black/30 p-4 rounded border border-white/10">
                 <p className="text-sm text-gray-200 font-serif mb-2">"{w.message}"</p>
                 <p className="text-[9px] text-[#d4af37] uppercase tracking-wider text-right">- {w.name}</p>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }
  
  const initialWish = guest?.wish || '';

  if (isSent) {
    return (
      <div className="w-full max-w-md h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-white/10 p-6 rounded-full mb-4 text-[#d4af37] border border-[#d4af37]/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-white mb-2">Message Posted</h3>
        <button 
          onClick={() => setIsSent(false)}
          className="text-xs text-gray-400 hover:text-white uppercase tracking-widest underline"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8 h-full">
      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          await submitWish(formData);
          setIsSubmitting(false);
          setIsSent(true);
        }} 
        className="w-full flex flex-col gap-4 shrink-0 swiper-no-swiping"
      >
        <input type="hidden" name="recordId" value={guest?.recordId || ''} />
        <textarea 
          name="wish"
          className="w-full p-4 rounded bg-white/5 border border-white/20 text-white placeholder:text-gray-500 min-h-[120px] focus:outline-none focus:border-[#d4af37] transition-colors font-serif" 
          placeholder="Leave a note for the couple..." 
          defaultValue={initialWish}
          required 
        />
        <button 
          disabled={isSubmitting}
          className={`w-full py-4 rounded uppercase font-bold text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2
            ${isSubmitting 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-[#d4af37] text-black hover:bg-white'
            }`}
        >
          {isSubmitting ? 'Saving...' : (initialWish ? 'Update Message' : 'Post to Guestbook')}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left border-t border-white/10 pt-4 swiper-no-swiping pb-32">
        <h3 className="text-[#d4af37] text-xs uppercase tracking-widest text-center mb-4">Latest Wishes</h3>
        {allWishes.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic">Be the first to leave a wish!</p>
        ) : (
          allWishes.map((w, i) => (
            <div key={i} className="bg-black/30 p-4 rounded border border-white/10">
              <p className="text-sm text-gray-200 font-serif mb-2">"{w.message}"</p>
              <p className="text-[9px] text-[#d4af37] uppercase tracking-wider text-right">- {w.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- FAQ LOGIC (Unchanged) ---
type UserGroup = 'Bridesmaids' | 'Groomsmen' | 'Family' | 'Guest';
const getFaqs = (allowedEvents: string[], group: string) => {
  const faqs = [];
  if (['Bridesmaids', 'Groomsmen'].includes(group)) {
    faqs.push({ q: "What is my attire?", a: "Please refer to the chat for outfit details." });
  } else if (group === 'Family') {
    faqs.push({ q: "What is the family dress code?", a: "Formal attire. Ready for photos 30 mins before ceremony." });
  } else {
    faqs.push({ q: "Is there a dress code?", a: "Yes, strictly Black Tie. Dress to impress!" });
  }
  if (allowedEvents.includes('Holy Matrimony')) {
    faqs.push({ q: "Where do I park for the Ceremony?", a: "Limited parking at St. Mary's. Arrive 15 mins early." });
  }
  if (allowedEvents.includes('Dinner Reception')) {
    faqs.push({ q: "Where do I park for the Reception?", a: "Valet parking available at Grand Ballroom entrance." });
    faqs.push({ q: "Are kids invited to the Dinner?", a: "The Dinner Reception is an adults-only affair." });
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
  
  const eventsToShow = guest ? guest.allowedEvents : [];
  const currentFaqs = guest ? getFaqs(eventsToShow, guest.group) : [];

  const handleOpenEnvelope = () => {
    if (isOpening) return; 
    setIsOpening(true);
    setTimeout(() => { setShowEnvelope(false); }, 3500); 
  };

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white font-serif overflow-hidden">
      
      {/* --- BACK TO TOP BUTTON --- */}
      {!showEnvelope && (
        <button 
          onClick={() => swiperRef?.slideTo(0)} 
          className="absolute bottom-6 right-6 z-50 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:bg-[#d4af37] hover:text-black transition-all shadow-lg animate-fade-in group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-y-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>        
        </button>
      )}

      {/* --- ENVELOPE ANIMATION (Unchanged Logic, just styling check) --- */}
      {showEnvelope && (
        <div onClick={handleOpenEnvelope} className={`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-[1500ms] ease-in-out cursor-pointer ${isOpening ? 'opacity-0 pointer-events-none delay-[2500ms]' : 'opacity-100'}`}>
          <div className="absolute inset-0 opacity-60 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('/linen.jpg')" }}></div>
          <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
          <div className="relative w-[90vw] max-w-md aspect-[4/3]">
              <div className="absolute inset-0 bg-[#e6e2d8] shadow-2xl rounded-sm z-0"></div>
              <div className={`absolute left-6 right-6 bottom-0 bg-[#fdfbf7] shadow-md flex flex-col items-center z-10 border border-stone-100 origin-bottom overflow-hidden transition-[height] duration-[2500ms] cubic-bezier(0.2, 0.8, 0.2, 1) ${isOpening ? 'h-[140%]' : 'h-[80%]'}`}>
                  <div className="w-full px-4 pt-16 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">You are invited to the wedding of</p>
                    <h1 className="text-3xl md:text-4xl font-serif font-normal text-stone-800 mb-6 leading-tight">Daniel & Alicia</h1>
                    <div className="w-8 h-[1px] bg-stone-300 mx-auto my-6"></div>
                    <p className="text-stone-500 text-xs italic mb-6">Saturday, September 19th, 2026</p>
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
                <p className="font-serif italic text-stone-600 text-xl md:text-2xl drop-shadow-sm px-4">{guest ? guest.name : 'Family & Friends'}</p>
                <p className="text-[10px] text-stone-400 mt-2 animate-pulse">Tap to view</p>
              </div>
          </div>
        </div>
      )}

      {/* --- SWIPER MAIN --- */}
      <SwiperComponent
        onSwiper={setSwiperRef}
        direction={'horizontal'} // or vertical if you prefer
        slidesPerView={1}
        navigation={true}    
        pagination={{ clickable: true, dynamicBullets: true }}
        keyboard={{ enabled: true }}
        speed={1000}
        parallax={true}
        modules={[Navigation, Pagination, Keyboard, Parallax]} 
        className="h-full w-full z-10 bg-black"
      >
        
        {/* SLIDE 1: INTRO */}
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/intro.jpg">
             <h1 className={THEME.title} data-swiper-parallax="-300">Daniel & Alicia</h1>
             <p className={THEME.subtitle} data-swiper-parallax="-200">September 19, 2026</p>
             <Countdown />
             <div className="mt-16 animate-bounce flex flex-col items-center opacity-70" data-swiper-parallax="-100">
                <p className="text-[9px] uppercase tracking-[0.3em] mb-2">Swipe</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
             </div>
           </SlideSection>
        </SwiperSlide>

        {/* SLIDE 2: GROOM */}
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/daniel.jpg">
             <div className="mt-auto pb-24"> {/* Push content to bottom for portraits */}
               <h2 className={THEME.title} data-swiper-parallax="-300">Daniel</h2>
               <p className={THEME.body} data-swiper-parallax="-200">"The calm in the storm (usually)."</p>
             </div>
           </SlideSection>
        </SwiperSlide>

        {/* SLIDE 3: BRIDE */}
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/alicia.jpg">
             <div className="mt-auto pb-24">
               <h2 className={THEME.title} data-swiper-parallax="-300">Alicia</h2>
               <p className={THEME.body} data-swiper-parallax="-200">"The one who brings the chaos and the coffee."</p>
             </div>
           </SlideSection>
        </SwiperSlide>

        {/* SLIDE 4: SCHEDULE */}
        {guest && (
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/lights.jpg" isScrollable={true}>
             <p className={THEME.subtitle} data-swiper-parallax="-200">The Details</p>
             <h2 className={THEME.heading} data-swiper-parallax="-300">Schedule</h2>
             <div className="w-full" data-swiper-parallax="-100">
                <EventTimeline events={eventsToShow} />
             </div>
           </SlideSection>
        </SwiperSlide>
        )}

        {/* SLIDE 5: FAQ */}
        {guest && (
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/faq.jpg" isScrollable={true}>
             <p className={THEME.subtitle} data-swiper-parallax="-200">Good to know</p>
             <h2 className={THEME.heading} data-swiper-parallax="-300">F.A.Q.</h2>
             <div className="max-w-lg text-left space-y-8 pb-10" data-swiper-parallax="-100">
                {currentFaqs.map((faq, idx) => (
                  <div key={idx} className="bg-black/20 p-4 rounded border-l-2 border-[#d4af37]">
                    <h3 className="font-bold text-base text-[#d4af37] mb-1 font-serif">{faq.q}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
             </div>
           </SlideSection>
        </SwiperSlide>
        )}

        {/* SLIDE 6: RSVP */}
        {guest && (
        <SwiperSlide className={THEME.slideWrapper}>
          <SlideSection bgImage="/photos/rsvp.jpg" isScrollable={true}>
            <p className={THEME.subtitle} data-swiper-parallax="-200">Can you make it?</p>
            <h2 className={THEME.heading} data-swiper-parallax="-300">RSVP</h2>
            <div className="w-full" data-swiper-parallax="-100">
               <div className="w-full flex justify-center">
                  <RsvpForm 
                    guestId={guest.recordId} 
                    allowedEvents={guest.allowedEvents} 
                    maxAdults={guest.maxAdults || 1} 
                    maxKids={guest.maxKids || 0}
                  />
               </div>
            </div>
          </SlideSection>
        </SwiperSlide>
        )}

        {/* SLIDE 7: GUESTBOOK */}
        <SwiperSlide className={THEME.slideWrapper}>
          <SlideSection bgImage="/photos/wish.jpg" isScrollable={true}>
            <p className={THEME.subtitle} data-swiper-parallax="-200">Share the love</p>
            <h2 className={THEME.heading} data-swiper-parallax="-300">Guestbook</h2>
            <div className="w-full flex justify-center" data-swiper-parallax="-100">
              <WishesForm guest={guest} allWishes={publicWishes} />
            </div>
          </SlideSection>
        </SwiperSlide>

        {/* SLIDE 8: LIVESTREAM */}
        <SwiperSlide className={THEME.slideWrapper}>
          <SlideSection bgImage="/photos/watch.jpg">
              <p className={THEME.subtitle} data-swiper-parallax="-200">Virtual Attendance</p>
              <h2 className={THEME.heading} data-swiper-parallax="-300">Watch Live</h2>
              
              <div className="w-full max-w-3xl aspect-video bg-black shadow-2xl border border-white/20 rounded-sm overflow-hidden" data-swiper-parallax="-100">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/X9Pi1wmQGU0" 
                  title="Wedding Livestream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className={THEME.caption}>Live on September 19, 2026 at 11:00 AM</p>
          </SlideSection>
        </SwiperSlide>

        {/* SLIDE 9: THANK YOU */}
        <SwiperSlide className={THEME.slideWrapper}>
           <SlideSection bgImage="/photos/laughing.jpg">
             <h2 className={THEME.title} data-swiper-parallax="-300">Thank You</h2>
             <p className={THEME.body} data-swiper-parallax="-200">We can't wait to celebrate with you.</p>
             <p className="mt-12 text-[10px] text-white/40 uppercase tracking-widest">Daniel & Alicia © 2026</p>
           </SlideSection>
        </SwiperSlide>

      </SwiperComponent>
    </div>
  );
}