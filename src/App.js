import React, { useState, useEffect } from 'react';

export default function App() {
  const [location, setLocation] = useState({ lat: 59.91, lon: 10.75, name: 'Oslo' });
  const [weather, setWeather] = useState({
    temperature: 2,
    precipitation: 0,
    windSpeed: 3,
    humidity: 70
  });
  const [loading, setLoading] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [trails, setTrails] = useState([]);
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showAboutMenu, setShowAboutMenu] = useState(false);
  const [aboutMenuTab, setAboutMenuTab] = useState('om');

  const norwegianLocations = [
    { name: 'Oslo', lat: 59.91, lon: 10.75 },
    { name: 'Bergen', lat: 60.39, lon: 5.32 },
    { name: 'Trondheim', lat: 63.43, lon: 10.39 },
    { name: 'Lillehammer', lat: 61.11, lon: 10.47 },
    { name: 'Geilo', lat: 60.53, lon: 8.20 },
    { name: 'Hemsedal', lat: 60.86, lon: 8.55 },
    { name: 'Trysil', lat: 61.31, lon: 12.26 },
    { name: 'Oppdal', lat: 62.60, lon: 9.69 },
    { name: 'Hafjell', lat: 61.23, lon: 10.43 },
    { name: 'Sjusjøen', lat: 61.18, lon: 10.80 },
    { name: 'Beitostølen', lat: 61.25, lon: 8.92 },
    { name: 'Norefjell', lat: 60.18, lon: 9.55 },
    { name: 'Gålå', lat: 61.55, lon: 9.40 }
  ];

  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchWeather(location.lat, location.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage === 'trails' && location) {
      fetchTrails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, location]);

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'SkiWaxApp/1.0 github.com/Cvguide/ski-wax-app'
          }
        }
      );
      
      if (!response.ok) {
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const current = data.properties.timeseries[0];
      
      setWeather({
        temperature: Math.round(current.data.instant.details.air_temperature),
        precipitation: current.data.next_1_hours?.details?.precipitation_amount || 0,
        windSpeed: Math.round(current.data.instant.details.wind_speed),
        humidity: Math.round(current.data.instant.details.relative_humidity),
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getTrailColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy':
      case 'lett': return '#22c55e';
      case 'intermediate':
      case 'middels': return '#3b82f6';
      case 'advanced':
      case 'vanskelig': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getWaxRecommendation = () => {
    if (!weather) return null;
    const temp = weather.temperature;

    if (temp > 0) {
      return {
        category: 'Hardvoks',
        name: 'Rød Spesial',
        letter: 'V',
        condition: 'Våt gammel snø',
        tip: 'Påfør i 2-4 lag. Kork godt mellom lag. God mot våt snø og fuktige forhold.',
        color: '#ef4444'
      };
    } else if (temp >= -2) {
      return {
        category: 'Hardvoks',
        name: 'Rød',
        letter: 'V',
        condition: 'Fuktig snø rundt 0°C',
        tip: 'Påfør i 2-3 lag. Kork grundig mellom hvert lag for best feste.',
        color: '#dc2626'
      };
    } else if (temp >= -5) {
      return {
        category: 'Hardvoks',
        name: 'Lilla Spesial',
        letter: 'VP',
        condition: 'Fuktig nysnø',
        tip: 'Påfør i 2-3 lag, kork godt mellom lag. Ideelt for fuktig nysnø.',
        color: '#a855f7'
      };
    } else if (temp >= -10) {
      return {
        category: 'Hardvoks',
        name: 'Blå Spesial',
        letter: 'VB',
        condition: 'Fin kornete snø',
        tip: 'Påfør i 2-3 lag. Godt allround-voks for temperert vintervær.',
        color: '#3b82f6'
      };
    } else if (temp >= -15) {
      return {
        category: 'Hardvoks',
        name: 'Grønn',
        letter: 'VG',
        condition: 'Kald fin snø',
        tip: 'Påfør i 2-3 lag. Utmerket for kalde forhold med fin kornstruktur.',
        color: '#22c55e'
      };
    } else {
      return {
        category: 'Hardvoks',
        name: 'Grønn Spesial',
        letter: 'VGS',
        condition: 'Veldig kald fin snø',
        tip: 'Påfør i 3-4 lag for ekstra kalde forhold. Kork grundig.',
        color: '#16a34a'
      };
    }
  };

  const recommendation = getWaxRecommendation();

  const handleLocationSearch = (e) => {
    const searchTerm = e.target.value;
    setCustomLocation(searchTerm);
    
    if (searchTerm.length > 0) {
      const filtered = norwegianLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  };

  const selectLocation = (loc) => {
    setLocation(loc);
    setCustomLocation('');
    setFilteredLocations([]);
    setShowAddLocation(false);
    fetchWeather(loc.lat, loc.lon);
  };

  // Simplified - no trails for now, just home page
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #94a3b8, #64748b, #475569)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `}</style>
      
      {/* Mountain background */}
      <svg style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '384px',
        pointerEvents: 'none'
      }} viewBox="0 0 1200 400" preserveAspectRatio="none">
        <path d="M0,400 L0,200 Q150,150 300,180 T600,160 T900,190 T1200,170 L1200,400 Z" fill="#475569" opacity="0.4"/>
        <path d="M0,400 L0,220 Q200,180 400,210 T800,200 T1200,220 L1200,400 Z" fill="#334155" opacity="0.5"/>
        <path d="M0,400 L300,400 L600,100 L900,400 L1200,400 Z" fill="#1e293b"/>
      </svg>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, #475569, #334155)',
        color: 'white',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>⛷️</span>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>DAGENS SMØRETIPS</h1>
              <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>Profesjonell festevoks-guide</p>
            </div>
          </div>
          
          {/* Hamburger menu */}
          <button
            onClick={() => setShowAboutMenu(!showAboutMenu)}
            style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '6px' }}></div>
            <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '6px' }}></div>
            <div style={{ width: '24px', height: '2px', background: 'white' }}></div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '24px',
        paddingBottom: '96px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Location card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px', color: '#64748b' }}>📍</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>{location.name}</span>
              <span style={{ fontSize: '24px', color: '#e5e7eb', cursor: 'pointer' }}>⭐</span>
            </div>
            <button
              onClick={() => setShowAddLocation(!showAddLocation)}
              style={{
                background: 'transparent',
                color: '#1f2937',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              +
            </button>
          </div>

          {showAddLocation && (
            <div style={{ marginTop: '16px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Søk etter sted..."
                value={customLocation}
                onChange={handleLocationSearch}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              />
              {filteredLocations.length > 0 && (
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  marginTop: '8px',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => selectLocation(loc)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        textAlign: 'left',
                        background: 'white',
                        border: 'none',
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#1f2937',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                      onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weather card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ☁️ Værforhold
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              background: '#ffe4e6',
              padding: '24px 16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌡️</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {weather.temperature}°C
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Temperatur</div>
            </div>

            <div style={{
              background: '#dbeafe',
              padding: '24px 16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>☁️</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {weather.precipitation} mm
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Nedbør</div>
            </div>

            <div style={{
              background: '#ccfbf1',
              padding: '24px 16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💨</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {weather.windSpeed} m/s
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Vind</div>
            </div>
          </div>
        </div>

        {/* Wax recommendation card */}
        {recommendation && (
          <div style={{
            background: recommendation.color,
            borderRadius: '16px',
            padding: '24px',
            border: '3px solid white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px'
              }}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#1f2937', lineHeight: 1 }}>
                  {recommendation.letter}
                </div>
                <div style={{ 
                  marginTop: '4px',
                  padding: '4px 12px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                }}>SWIX</div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.9 }}>
                  {recommendation.category}
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {recommendation.name}
                </h2>
                <div style={{ fontSize: '15px', marginBottom: '16px', opacity: 0.95 }}>
                  {recommendation.condition}
                </div>
                
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Smøretips:</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {recommendation.tip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to right, #475569, #334155)',
        borderTop: '2px solid #64748b',
        boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
        zIndex: 20
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            style={{
              flex: 1,
              background: 'white',
              color: '#334155',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🎿 Smøring
          </button>
          <button
            onClick={() => alert('Løyper kommer snart!')}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🏔️ Løyper
          </button>
        </div>
      </div>
    </div>
  );
}
