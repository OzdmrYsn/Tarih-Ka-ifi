import React, { useState } from 'react';
import { HistoricalEvent } from '../types';

interface ResultCardProps {
  event: HistoricalEvent;
  delayIndex: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ event, delayIndex }) => {
  const [mode, setMode] = useState<'summary' | 'detail'>('summary');

  // Dynamic delay for stagger animation
  const animationDelay = `${delayIndex * 100}ms`;

  return (
    <div 
      className="bg-sepia-50 border border-sepia-300 rounded-sm shadow-lg p-6 mb-6 animate-slide-up relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
      style={{ animationDelay }}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-sepia-200 border-r-sepia-500"></div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Section */}
        {event.thumbnail && (
            <div className="flex-shrink-0 w-full md:w-48 h-48 rounded overflow-hidden border-4 border-white shadow-inner sepia-[0.2]">
                <img 
                    src={event.thumbnail} 
                    alt={event.title} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-in-out"
                />
            </div>
        )}

        {/* Content Section */}
        <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl font-display font-bold text-sepia-900">
                    {event.year !== 'Belirsiz' ? event.year : ''}
                </span>
                <h3 className="text-xl font-serif font-bold text-sepia-800 border-b border-sepia-300 pb-1 w-full">
                    {event.title}
                </h3>
            </div>
            
            {/* Toggle Buttons */}
            <div className="flex gap-0 mb-4 mt-3 border-b border-sepia-300 w-fit">
                <button
                    onClick={() => setMode('summary')}
                    className={`px-4 py-1 font-serif text-sm transition-colors duration-300 rounded-t-sm ${
                        mode === 'summary' 
                        ? 'bg-sepia-400 text-white' 
                        : 'bg-transparent text-sepia-600 hover:bg-sepia-200'
                    }`}
                >
                    <i className="fas fa-feather-alt mr-2"></i>Kısa Özet
                </button>
                <button
                    onClick={() => setMode('detail')}
                    className={`px-4 py-1 font-serif text-sm transition-colors duration-300 rounded-t-sm ${
                        mode === 'detail' 
                        ? 'bg-sepia-400 text-white' 
                        : 'bg-transparent text-sepia-600 hover:bg-sepia-200'
                    }`}
                >
                    <i className="fas fa-book-open mr-2"></i>Uzun Detay
                </button>
            </div>

            {/* Text Content */}
            <div className="text-sepia-900 font-serif leading-relaxed h-auto min-h-[100px] animate-fade-in">
                {mode === 'summary' ? (
                    <p className="italic text-lg opacity-90">
                        "{event.summary}"
                    </p>
                ) : (
                    <div>
                         <p className="text-base text-justify mb-3">
                            {event.detail}
                        </p>
                        <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sepia-600 hover:text-sepia-800 text-sm underline decoration-dotted mt-2 inline-block"
                        >
                            Wikipedia'da incele <i className="fas fa-external-link-alt text-xs ml-1"></i>
                        </a>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
