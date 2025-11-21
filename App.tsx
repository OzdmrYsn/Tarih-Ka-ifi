import React, { useState } from 'react';
import { searchEventsByKeyword, searchEventsByDate } from './services/wikipediaService';
import { HistoricalEvent } from './types';
import { ResultCard } from './components/ResultCard';
import { LoadingSpinner } from './components/LoadingSpinner';

enum Tab {
  KEYWORD = 'KEYWORD',
  DATE = 'DATE',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.KEYWORD);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const dateObj = new Date(selectedDate);
        const month = dateObj.getMonth() + 1; // JS months are 0-indexed
        const day = dateObj.getDate();
        results = await searchEventsByDate(month, day);
      }

      setEvents(results);
    } catch (err) {
      setError('Veriler çekilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-sepia-900 pb-20">
      {/* Header */}
      <header className="bg-sepia-900 text-sepia-100 py-8 shadow-xl border-b-4 border-sepia-500 relative overflow-hidden">
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

      <main className="container mx-auto px-4 -mt-6 relative z-20 max-w-4xl">
        
        {/* Search Container */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-sepia-200">
            
            {/* Tabs */}
            <div className="flex border-b border-sepia-200 bg-sepia-100">
                <button
                    onClick={() => { setActiveTab(Tab.KEYWORD); setError(null); }}
                    className={`flex-1 py-4 text-center font-serif font-bold text-lg transition-all duration-300 ${
                        activeTab === Tab.KEYWORD 
                        ? 'bg-white text-sepia-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-t-4 border-t-sepia-600' 
                        : 'text-sepia-500 hover:bg-sepia-200 hover:text-sepia-700'
                    }`}
                >
                    <i className="fas fa-search mr-2"></i> Olay Ara
                </button>
                <button
                    onClick={() => { setActiveTab(Tab.DATE); setError(null); }}
                    className={`flex-1 py-4 text-center font-serif font-bold text-lg transition-all duration-300 ${
                        activeTab === Tab.DATE 
                        ? 'bg-white text-sepia-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-t-4 border-t-sepia-600' 
                        : 'text-sepia-500 hover:bg-sepia-200 hover:text-sepia-700'
                    }`}
                >
                    <i className="far fa-calendar-alt mr-2"></i> Tarihte Bugün
                </button>
            </div>

            {/* Form Area */}
            <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
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
                                Tarih Seçiniz
                            </label>
                             <div className="relative">
                                <i className="fas fa-hourglass-start absolute left-4 top-1/2 transform -translate-y-1/2 text-sepia-400 text-xl"></i>
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-sepia-50 border-2 border-sepia-300 rounded focus:outline-none focus:border-sepia-600 focus:bg-white transition-colors font-serif text-lg text-sepia-800"
                                />
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

            {!loading && !error && events.length > 0 && (
                <div className="space-y-6">
                     <div className="flex items-center justify-center mb-6">
                        <div className="h-px bg-sepia-300 w-16"></div>
                        <span className="mx-4 text-sepia-500 font-display italic">Bulunan Kayıtlar</span>
                        <div className="h-px bg-sepia-300 w-16"></div>
                    </div>
                    {events.map((event, index) => (
                        <ResultCard key={event.id} event={event} delayIndex={index} />
                    ))}
                </div>
            )}

            {!loading && !error && hasSearched && events.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                    <i className="fas fa-scroll text-6xl text-sepia-300 mb-4"></i>
                    <p className="text-xl font-serif text-sepia-600">Kayıt bulunamadı. Lütfen farklı bir arama yapın.</p>
                </div>
            )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-sepia-900 text-sepia-200 text-center py-2 text-sm font-serif border-t border-sepia-600">
          <p>&copy; {new Date().getFullYear()} Tarih Kâşifi. Wikipedia API tarafından desteklenmektedir.</p>
      </footer>
    </div>
  );
};

export default App;
