'use client';

import React from 'react';

// 🟢 1. DEFINE YOUR EVENT DETAILS
const EVENT_DETAILS: Record<string, { 
  date?: string; // 🟢 Added optional date field for events on different days
  time: string; 
  location: string; 
  address: string; 
  mapUrl: string; 
}> = {
  'Holy Matrimony': {
    time: '11:00 AM',
    location: "IREC Sydney",
    address: '556-558 Botany Rd, Alexandria NSW 2015',
    mapUrl: 'https://maps.app.goo.gl/PHMmpWTMZLxdkQ1fA' // Replace with real link
  },
  'Dinner Reception': {
    time: '5:30 PM',
    location: 'Cropley House',
    address: '84 Watkins Rd, Baulkham Hills NSW 2153',
    mapUrl: 'https://maps.app.goo.gl/pd7xcEoEzRDJL7Lv6'
  },
  'Indonesia Celebration': {
    // 🟢 Explicitly set the date for this event
    date: 'Saturday, November 7, 2026', 
    time: '7:00 PM',
    location: 'Jakarta Garden Venue',
    address: 'Jl. Garden No. 5, Jakarta',
    mapUrl: 'https://goo.gl/maps/example3'
  },
};

interface Props {
  events: string[]; 
}

export default function EventTimeline({ events }: Props) {
  if (!events || events.length === 0) return <div>No events found.</div>;

  return (
    <div className="flex flex-col gap-10 w-full max-w-sm mx-auto mt-8 pb-10">
      {events.map((eventName, index) => {
        const details = EVENT_DETAILS[eventName];
        if (!details) return null;

        return (
          <div key={eventName} className="relative pl-8 border-l border-white/20 text-left animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            
            {/* Timeline Dot */}
            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]"></div>
            
            {/* 🟢 IF DATE EXISTS, SHOW IT */}
            {details.date && (
               <span className="text-white/60 font-sans text-xs uppercase tracking-widest mb-1 block">
                 {details.date}
               </span>
            )}

            {/* Time */}
            <span className="text-[#d4af37] font-bold text-sm tracking-widest uppercase mb-1 block">
              {details.time}
            </span>

            {/* Event Name */}
            <h3 className="text-2xl font-serif mb-2 leading-tight">{eventName}</h3>

            {/* Location */}
            <p className="text-sm text-gray-300 font-sans">{details.location}</p>
            <p className="text-xs text-gray-500 font-sans mb-4">{details.address}</p>

            {/* Google Maps Link Button */}
            <a 
              href={details.mapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/30 px-4 py-2 rounded hover:bg-white hover:text-black transition-colors duration-300"
            >
              <span>Get Directions</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        );
      })}
    </div>
  );
}
  