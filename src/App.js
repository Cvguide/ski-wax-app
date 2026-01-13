import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Wind, Cloud, Mountain, Search, Plus, X, Star, Navigation } from 'lucide-react';

const SkiWaxApp = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customLocation, setCustomLocation] = useState('');
  const [savedLocations, setSavedLocations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const norwegianLocations = [
    { name: 'Oslo', lat: 59.91, lon: 10.75 },
    { name: 'Bergen', lat: 60.39, lon: 5.32 },
    { name: 'Trondheim', lat: 63.43, lon: 10.39 },
    { name: 'Stavanger', lat: 58.97, lon: 5.73 },
    { name: 'Tromsø', lat: 69.65, lon: 18.96 },
    { name: 'Lillehammer', lat: 61.11, lon: 10.47 },
    { name: 'Geilo', lat: 60.53, lon: 8.20 },
    { name: 'Hemsedal', lat: 60.86, lon: 8.55 },
    { name: 'Trysil', lat: 61.31, lon: 12.26 },
    { name: 'Oppdal', lat: 62.60, lon: 9.69 },
    { name: 'Norefjell', lat: 60.18, lon: 9.55 },
    { name: 'Gålå', lat: 61.55, lon: 9.05 },
    { name: 'Hafjell', lat: 61.23, lon: 10.43 },
    { name: 'Kvitfjell', lat: 61.46, lon: 10.15 }
  ];

  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    getCurrentLocation();
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (loc) => {
    const isFav = favorites.some(f => f.lat === loc.lat && f.lon === loc.lon);
    if (isFav) {
      saveFavorites(favorites.filter(f => !(f.lat === loc.lat && f.lon === loc.lon)));
    } else {
      saveFavorites([...favorites, loc]);
    }
  };

  const isFavorite = (loc) => {
    return favorites.some(f => f.lat === loc.lat && f.lon === loc.lon);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    const osloDefault = { lat: 59.91, lon: 10.75, name: 'Oslo' };
    setLocation(osloDefault);
    fetchWeather(osloDefault.lat, osloDefault.lon);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Din posisjon'
          };
          setLocation(loc);
          fetchWeather(loc.lat, loc.lon);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code,snowfall&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Weather API failed');
      }
      
      const data = await response.json();
      
      if (data.current) {
        setWeather(data.current);
      } else {
        throw new Error('No current weather data');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      const tempBase = lat > 65 ? -10 : lat > 60 ? -5 : 0;
      setWeather({
        temperature_2m: tempBase + (Math.random() * 6 - 3),
        precipitation: Math.random() * 2,
        wind_speed_10m: Math.random() * 8 + 2,
        snowfall: lat > 60 ? Math.random() * 0.5 : 0
      });
      setLoading(false);
    }
  };

  const addLocation = (loc) => {
    setLocation(loc);
    fetchWeather(loc.lat, loc.lon);
    if (!savedLocations.some(s => s.name === loc.name)) {
      setSavedLocations([...savedLocations, loc]);
    }
    setCustomLocation('');
    setFilteredLocations([]);
    setShowAddLocation(false);
  };

  const handleLocationSearch = (value) => {
    setCustomLocation(value);
    if (value.length > 0) {
      const filtered = norwegianLocations.filter(loc => 
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  };

  const selectLocation = (loc) => {
    setLocation(loc);
    fetchWeather(loc.lat, loc.lon);
    setCurrentPage('home');
  };

  const removeLocation = (index) => {
    setSavedLocations(savedLocations.filter((_, i) => i !== index));
  };

  const getWaxRecommendation = () => {
    if (!weather) return null;

    const temp = weather.temperature_2m;
    const precipitation = weather.precipitation || 0;
    const snowfall = weather.snowfall || 0;
    const isNewSnow = snowfall > 0.1;

    let wax, type, shortName, description, instructions, color, imageColor;

    if (temp < -12) {
      wax = 'Swix V05 Polar';
      shortName = 'Polar';
      type = 'Hardvoks';
      description = 'Ekstreme kuldeforhold med tørr, fin snø';
      instructions = 'Påfør i 4-8 tynne lag. Kork godt mellom hvert lag. Fungerer best i tørr, kald luft.';
      color = 'bg-sky-300';
      imageColor = '#7dd3fc';
    } else if (temp >= -12 && temp < -8) {
      wax = 'Swix V20 Grønn';
      shortName = 'Grønn';
      type = 'Hardvoks';
      description = isNewSnow ? 'Nysnø -8°C til -15°C' : 'Gammel snø -10°C til -18°C';
      instructions = 'Påfør i 4-6 tynne lag. Kork godt mellom hvert lag for best feste.';
      color = 'bg-green-500';
      imageColor = '#22c55e';
    } else if (temp >= -8 && temp < -2) {
      wax = 'Swix V30 Blå';
      shortName = 'Blå';
      type = 'Hardvoks';
      description = isNewSnow ? 'Nysnø -2°C til -10°C' : 'Gammel snø -5°C til -15°C';
      instructions = 'Legg på i 4-6 lag. Kork grundig mellom hvert lag. Allsidig voks for varierte forhold.';
      color = 'bg-blue-500';
      imageColor = '#3b82f6';
    } else if (temp >= -2 && temp < 0) {
      wax = 'Swix V40 Blå Extra';
      shortName = 'Blå Extra';
      type = 'Hardvoks';
      description = isNewSnow ? 'Nysnø -1°C til -7°C' : 'Gammel snø -3°C til -10°C';
      instructions = 'Markedets mest populære festevoks! Påfør i 4-8 tynne lag. Kork mellom hvert lag. Svært allsidig.';
      color = 'bg-blue-400';
      imageColor = '#60a5fa';
    } else if (temp >= 0 && temp < 1 && precipitation < 0.5) {
      wax = 'Swix V45 Fiolett Spesial';
      shortName = 'Fiolett Spesial';
      type = 'Hardvoks';
      description = isNewSnow ? 'Nysnø 0°C til -3°C' : 'Gammel snø -2°C til -6°C';
      instructions = 'Påfør i 3-5 lag. Kork godt. Vær obs på fuktig luft nær 0°C. God ved vekslende forhold.';
      color = 'bg-purple-500';
      imageColor = '#a855f7';
    } else if (temp >= 0 && temp < 1 && precipitation >= 0.5) {
      wax = 'Swix V50 Fiolett';
      shortName = 'Fiolett';
      type = 'Hardvoks';
      description = isNewSnow ? 'Nysnø 0°C' : 'Gammel snø -1°C til -3°C';
      instructions = 'Påfør i 3-4 lag. Kork mellom lag. Fungerer best i tørr luft ved frysepunktet.';
      color = 'bg-purple-400';
      imageColor = '#c084fc';
    } else if (temp >= 1 && temp < 3 && precipitation < 1) {
      wax = 'Swix V55 Rød Spesial';
      shortName = 'Rød Spesial';
      type = 'Hardvoks';
      description = isNewSnow ? 'Fuktig nysnø +1°C til -2°C' : 'Våt gammel snø';
      instructions = 'Påfør i 2-4 lag. Kork godt mellom lag. God mot våt snø og fuktige forhold.';
      color = 'bg-red-500';
      imageColor = '#ef4444';
    } else if (temp >= 1 && temp < 3 && precipitation >= 1) {
      wax = 'Swix V60 Rød/Sølv';
      shortName = 'Rød/Sølv';
      type = 'Hardvoks';
      description = isNewSnow ? 'Våt nysnø +3°C til -1°C' : 'Våt gammel snø';
      instructions = 'Påfør i 2-3 lag. Kork mellom lag. Sølvinnhold gir ekstra glid i våte forhold.';
      color = 'bg-red-400';
      imageColor = '#f87171';
    } else if (temp >= 3 && temp < 6) {
      wax = 'Swix KX35 Fiolett Spesial';
      shortName = 'Fiolett Spesial Klister';
      type = 'Klister';
      description = 'Grovkornet snø +1°C til -4°C';
      instructions = 'Påfør KX20 som underlag først. Deretter KX35 i tynne striper. Glattstryk med klisterverktøy. Bruk hansker!';
      color = 'bg-purple-600';
      imageColor = '#9333ea';
    } else if (temp >= 6 && temp < 10) {
      wax = 'Swix KX40 Blå Klister';
      shortName = 'Blå Klister';
      type = 'Klister';
      description = 'Våt grovkornet snø 0°C til +5°C';
      instructions = 'Påfør KX20 som base. Deretter KX40 i striper. Glattstryk godt. For våte og grove forhold.';
      color = 'bg-blue-600';
      imageColor = '#2563eb';
    } else {
      wax = 'Swix KX65 Rød Klister';
      shortName = 'Rød Klister';
      type = 'Klister';
      description = 'Svært våt og grov snø +10°C til 0°C';
      instructions = 'Påfør KX20 som underlag. Deretter KX65 i tynne striper. Glattstryk med verktøy. For de våteste forholdene.';
      color = 'bg-red-600';
      imageColor = '#dc2626';
    }

    return { wax, type, shortName, description, instructions, color, imageColor };
  };

  const getTrailRoutes = () => {
    if (!weather || !location) return [];
    
    const temp = weather.temperature_2m;
    
    return [
      {
        name: 'Lokal skiløype',
        from: location.name,
        to: location.name,
        via: 'Lokale løyper',
        distance: '10 km',
        difficulty: 'Middels',
        status: temp < 0 ? 'Åpen' : 'Stengt',
        condition: temp < -5 ? 'Utmerket' : temp < 0 ? 'God' : 'Dårlig',
        statusColor: temp < 0 ? 'bg-green-500' : 'bg-red-500',
        difficultyColor: 'bg-yellow-600'
      }
    ];
  };

  const recommendation = getWaxRecommendation();
  const routes = getTrailRoutes();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500 flex items-center justify-center">
        <div className="text-white text-xl font-bold">Laster...</div>
      </div>
    );
  }

  if (currentPage === 'trails') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500 text-white flex flex-col relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" stopOpacity="1"/>
              <stop offset="100%" stopColor="#64748b" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#skyGradient)"/>
          <path d="M0,400 Q200,320 400,360 T800,340 L800,600 L0,600 Z" fill="#334155" opacity="0.4"/>
          <path d="M0,440 Q250,360 500,400 T1000,380 L1000,600 L0,600 Z" fill="#1e293b" opacity="0.3"/>
          <path d="M200,460 L350,340 L500,460 Z" fill="#0f172a" opacity="0.5"/>
          <path d="M600,480 L780,300 L960,480 Z" fill="#0f172a" opacity="0.4"/>
        </svg>

        <div className="bg-gradient-to-r from-slate-600 to-slate-700 border-b border-slate-500 relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏔️</div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">SKILØYPER</h1>
                <p className="text-slate-200 text-sm mt-1">{location?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
              <div className="text-yellow-800 font-bold text-lg mb-1">🚧 Under utvikling 🚧</div>
              <div className="text-yellow-700 text-sm">Løypedata kommer snart</div>
            </div>

            <div className="space-y-4">
              {routes.map((route, idx) => (
                <div key={idx} className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border-2 border-slate-200 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{route.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`${route.difficultyColor} px-2 py-1 rounded text-xs font-bold text-white`}>
                          {route.difficulty}
                        </span>
                        <span className={`${route.statusColor} px-2 py-1 rounded text-xs font-bold text-white`}>
                          {route.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-700">{route.distance}</div>
                      <div className="text-xs text-gray-600">Distanse</div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Fra</div>
                        <div className="font-semibold text-gray-900">{route.from}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Via</div>
                        <div className="font-semibold text-gray-900">{route.via}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Til</div>
                        <div className="font-semibold text-gray-900">{route.to}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 text-sm">
                    <span className="text-gray-600">Forhold: </span>
                    <span className="font-semibold text-gray-900">{route.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 border-t-2 border-slate-500 shadow-2xl z-20">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl transition font-bold text-lg flex items-center justify-center gap-2 text-white"
              >
                <span>🎿</span>
                <span>Smøring</span>
              </button>
              <button
                className="flex-1 bg-white hover:bg-slate-50 py-4 rounded-xl transition font-bold text-lg shadow-lg flex items-center justify-center gap-2 text-slate-700"
              >
                <span>🏔️</span>
                <span>Løyper</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-600 to-slate-500 text-white flex flex-col relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" stopOpacity="1"/>
            <stop offset="100%" stopColor="#64748b" stopOpacity="1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skyGradient2)"/>
        <path d="M0,400 Q200,320 400,360 T800,340 L800,600 L0,600 Z" fill="#334155" opacity="0.4"/>
        <path d="M0,440 Q250,360 500,400 T1000,380 L1000,600 L0,600 Z" fill="#1e293b" opacity="0.3"/>
        <path d="M200,460 L350,340 L500,460 Z" fill="#0f172a" opacity="0.5"/>
        <path d="M600,480 L780,300 L960,480 Z" fill="#0f172a" opacity="0.4"/>
      </svg>

      <div className="bg-gradient-to-r from-slate-600 to-slate-700 border-b border-slate-500 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⛷️</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">DAGENS SMØRETIPS</h1>
              <p className="text-slate-200 text-sm mt-1">Profesjonell festevoks-guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">{location?.name}</span>
                  {location && (
                    <button
                      onClick={() => toggleFavorite(location)}
                      className="ml-2 p-1 hover:bg-slate-50 rounded transition"
                    >
                      <Star className={`w-5 h-5 ${isFavorite(location) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAddLocation(!showAddLocation)}
                className="p-2 hover:bg-slate-50 rounded-lg transition"
              >
                <Plus className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {showAddLocation && (
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    placeholder="Søk sted (f.eks. Trondheim)..."
                    className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-slate-400 focus:outline-none"
                  />
                </div>
                {filteredLocations.length > 0 && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 space-y-1">
                    {filteredLocations.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => addLocation(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded transition text-gray-900"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
                {customLocation && filteredLocations.length === 0 && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 text-sm text-gray-600">
                    Ingen steder funnet. Prøv: Oslo, Bergen, Trondheim, Tromsø, Lillehammer...
                  </div>
                )}
              </div>
            )}

            {favorites.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  Favoritter
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(loc)}
                      className="group relative bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition flex items-center gap-2 text-gray-900"
                    >
                      <span className="text-sm">{loc.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(loc);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {savedLocations.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Tidligere søk</div>
                <div className="flex flex-wrap gap-2">
                  {savedLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(loc)}
                      className="group relative bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2 text-gray-900"
                    >
                      <span className="text-sm">{loc.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocation(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Cloud className="w-6 h-6 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Værforhold</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-gradient-to-b from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <Thermometer className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-gray-900">{weather?.temperature_2m.toFixed(1)}°C</div>
                <div className="text-xs text-gray-600">Temperatur</div>
              </div>
              <div className="text-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900">{(weather?.precipitation || 0).toFixed(1)} mm</div>
                <div className="text-xs text-gray-600">Nedbør</div>
              </div>
              <div className="text-center bg-gradient-to-b from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
                <Wind className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                <div className="text-2xl font-bold text-gray-900">{weather?.wind_speed_10m.toFixed(1)} m/s</div>
                <div className="text-xs text-gray-600">Vind</div>
              </div>
            </div>
          </div>

          {recommendation && (
            <div className={`${recommendation.color} rounded-2xl p-6 border-2 border-white shadow-2xl`}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 rounded-lg border-2 border-white shadow-xl bg-white flex flex-col items-center justify-center" style={{ background: `linear-gradient(180deg, ${recommendation.imageColor} 0%, ${recommendation.imageColor}dd 100%)` }}>
                    <div className="text-white text-4xl font-bold mb-2">
                      {recommendation.type === 'Klister' ? 'K' : 'V'}
                    </div>
                    <div className="bg-white px-3 py-1 rounded text-sm font-bold" style={{ color: recommendation.imageColor }}>
                      SWIX
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/90 mb-1">{recommendation.type}</div>
                  <div className="text-2xl font-black mb-2 text-white">{recommendation.shortName}</div>
                  <div className="text-sm text-white/95 mb-3">{recommendation.description}</div>
                  <div className="bg-black/20 rounded-lg p-3 text-sm text-white/95 leading-relaxed">
                    <div className="font-semibold mb-1">Smøretips:</div>
                    {recommendation.instructions}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 border-t-2 border-slate-500 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              className="flex-1 bg-white hover:bg-slate-50 py-4 rounded-xl transition font-bold text-lg shadow-lg flex items-center justify-center gap-2 text-slate-700"
            >
              <span>🎿</span>
              <span>Smøring</span>
            </button>
            <button
              onClick={() => setCurrentPage('trails')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl transition font-bold text-lg flex items-center justify-center gap-2 text-white"
            >
              <span>🏔️</span>
              <span>Løyper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkiWaxApp;
