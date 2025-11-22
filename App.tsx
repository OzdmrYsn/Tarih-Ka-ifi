import React, { useState, useEffect } from 'react';
import { searchEventsByKeyword, searchEventsByDate } from './services/wikipediaService';
import { HistoricalEvent } from './types';
import { ResultCard } from './components/ResultCard';
import { LoadingSpinner } from './components/LoadingSpinner';

enum Tab {
  KEYWORD = 'KEYWORD',
  DATE = 'DATE',
  SAVED = 'SAVED',
}

const MONTHS = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.KEYWORD);
  const [keyword, setKeyword] = useState('');
  
  // Default to today's date
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load saved events from local storage
  useEffect(() => {
    const stored = localStorage.getItem('history_saved_events');
    if (stored) {
      try {
        setSavedEvents(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved events", e);
      }
    }
  }, []);

  // Calculate days in selected month (using 2024 as leap year to always allow 29 Feb)
  const getDaysInMonth = (month: number) => {
    return new Date(2024, month, 0).getDate();
  };

  const handleToggleSave = (event: HistoricalEvent) => {
    const isSaved = savedEvents.some(e => e.id === event.id);
    let newSaved;
    if (isSaved) {
      newSaved = savedEvents.filter(e => e.id !== event.id);
    } else {
      newSaved = [...savedEvents, event];
    }
    setSavedEvents(newSaved);
    localStorage.setItem('history_saved_events', JSON.stringify(newSaved));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === Tab.SAVED) return; // No search in saved tab

    setLoading(true);
    setError(null);
    setEvents([]);
    setHasSearched(true);

    try {
      let results: HistoricalEvent[] = [];
      
      if (activeTab === Tab.KEYWORD) {
        if (!keyword.trim()) {
            setError('Lütfen bir arama terimi giriniz.');
            setLoading(false);
            return;
        }
        results = await searchEventsByKeyword(keyword);
      } else {
        results = await searchEventsByDate(selectedMonth, selectedDay);
      }

      setEvents(results);
    } catch (err) {
      setError('Veriler çekilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Determine which events to show
  const displayEvents = activeTab === Tab.SAVED ? savedEvents : events;
  const showEmptyState = !loading && !error && hasSearched && displayEvents.length === 0 && activeTab !== Tab.SAVED;
  const showSavedEmptyState = activeTab === Tab.SAVED && savedEvents.length === 0;

  return (
    <div className="flex flex-col min-h-screen font-sans text-sepia-900">
      {/* Header */}
      <header className="bg-sepia-900 text-sepia-100 py-8 shadow-xl border-b-4 border-sepia-500 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider mb-2">
            <i className="fas fa-compass mr-4 text-sepia-300"></i>
            Tarih Kâşifi
          </h1>
          <p className="text-lg font-serif text-sepia-200 italic">
            "Geçmiş, bugünün anahtarıdır."
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 -mt-6 relative z-20 max-w-4xl pb-12">
        
        {/* Main Container (Search + Tabs) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-sepia-200">
            
            {/* Tabs */}
            <div className="flex border-b border-sepia-200 bg-sepia-100">
                <button
                    onClick={() => { setActiveTab(Tab.KEYWORD); setError(null); }}
                    className={`flex-1 py-4 text-center font-serif font-bold text-sm md:text-lg transition-all duration-300 ${
                        activeTab === Tab.KEYWORD 
                        ? 'bg-white text-sepia-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-t-4 border-t-sepia-600' 
                        : 'text-sepia-500 hover:bg-sepia-200 hover:text-sepia-700'
                    }`}
                >
                    <i className="fas fa-search mr-2"></i> <span className="hidden md:inline">Olay</span> Ara
                </button>
                <button
                    onClick={() => { setActiveTab(Tab.DATE); setError(null); }}
                    className={`flex-1 py-4 text-center font-serif font-bold text-sm md:text-lg transition-all duration-300 ${
                        activeTab === Tab.DATE 
                        ? 'bg-white text-sepia-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-t-4 border-t-sepia-600' 
                        : 'text-sepia-500 hover:bg-sepia-200 hover:text-sepia-700'
                    }`}
                >
                    <i className="far fa-calendar-alt mr-2"></i> Tarihte <span className="hidden md:inline">Bugün</span>
                </button>
                <button
                    onClick={() => { setActiveTab(Tab.SAVED); setError(null); }}
                    className={`flex-1 py-4 text-center font-serif font-bold text-sm md:text-lg transition-all duration-300 ${
                        activeTab === Tab.SAVED 
                        ? 'bg-white text-sepia-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-t-4 border-t-sepia-600' 
                        : 'text-sepia-500 hover:bg-sepia-200 hover:text-sepia-700'
                    }`}
                >
                    <i className="fas fa-bookmark mr-2"></i> Kayıtlı<span className="hidden md:inline">lar</span>
                </button>
            </div>

            {/* Form / Content Area */}
            <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                {activeTab === Tab.SAVED ? (
                   <div className="text-center py-4">
                      <i className="fas fa-archive text-4xl text-sepia-400 mb-3"></i>
                      <h2 className="text-2xl font-serif text-sepia-800 font-bold">Arşiviniz</h2>
                      <p className="text-sepia-600 italic">Beğendiğiniz ve kaydettiğiniz olaylar burada saklanır.</p>
                   </div>
                ) : (
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                      
                      {activeTab === Tab.KEYWORD ? (
                          <div className="flex-1 w-full">
                              <label className="block font-serif text-sepia-800 mb-2 font-bold">
                                  Tarihi Olay veya Kişi
                              </label>
                              <div className="relative">
                                  <i className="fas fa-quill-pen absolute left-4 top-1/2 transform -translate-y-1/2 text-sepia-400 text-xl"></i>
                                  <input 
                                      type="text" 
                                      value={keyword}
                                      onChange={(e) => setKeyword(e.target.value)}
                                      placeholder="Örn: Fransız İhtilali, İstanbul'un Fethi..."
                                      className="w-full pl-12 pr-4 py-3 bg-sepia-50 border-2 border-sepia-300 rounded focus:outline-none focus:border-sepia-600 focus:bg-white transition-colors font-serif text-lg placeholder-sepia-300"
                                  />
                              </div>
                          </div>
                      ) : (
                           <div className="flex-1 w-full">
                              <label className="block font-serif text-sepia-800 mb-2 font-bold">
                                  Tarih Seçiniz (Ay / Gün)
                              </label>
                              <div className="flex gap-4">
                                  <div className="relative flex-1">
                                      <i className="far fa-calendar absolute left-4 top-1/2 transform -translate-y-1/2 text-sepia-400 text-lg pointer-events-none"></i>
                                      <select 
                                          value={selectedMonth}
                                          onChange={(e) => {
                                              setSelectedMonth(parseInt(e.target.value));
                                              // Adjust day if new month has fewer days
                                              const maxDay = new Date(2024, parseInt(e.target.value), 0).getDate();
                                              if (selectedDay > maxDay) setSelectedDay(maxDay);
                                          }}
                                          className="w-full pl-12 pr-8 py-3 bg-sepia-50 border-2 border-sepia-300 rounded focus:outline-none focus:border-sepia-600 focus:bg-white transition-colors font-serif text-lg text-sepia-800 appearance-none cursor-pointer"
                                      >
                                          {MONTHS.map(m => (
                                              <option key={m.value} value={m.value}>{m.label}</option>
                                          ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sepia-600">
                                        <i className="fas fa-chevron-down text-xs"></i>
                                      </div>
                                  </div>

                                  <div className="relative w-24 md:w-32">
                                      <select 
                                          value={selectedDay}
                                          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                                          className="w-full pl-4 pr-8 py-3 bg-sepia-50 border-2 border-sepia-300 rounded focus:outline-none focus:border-sepia-600 focus:bg-white transition-colors font-serif text-lg text-sepia-800 appearance-none cursor-pointer text-center"
                                      >
                                          {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1).map(day => (
                                              <option key={day} value={day}>{day}</option>
                                          ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sepia-600">
                                        <i className="fas fa-chevron-down text-xs"></i>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      <button 
                          type="submit"
                          disabled={loading}
                          className="w-full md:w-auto bg-sepia-600 hover:bg-sepia-800 text-white font-display font-bold py-3 px-8 rounded shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loading ? 'Aranıyor...' : 'Keşfet'}
                      </button>
                  </form>
                )}
            </div>
        </div>

        {/* Results Section */}
        <div className="mt-10">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-800 p-4 mb-8 rounded shadow-sm animate-fade-in">
                    <div className="flex items-center">
                        <i className="fas fa-exclamation-circle text-red-800 text-2xl mr-4"></i>
                        <p className="text-red-900 font-serif">{error}</p>
                    </div>
                </div>
            )}

            {loading && <LoadingSpinner />}

            {!loading && !error && displayEvents.length > 0 && (
                <div className="space-y-6">
                     <div className="flex items-center justify-center mb-6">
                        <div className="h-px bg-sepia-300 w-16"></div>
                        <span className="mx-4 text-sepia-500 font-display italic">
                          {activeTab === Tab.SAVED ? 'Kayıtlı Olaylar' : 'Bulunan Kayıtlar'}
                        </span>
                        <div className="h-px bg-sepia-300 w-16"></div>
                    </div>
                    {displayEvents.map((event, index) => (
                        <ResultCard 
                          key={event.id} 
                          event={event} 
                          delayIndex={index} 
                          isSaved={savedEvents.some(e => e.id === event.id)}
                          onToggleSave={handleToggleSave}
                        />
                    ))}
                </div>
            )}

            {showEmptyState && (
                <div className="text-center py-12 animate-fade-in">
                    <i className="fas fa-scroll text-6xl text-sepia-300 mb-4"></i>
                    <p className="text-xl font-serif text-sepia-600">Kayıt bulunamadı. Lütfen farklı bir arama yapın.</p>
                </div>
            )}

            {showSavedEmptyState && (
                <div className="text-center py-12 animate-fade-in">
                    <i className="far fa-bookmark text-6xl text-sepia-300 mb-4"></i>
                    <p className="text-xl font-serif text-sepia-600">Henüz kaydedilmiş bir olayınız yok.</p>
                    <button onClick={() => setActiveTab(Tab.KEYWORD)} className="mt-4 text-sepia-800 underline hover:text-sepia-600 font-serif">
                      Hemen keşfetmeye başla
                    </button>
                </div>
            )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-sepia-900 text-sepia-200 text-center py-4 text-sm font-serif border-t border-sepia-600 mt-auto relative z-30">
          <p>&copy; {new Date().getFullYear()} Tarih Kâşifi. Wikipedia API tarafından desteklenmektedir.</p>
      </footer>
    </div>
  );
};

export default App;