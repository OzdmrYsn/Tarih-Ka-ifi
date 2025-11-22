import React, { useState, useRef, useEffect } from 'react';
import { HistoricalEvent } from '../types';
import { generateSpeech, decodeAudioData } from '../services/geminiService';

interface ResultCardProps {
  event: HistoricalEvent;
  delayIndex: number;
  isSaved: boolean;
  onToggleSave: (event: HistoricalEvent) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ event, delayIndex, isSaved, onToggleSave }) => {
  const [mode, setMode] = useState<'summary' | 'detail'>('summary');
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  
  // Refs for audio management to prevent re-renders or memory leaks
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleReadAloud = async () => {
    // STOP LOGIC
    if (audioState === 'playing') {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      setAudioState('idle');
      return;
    }

    // PLAY LOGIC
    setAudioState('loading');
    try {
      // 1. Initialize AudioContext (must be after user interaction)
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 2. Fetch Audio Data from Gemini
      const base64Audio = await generateSpeech(event.summary);

      // 3. Decode Raw PCM
      const audioBuffer = await decodeAudioData(base64Audio, audioContextRef.current);

      // 4. Play Audio
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setAudioState('idle');
      };

      source.start();
      sourceRef.current = source;
      setAudioState('playing');

    } catch (error) {
      console.error("Playback failed", error);
      setAudioState('idle');
      alert("Ses dosyası oluşturulurken bir hata meydana geldi.");
    }
  };

  // Dynamic delay for stagger animation
  const animationDelay = `${delayIndex * 100}ms`;

  return (
    <div 
      className="bg-sepia-50 border border-sepia-300 rounded-sm shadow-lg p-6 mb-6 animate-slide-up relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
      style={{ animationDelay }}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-sepia-200 border-r-sepia-500 pointer-events-none"></div>

      {/* Save Button */}
      <button 
        onClick={() => onToggleSave(event)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 group ${
            isSaved ? 'bg-sepia-100 shadow-sm' : 'hover:bg-sepia-100'
        }`}
        title={isSaved ? "Kaydedilenlerden çıkar" : "Kaydet"}
      >
        <i className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
            isSaved 
            ? 'fas fa-bookmark text-red-700' 
            : 'far fa-bookmark text-sepia-400 group-hover:text-sepia-600'
        }`}></i>
      </button>

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
        <div className="flex-1 pr-8">
            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl font-display font-bold text-sepia-900">
                    {event.year !== 'Belirsiz' ? event.year : ''}
                </span>
                <h3 className="text-xl font-serif font-bold text-sepia-800 border-b border-sepia-300 pb-1 w-full">
                    {event.title}
                </h3>
            </div>
            
            {/* Action Bar: Toggles & TTS */}
            <div className="flex flex-wrap items-center justify-between border-b border-sepia-300 mb-4 mt-3">
                <div className="flex gap-0">
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

                {/* TTS Button */}
                <button 
                    onClick={handleReadAloud}
                    disabled={audioState === 'loading'}
                    className={`flex items-center px-3 py-1 mb-1 text-sm font-serif font-bold rounded transition-all duration-300 ${
                        audioState === 'playing'
                        ? 'bg-red-700 text-white shadow-inner animate-pulse'
                        : audioState === 'loading'
                            ? 'bg-sepia-200 text-sepia-500 cursor-wait'
                            : 'text-sepia-700 hover:bg-sepia-200 hover:text-sepia-900'
                    }`}
                    title="Özeti Oku"
                >
                    {audioState === 'loading' ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Yükleniyor...
                        </>
                    ) : audioState === 'playing' ? (
                        <>
                            <i className="fas fa-stop mr-2"></i> Durdur
                        </>
                    ) : (
                        <>
                            <i className="fas fa-volume-up mr-2"></i> Oku
                        </>
                    )}
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
