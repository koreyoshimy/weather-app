/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  CloudSun, 
  Droplets, 
  Sun, 
  Wind, 
  Thermometer, 
  Calendar,
  RefreshCw,
  AlertCircle,
  Info,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// WMO Weather interpretation codes (WW)
const getWeatherInfo = (code: number) => {
  switch (code) {
    case 0:
      return { label: 'Clear sky', icon: <Sun className="w-12 h-12 text-yellow-400" />, bg: 'from-blue-400 to-blue-600' };
    case 1:
    case 2:
    case 3:
      return { label: 'Partly cloudy', icon: <CloudSun className="w-12 h-12 text-gray-200" />, bg: 'from-blue-500 to-blue-700' };
    case 45:
    case 48:
      return { label: 'Fog', icon: <CloudFog className="w-12 h-12 text-gray-300" />, bg: 'from-gray-400 to-gray-600' };
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: <CloudDrizzle className="w-12 h-12 text-blue-300" />, bg: 'from-blue-600 to-blue-800' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', icon: <CloudRain className="w-12 h-12 text-blue-400" />, bg: 'from-blue-700 to-indigo-900' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snow', icon: <CloudSnow className="w-12 h-12 text-white" />, bg: 'from-blue-100 to-blue-300' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain showers', icon: <CloudRain className="w-12 h-12 text-blue-500" />, bg: 'from-blue-800 to-indigo-950' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: <CloudLightning className="w-12 h-12 text-yellow-500" />, bg: 'from-purple-800 to-black' };
    default:
      return { label: 'Cloudy', icon: <Cloud className="w-12 h-12 text-gray-400" />, bg: 'from-gray-500 to-gray-700' };
  }
};

interface Location {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  tip: string;
}

const LOCATIONS: Location[] = [
  { 
    id: 'kl', 
    name: 'Kuala Lumpur', 
    state: 'W. Persekutuan', 
    lat: 3.1390, 
    lon: 101.6869, 
    tip: 'Kuala Lumpur experiences a tropical rainforest climate. Afternoon thunderstorms are extremely common, especially during the inter-monsoon periods (March-April and October-November). If you see dark clouds gathering around 3 PM, it\'s best to head indoors!'
  },
  { 
    id: 'masai', 
    name: 'Masai', 
    state: 'Johor', 
    lat: 1.4851, 
    lon: 103.8837, 
    tip: 'Masai is close to the coast. You might experience higher humidity and sudden coastal rain showers. The proximity to Singapore often means similar weather patterns to the island state.'
  },
  { 
    id: 'batu-pahat', 
    name: 'Batu Pahat', 
    state: 'Johor', 
    lat: 1.8548, 
    lon: 102.9325, 
    tip: 'Batu Pahat is known for its flat coastal plains. Weather here can be quite hot during the day, with refreshing sea breezes in the evening. Watch out for the Northeast Monsoon (Nov-Mar) which brings more rain.'
  }
];

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (loc: Location) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore`
      );
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [selectedLocation, fetchWeather]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  };

  const currentInfo = weather ? getWeatherInfo(weather.current.weather_code) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Location Switcher */}
      <nav className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm uppercase tracking-widest hidden sm:inline">Select Location</span>
          </div>
          <div className="flex gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedLocation.id === loc.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-12 h-12 text-blue-400" />
            </motion.div>
            <p className="mt-4 text-lg font-medium animate-pulse">Fetching {selectedLocation.name} Weather...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchWeather(selectedLocation)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={selectedLocation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <header className={`relative overflow-hidden bg-gradient-to-br ${currentInfo?.bg} py-12 px-6 md:py-20`}>
              <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{selectedLocation.name}</h1>
                    <p className="text-xl md:text-2xl opacity-90 font-medium">{selectedLocation.state}, Malaysia</p>
                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
                      <span className="text-7xl md:text-9xl font-bold tracking-tighter">
                        {Math.round(weather?.current.temperature_2m || 0)}°
                      </span>
                      <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-semibold">{currentInfo?.label}</span>
                        <span className="text-lg opacity-80">Feels like {Math.round(weather?.current.apparent_temperature || 0)}°</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl"
                  >
                    {currentInfo?.icon}
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3">
                    <Droplets className="text-blue-300" />
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Humidity</p>
                      <p className="text-lg font-semibold">{weather?.current.relative_humidity_2m}%</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3">
                    <Wind className="text-slate-300" />
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Wind Speed</p>
                      <p className="text-lg font-semibold">{weather?.current.wind_speed_10m} km/h</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3 col-span-2 md:col-span-1">
                    <Thermometer className="text-red-300" />
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-wider">UV Index</p>
                      <p className="text-lg font-semibold">Moderate</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
              {/* 7-Day Forecast */}
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold uppercase tracking-widest">7-Day Forecast</h2>
                </div>
                
                <div className="flex overflow-x-auto pb-6 gap-4 snap-x no-scrollbar">
                  {weather?.daily.time.map((time, index) => {
                    const info = getWeatherInfo(weather.daily.weather_code[index]);
                    return (
                      <motion.div
                        key={time}
                        whileHover={{ y: -5 }}
                        className="flex-shrink-0 w-36 bg-slate-900 border border-slate-800 p-5 rounded-3xl snap-start flex flex-col items-center text-center"
                      >
                        <p className="text-sm font-bold text-slate-400 mb-4">{index === 0 ? 'Today' : formatDate(time)}</p>
                        <div className="mb-4 scale-75">
                          {info.icon}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-2 uppercase">{info.label}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-bold">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                          <span className="text-sm text-slate-500">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Local Tip Section */}
              <section className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Local Tip for {selectedLocation.name}</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedLocation.tip}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
              </section>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-900 py-8 px-6 text-center">
        <p className="text-slate-500 text-sm">
          Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open-Meteo</a>
        </p>
        <p className="text-slate-600 text-xs mt-2">© 2026 Malaysia Weather Hub</p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
