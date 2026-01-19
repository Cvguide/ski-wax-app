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
  const [error, setError] = useState(false);
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



  const getLocationSpecificTrails = (locationName) => {
    const trailsMap = {
      'Oslo': [
        {
          id: 1,
          name: 'Frognerseteren-Kikut-Sognsvann',
          difficulty: 'advanced',
          distance: '25.0',
          type: 'classic+skating',
          description: 'Starter på Frognerseteren, via Tryvannstua til Nordmarkskapellet. Fortsetter over Glåmene (440 moh) før fine nedoverbakker til Kikutstua. Retur over Bjørnsjøen og forbi Ullevålseter. Variert terreng med serveringssteder underveis.',
          trailUrl: 'https://ut.no/turforslag/115386'
        },
        {
          id: 2,
          name: 'Sognsvann-Ullevålseter',
          difficulty: 'easy',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Lysløype langs østsiden av Sognsvann mot Store Åklungen. Jevn stigning gjennom skogen til Ullevålseter (servering). En av de mest populære turene i Nordmarka.',
          trailUrl: 'https://ut.no/turforslag/116071'
        },
        {
          id: 3,
          name: 'Sognsvann rundt',
          difficulty: 'easy',
          distance: '3.3',
          type: 'classic',
          description: 'Flat rundtur rundt Sognsvann. Starter ved parkeringsplassen, følger stien rundt hele vannet. Flott kort tur.',
          trailUrl: null
        },
        {
          id: 4,
          name: 'Frognerseteren-Ullevålseter-Sognsvann',
          difficulty: 'intermediate',
          distance: '12.0',
          type: 'classic+skating',
          description: 'Starter på Frognerseteren, lysløype ned til Ullevålseter, videre ned til Sognsvann. Mye nedoverbakke, trivelig tur.',
          trailUrl: 'https://www.skiforeningen.no/utimarka/'
        },
        {
          id: 5,
          name: 'Holmenkollen-Skjennungstua',
          difficulty: 'intermediate',
          distance: '9.0',
          type: 'classic+skating',
          description: 'Rundtur fra Holmenkollen til Skjennungstua. Variert terreng med flott utsikt over Oslo.',
          trailUrl: 'https://ut.no/turforslag/115393'
        }
      ],
      'Lillehammer': [
        {
          id: 1,
          name: 'Sjusjøen-Gåsbu',
          difficulty: 'advanced',
          distance: '25.0',
          type: 'classic+skating',
          description: 'Start i Birkebeinerløypa, via Ljøsheim til Hamarsæterhøgda. Fortsetter over Prestsætra, Lavlia og Målia til Gåsbu. Flott langtur gjennom variert terreng.',
          trailUrl: 'https://ut.no/turforslag/119263'
        },
        {
          id: 2,
          name: 'Lunkefjell rundt',
          difficulty: 'intermediate',
          distance: '12.0',
          type: 'classic+skating',
          description: 'Fra Nordseter mot Ytre Reina, via Nysæterhøgda til Lunkefjell (1012 moh). Fantastisk utsikt fra toppen. Retur via alpinanlegget til Nordseter.',
          trailUrl: 'https://ut.no/turforslag/117767'
        },
        {
          id: 3,
          name: 'Gjesbuåsrunden',
          difficulty: 'easy',
          distance: '6.0',
          type: 'classic',
          description: 'Fin rundtur fra Sjusjøen Langrennsarena. Lett kupert terreng, kan gås begge veier. Populær tur.',
          trailUrl: 'https://ut.no/turforslag/115241'
        },
        {
          id: 4,
          name: 'Birkebeinerløypa Sjusjøen-Lillehammer',
          difficulty: 'intermediate',
          distance: '15.0',
          type: 'classic+skating',
          description: 'Del av den historiske Birkebeinerløypa. Fra Sjusjøen ned til Lillehammer stadion. Mye nedoverbakke siste del.',
          trailUrl: 'https://www.lillehammer.com/opplevelser/birkebeinerloypa-sjusjoen-lillehammer-15-km-p632553'
        },
        {
          id: 5,
          name: 'Nordseter-Hornsjøen',
          difficulty: 'intermediate',
          distance: '13.1',
          type: 'classic+skating',
          description: 'Fra Nordseter til Hornsjøen og tilbake. Trivelig tur gjennom fint skogsterreng.',
          trailUrl: 'https://www.lillehammer.com/opplevelser/nordseter-hornsjoen-13-1-km-p632603'
        }
      ],
      'Gålå': [
        {
          id: 1,
          name: 'Rundtur Årstulen-Lauåsen',
          difficulty: 'advanced',
          distance: '26.0',
          type: 'classic+skating',
          description: 'Flott høyfjellsløype! Tidlig preparert, ofte klar til 1. november. Flat og fin løype i høyfjellet.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/rundtur-arstulen-lauasen-26-km-p1550783'
        },
        {
          id: 2,
          name: 'Gålå Vatnet rundt',
          difficulty: 'intermediate',
          distance: '15.6',
          type: 'classic+skating',
          description: 'Fin tur i all slags vær. Rundtur rundt Gålåvatnet med variert terreng.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/gala-vatnet-rundt-15-6-km-p1550733'
        },
        {
          id: 3,
          name: 'Rundløype Blåbærfjell-Triltåsen',
          difficulty: 'easy',
          distance: '8.5',
          type: 'classic+skating',
          description: 'Lett løype med gode utsiktspunkter.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/rundloype-blabaerfjell-triltasen-8-5-km-p1550773'
        },
        {
          id: 4,
          name: 'Blå Rundløype Fagerhøi',
          difficulty: 'easy',
          distance: '3.7',
          type: 'classic',
          description: 'Passer fint for nybegynnere. Snilt terreng gjør det enkelt å lære seg skiteknikk.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/bla-rundloype-fagerhoi-3-7-km-p632733'
        }
      ],
      'Norefjell': [
        {
          id: 1,
          name: 'Norefjell Toppen',
          difficulty: 'advanced',
          distance: '20.0',
          type: 'classic+skating',
          description: 'Krevende tur til Norefjells høyeste punkt. Starter fra hotellområdet, opp gjennom variert fjellterreng.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 2,
          name: 'Høgevarde rundt',
          difficulty: 'intermediate',
          distance: '10.0',
          type: 'classic+skating',
          description: 'Flott rundtur gjennom åpent høyfjellsterreng.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 3,
          name: 'Hotellområdet rundt',
          difficulty: 'easy',
          distance: '5.0',
          type: 'classic',
          description: 'Lett rundtur fra hotellområdet. Går på flatt til lett kupert terreng.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 4,
          name: 'Tritten-runden',
          difficulty: 'intermediate',
          distance: '8.0',
          type: 'classic+skating',
          description: 'Rundtur via Tritten. Variert terreng med både oppover og nedover.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        }
      ],
      'Trysil': [
        {
          id: 1,
          name: 'Østby-Fageråsen',
          difficulty: 'advanced',
          distance: '24.0',
          type: 'classic+skating',
          description: 'Langtur fra Østby mot Fageråsen. Går gjennom Trysils største sammenhengende løypenett.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 2,
          name: 'Trysil Sentrum rundt',
          difficulty: 'intermediate',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Fin rundtur fra Trysil sentrum. Godt preparerte løyper gjennom skogsterreng.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 3,
          name: 'Skistadion rundt',
          difficulty: 'easy',
          distance: '4.5',
          type: 'classic',
          description: 'Kort tur rundt skistadion. Flat og oversiktlig løype.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 4,
          name: 'Innbygda-løypa',
          difficulty: 'intermediate',
          distance: '9.0',
          type: 'classic+skating',
          description: 'Rundtur i Innbygda. Trivelig tur gjennom skogen.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        }
      ],
      'Sjusjøen': [
        {
          id: 1,
          name: 'Sjusjøen-Gåsbu',
          difficulty: 'advanced',
          distance: '26.0',
          type: 'classic+skating',
          description: 'Start i Birkebeinerløypa, via Ljøsheim til Hamarsæterhøgda.',
          trailUrl: 'https://ut.no/turforslag/119263'
        },
        {
          id: 2,
          name: 'Lunkefjell rundt',
          difficulty: 'intermediate',
          distance: '13.0',
          type: 'classic+skating',
          description: 'Fra Nordseter via Nysæterhøgda til Lunkefjell (1012 moh).',
          trailUrl: 'https://ut.no/turforslag/117767'
        },
        {
          id: 3,
          name: 'Gjesbuåsrunden',
          difficulty: 'easy',
          distance: '5.5',
          type: 'classic',
          description: 'Fin rundtur fra Sjusjøen Langrennsarena.',
          trailUrl: 'https://ut.no/turforslag/115241'
        },
        {
          id: 4,
          name: 'Sjusjøen rundt',
          difficulty: 'easy',
          distance: '8.0',
          type: 'classic+skating',
          description: 'Flat rundtur rundt Sjusjøen sentrum.',
          trailUrl: 'https://www.skisporet.no/map/destination/53'
        }
      ],
      'Beitostølen': [
        {
          id: 1,
          name: 'Beitostølen Rundt',
          difficulty: 'advanced',
          distance: '28.0',
          type: 'classic+skating',
          description: 'Langtur gjennom Beitostølens høyfjellsområde.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 2,
          name: 'Raudalen-Øygardstølen',
          difficulty: 'intermediate',
          distance: '14.0',
          type: 'classic+skating',
          description: 'Rundtur via Raudalen til Øygardstølen.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 3,
          name: 'Stadion rundt',
          difficulty: 'easy',
          distance: '4.0',
          type: 'classic',
          description: 'Lett rundtur fra stadion.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 4,
          name: 'Heggebottane',
          difficulty: 'intermediate',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Rundtur via Heggebottane.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        }
      ]
    };
    
    return trailsMap[locationName] || [];
  };

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'DagensSmøretips/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.properties || !data.properties.timeseries || data.properties.timeseries.length === 0) {
        throw new Error('Invalid weather data');
      }
      
      const current = data.properties.timeseries[0];
      const weatherData = {
        temperature: Math.round(current.data.instant.details.air_temperature),
        precipitation: current.data.next_1_hours?.details?.precipitation_amount || 0,
        windSpeed: Math.round(current.data.instant.details.wind_speed),
        humidity: Math.round(current.data.instant.details.relative_humidity)
      };
      
      setWeather(weatherData);
      setLoading(false);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setLoading(false);
      // Keep default dummy data
    }
  };

  const fetchTrails = () => {
    setLoadingTrails(true);
    setTimeout(() => {
      const locationTrails = getLocationSpecificTrails(location.name);
      setTrails(locationTrails);
      setLoadingTrails(false);
    }, 500);
  };

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
              <span style={{ fontSize: '32px' }}>⛰️</span>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Skiløyper</h1>
                <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>{location.name}</p>
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
          
          {/* About Menu */}
          {showAboutMenu && (
            <>
              <div 
                onClick={() => setShowAboutMenu(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.2)',
                  zIndex: 90
                }}
              />
              <div style={{
                position: 'fixed',
                right: '16px',
                top: '80px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
                border: '2px solid #e2e8f0',
                width: '384px',
                zIndex: 100,
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '24px', flexShrink: 0 }}>
                  <button
                    onClick={() => setShowAboutMenu(false)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                  
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Om guiden</h2>
                  
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    {['om', 'kilder', 'personvern', 'kontakt'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setAboutMenuTab(tab)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          background: 'none',
                          border: 'none',
                          borderBottom: aboutMenuTab === tab ? '2px solid #2563eb' : 'none',
                          color: aboutMenuTab === tab ? '#2563eb' : '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab === 'om' ? 'Om appen' : tab === 'kilder' ? 'Kilder' : tab === 'personvern' ? 'Personvern' : 'Kontakt'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
                  {aboutMenuTab === 'om' && (
                    <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                      <p><strong style={{ color: '#1f2937' }}>Smøreguide</strong> hjelper deg med å finne riktig skismøring basert på temperatur og værforhold, samt oppdage flotte skiløyper i hele Norge.</p>
                      <p>Appen gir deg værmeldinger, smøringsanbefalinger basert på Swix sine retningslinjer, og direktelenker til detaljerte løypebeskrivelser.</p>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                          <strong>Ansvarsfraskrivelse:</strong> Alle råd og anbefalinger er veiledende. Sjekk alltid lokale forhold før du drar ut.
                        </p>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Versjon:</strong> 1.0<br/>
                          <strong>Sist oppdatert:</strong> Januar 2026
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {aboutMenuTab === 'kilder' && (
                    <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Værdata</h3>
                        <p>Værdata hentes i sanntid fra <strong>Meteorologisk institutt (met.no)</strong> via deres API.</p>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Smøringsanbefalinger</h3>
                        <p>Anbefalingene er basert på <strong>Swix sine retningslinjer</strong> for skismøring.</p>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Løypeinformasjon</h3>
                        <p style={{ marginBottom: '8px' }}>Løypebeskrivelser hentes fra:</p>
                        <ul style={{ marginLeft: '16px', lineHeight: '1.8' }}>
                          <li><strong>UT.no</strong> - Den norske turistforeningens turportal</li>
                          <li><strong>Skisporet.no</strong> - Sanntidsinfo om preparerte løyper</li>
                          <li><strong>Lillehammer.com</strong> - Visit Lillehammer sine turforslag</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {aboutMenuTab === 'personvern' && (
                    <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Datainnsamling</h3>
                        <p>Smøreguide samler <strong>ikke inn personopplysninger</strong>.</p>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Lokasjonsdata</h3>
                        <p>Stedsinformasjonen du velger brukes kun til å hente værdata. Ingen lokasjonsdata lagres eller deles.</p>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>GDPR</h3>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Appen følger EUs personvernforordning (GDPR) og norsk personvernlovgivning.</p>
                      </div>
                    </div>
                  )}
                  
                  {aboutMenuTab === 'kontakt' && (
                    <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                      <p>Har du spørsmål eller forslag til forbedringer?</p>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Kontaktinformasjon</h3>
                        <div style={{ lineHeight: '2' }}>
                          <p style={{ fontWeight: '600' }}>Halvor Ringen</p>
                          <p style={{ color: '#2563eb' }}>
                            <a href="tel:46899799" style={{ color: '#2563eb', textDecoration: 'none' }}>📞 468 99 799</a>
                          </p>
                          <p style={{ color: '#2563eb' }}>
                            <a href="mailto:halvor.ringen@hotmail.com" style={{ color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
                              ✉️ halvor.ringen@hotmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '16px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '2px solid #60a5fa',
            color: 'white',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{location.name}</h2>
            </div>
            
            {trails.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>⛰️</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Skiløyper i området</div>
                </div>
              </div>
            )}
          </div>

          {loadingTrails ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '16px', fontSize: '18px', color: '#4b5563' }}>Henter løyper...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trails.map((trail) => (
                <div
                  key={trail.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '2px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ height: '8px', background: getTrailColor(trail.difficulty) }}></div>
                  
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getTrailColor(trail.difficulty)
                          }}></div>
                          <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '20px', margin: 0 }}>{trail.name}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {trail.distance && (
                            <span style={{
                              padding: '4px 12px',
                              background: '#f1f5f9',
                              color: '#475569',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {trail.distance} km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTrail(selectedTrail === trail.id ? null : trail.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#2563eb',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        <span>Se detaljer</span>
                        <span style={{ fontSize: '20px' }}>{selectedTrail === trail.id ? '−' : '+'}</span>
                      </div>
                    </button>

                    {selectedTrail === trail.id && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '12px' }}>{trail.description}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '600' }}>Type:</span>
                          <span>{trail.type}</span>
                        </div>

                        {trail.trailUrl && (
                          <a
                            href={trail.trailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'block',
                              width: '100%',
                              background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                              color: 'white',
                              textAlign: 'center',
                              padding: '16px',
                              borderRadius: '8px',
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          >
                            🗺️ Se kart og full beskrivelse
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
              onClick={() => setCurrentPage('home')}
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
              🎿 Smøring
            </button>

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
        
        {/* About Menu */}
        {showAboutMenu && (
          <>
            <div 
              onClick={() => setShowAboutMenu(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.2)',
                zIndex: 90
              }}
            />
            <div style={{
              position: 'fixed',
              right: '16px',
              top: '80px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
              border: '2px solid #e2e8f0',
              width: '384px',
              zIndex: 100,
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '24px', flexShrink: 0 }}>
                <button
                  onClick={() => setShowAboutMenu(false)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
                
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Om guiden</h2>
                
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  {['om', 'kilder', 'personvern', 'kontakt'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAboutMenuTab(tab)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        borderBottom: aboutMenuTab === tab ? '2px solid #2563eb' : 'none',
                        color: aboutMenuTab === tab ? '#2563eb' : '#6b7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab === 'om' ? 'Om appen' : tab === 'kilder' ? 'Kilder' : tab === 'personvern' ? 'Personvern' : 'Kontakt'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
                {aboutMenuTab === 'om' && (
                  <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                    <p><strong style={{ color: '#1f2937' }}>Dagens Smøretips</strong> gir deg profesjonelle anbefalinger for festevoks basert på temperatur og værforhold.</p>
                    <p>Appen henter sanntidsdata fra Meteorologisk institutt og gir deg Swix sine anbefalinger.</p>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                        <strong>Ansvarsfraskrivelse:</strong> Alle råd og anbefalinger er veiledende. Sjekk alltid lokale forhold før du drar ut.
                      </p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        <strong>Versjon:</strong> 1.0<br/>
                        <strong>Sist oppdatert:</strong> Januar 2026
                      </p>
                    </div>
                  </div>
                )}
                
                {aboutMenuTab === 'kilder' && (
                  <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Værdata</h3>
                      <p>Værdata hentes i sanntid fra <strong>Meteorologisk institutt (met.no)</strong> via deres API.</p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Smøringsanbefalinger</h3>
                      <p>Anbefalingene er basert på <strong>Swix sine retningslinjer</strong> for skismøring.</p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Løypeinformasjon</h3>
                      <p style={{ marginBottom: '8px' }}>Løypebeskrivelser hentes fra:</p>
                      <ul style={{ marginLeft: '16px', lineHeight: '1.8' }}>
                        <li><strong>UT.no</strong> - Den norske turistforeningens turportal</li>
                        <li><strong>Skisporet.no</strong> - Sanntidsinfo om preparerte løyper</li>
                        <li><strong>Lillehammer.com</strong> - Visit Lillehammer sine turforslag</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {aboutMenuTab === 'personvern' && (
                  <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Datainnsamling</h3>
                      <p>Dagens Smøretips samler <strong>ikke inn personopplysninger</strong>.</p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>Lokasjonsdata</h3>
                      <p>Stedsinformasjonen du velger brukes kun til å hente værdata. Ingen lokasjonsdata lagres eller deles.</p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', fontSize: '14px' }}>GDPR</h3>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Appen følger EUs personvernforordning (GDPR) og norsk personvernlovgivning.</p>
                    </div>
                  </div>
                )}
                
                {aboutMenuTab === 'kontakt' && (
                  <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                    <p>Har du spørsmål eller forslag til forbedringer?</p>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '12px' }}>
                      <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Kontaktinformasjon</h3>
                      <div style={{ lineHeight: '2' }}>
                        <p style={{ fontWeight: '600' }}>Halvor Ringen</p>
                        <p style={{ color: '#2563eb' }}>
                          <a href="tel:46899799" style={{ color: '#2563eb', textDecoration: 'none' }}>📞 468 99 799</a>
                        </p>
                        <p style={{ color: '#2563eb' }}>
                          <a href="mailto:halvor.ringen@hotmail.com" style={{ color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
                            ✉️ halvor.ringen@hotmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      {/* Content */}
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '24px',
        paddingBottom: '96px',
        position: 'relative',
        zIndex: 10
      }}>
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
            onClick={() => setCurrentPage('trails')}
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

}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
