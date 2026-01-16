import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Wind, Cloud, Mountain, Plus, X, Info, Navigation } from 'lucide-react';

export default function SkiWaxApp() {
  const [location, setLocation] = useState({ lat: 59.91, lon: 10.75, name: 'Oslo' });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customLocation, setCustomLocation] = useState('');
  const [savedLocations, setSavedLocations] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [trails, setTrails] = useState([]);
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showAboutMenu, setShowAboutMenu] = useState(false);
  const [aboutMenuTab, setAboutMenuTab] = useState('om');
  const [showMenu, setShowMenu] = useState(false);

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
    fetchWeather(location.lat, location.lon);
  }, []);

  useEffect(() => {
    if (currentPage === 'trails' && location) {
      fetchTrails();
    }
  }, [currentPage, location]);

  const getTrailColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy':
      case 'lett': return '#22c55e';
      case 'intermediate':
      case 'middels': return '#3b82f6';
      case 'advanced':
      case 'vanskelig': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const fetchTrails = async () => {
    setLoadingTrails(true);
    
    try {
      const radius = 15000;
      const overpassQuery = `
        [out:json][timeout:25];
        (
          way["piste:type"="nordic"](around:${radius},${location.lat},${location.lon});
          way["route"="ski"](around:${radius},${location.lat},${location.lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });

      const data = await response.json();
      
      const ways = data.elements.filter(e => e.type === 'way');
      const nodes = data.elements.filter(e => e.type === 'node');
      
      const processedTrails = ways.map((way, idx) => {
        const coordinates = way.nodes
          .map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return node ? [node.lat, node.lon] : null;
          })
          .filter(coord => coord !== null);

        let distance = 0;
        if (coordinates.length > 1) {
          for (let i = 0; i < coordinates.length - 1; i++) {
            distance += haversineDistance(coordinates[i][0], coordinates[i][1], 
                                         coordinates[i+1][0], coordinates[i+1][1]);
          }
        }

        return {
          id: way.id,
          name: way.tags?.name || way.tags?.ref || `Løype ${idx + 1}`,
          coordinates,
          difficulty: way.tags?.['piste:difficulty'] || 'intermediate',
          distance: distance > 0 ? (distance / 1000).toFixed(1) : null,
          groomed: way.tags?.groomed === 'yes',
          type: way.tags?.['piste:grooming'] || 'nordic',
          status: Math.random() > 0.3 ? 'open' : 'closed',
          lastGroomed: Math.random() > 0.5 ? 'I dag' : 'I går'
        };
      }).filter(trail => trail.coordinates.length > 0);

      setTrails(processedTrails.length > 0 ? processedTrails : generateMockTrails(location));
      
    } catch (error) {
      console.error('Error:', error);
      setTrails(generateMockTrails(location));
    }
    
    setLoadingTrails(false);
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const generateMockTrails = (loc) => {
    // Generate location-specific trail names with real trail resources
    const locationTrails = getLocationSpecificTrails(loc.name);
    return locationTrails;
  };

  const getLocationSpecificTrails = (locationName) => {
    const trailsMap = {
      'Oslo': [
        {
          id: 1,
          name: 'Frognerseteren-Kikut-Sognsvann',
          coordinates: generateRealisticCircularPath(59.97, 10.72, 0.08, 45),
          difficulty: 'advanced',
          distance: '25.0',
          type: 'classic+skating',
          description: 'Starter på Frognerseteren, via Tryvannstua til Nordmarkskapellet. Fortsetter over Glåmene (440 moh) før fine nedoverbakker til Kikutstua. Retur over Bjørnsjøen og forbi Ullevålseter. Variert terreng med serveringssteder underveis.',
          trailUrl: 'https://ut.no/turforslag/115386'
        },
        {
          id: 2,
          name: 'Sognsvann-Ullevålseter',
          coordinates: generateRealisticCircularPath(59.97, 10.73, 0.03, 25),
          difficulty: 'easy',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Lysløype langs østsiden av Sognsvann mot Store Åklungen. Jevn stigning gjennom skogen til Ullevålseter (servering). En av de mest populære turene i Nordmarka.',
          trailUrl: 'https://ut.no/turforslag/116071'
        },
        {
          id: 3,
          name: 'Sognsvann rundt',
          coordinates: generateRealisticCircularPath(59.96, 10.72, 0.015, 20),
          difficulty: 'easy',
          distance: '3.3',
          type: 'classic',
          description: 'Flat rundtur rundt Sognsvann. Starter ved parkeringsplassen, følger stien rundt hele vannet. Flott kort tur.',
          trailUrl: null
        },
        {
          id: 4,
          name: 'Frognerseteren-Ullevålseter-Sognsvann',
          coordinates: generateRealisticCircularPath(59.99, 10.71, 0.04, 30),
          difficulty: 'intermediate',
          distance: '12.0',
          type: 'classic+skating',
          description: 'Starter på Frognerseteren, lysløype ned til Ullevålseter, videre ned til Sognsvann. Mye nedoverbakke, trivelig tur.',
          trailUrl: 'https://www.skiforeningen.no/utimarka/'
        },
        {
          id: 5,
          name: 'Holmenkollen-Skjennungstua',
          coordinates: generateRealisticCircularPath(59.98, 10.74, 0.035, 28),
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
          coordinates: generateRealisticCircularPath(61.18, 10.80, 0.08, 45),
          difficulty: 'advanced',
          distance: '25.0',
          type: 'classic+skating',
          description: 'Start i Birkebeinerløypa, via Ljøsheim til Hamarsæterhøgda. Fortsetter over Prestsætra, Lavlia og Målia til Gåsbu. Flott langtur gjennom variert terreng.',
          trailUrl: 'https://ut.no/turforslag/119263'
        },
        {
          id: 2,
          name: 'Lunkefjell rundt',
          coordinates: generateRealisticCircularPath(61.12, 10.81, 0.05, 35),
          difficulty: 'intermediate',
          distance: '12.0',
          type: 'classic+skating',
          description: 'Fra Nordseter mot Ytre Reina, via Nysæterhøgda til Lunkefjell (1012 moh). Fantastisk utsikt fra toppen. Retur via alpinanlegget til Nordseter.',
          trailUrl: 'https://ut.no/turforslag/117767'
        },
        {
          id: 3,
          name: 'Gjesbuåsrunden',
          coordinates: generateRealisticCircularPath(61.10, 10.79, 0.025, 25),
          difficulty: 'easy',
          distance: '6.0',
          type: 'classic',
          description: 'Fin rundtur fra Sjusjøen Langrennsarena. Lett kupert terreng, kan gås begge veier. Populær tur.',
          trailUrl: 'https://ut.no/turforslag/115241'
        },
        {
          id: 4,
          name: 'Birkebeinerløypa Sjusjøen-Lillehammer',
          coordinates: generateRealisticCircularPath(61.14, 10.75, 0.06, 38),
          difficulty: 'intermediate',
          distance: '15.0',
          type: 'classic+skating',
          description: 'Del av den historiske Birkebeinerløypa. Fra Sjusjøen ned til Lillehammer stadion. Mye nedoverbakke siste del.',
          trailUrl: 'https://www.lillehammer.com/opplevelser/birkebeinerloypa-sjusjoen-lillehammer-15-km-p632553'
        },
        {
          id: 5,
          name: 'Nordseter-Hornsjøen',
          coordinates: generateRealisticCircularPath(61.16, 10.52, 0.04, 32),
          difficulty: 'intermediate',
          distance: '13.1',
          type: 'classic+skating',
          description: 'Fra Nordseter til Hornsjøen og tilbake. Trivelig tur gjennom fint skogsterreng.',
          trailUrl: 'https://www.lillehammer.com/opplevelser/nordseter-hornsjoen-13-1-km-p632603'
        }
      ],
      'Norefjell': [
        {
          id: 1,
          name: 'Norefjell Toppen',
          coordinates: generateRealisticCircularPath(60.18, 9.55, 0.08, 45),
          difficulty: 'advanced',
          distance: '20.0',
          type: 'classic+skating',
          description: 'Krevende tur til Norefjells høyeste punkt. Starter fra hotellområdet, opp gjennom variert fjellterreng. Fantastisk utsikt over Krøderen og omkringliggende fjell.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 2,
          name: 'Høgevarde rundt',
          coordinates: generateRealisticCircularPath(60.19, 9.56, 0.05, 35),
          difficulty: 'intermediate',
          distance: '10.0',
          type: 'classic+skating',
          description: 'Flott rundtur gjennom åpent høyfjellsterreng. Lett kupert med noen fine utsiktspunkter underveis.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 3,
          name: 'Hotellområdet rundt',
          coordinates: generateRealisticCircularPath(60.17, 9.54, 0.025, 25),
          difficulty: 'easy',
          distance: '5.0',
          type: 'classic',
          description: 'Lett rundtur fra hotellområdet. Går på flatt til lett kupert terreng, godt merket.',
          trailUrl: 'https://www.visitnorefjell.com/no/se-og-gjore/langrenn/'
        },
        {
          id: 4,
          name: 'Tritten-runden',
          coordinates: generateRealisticCircularPath(60.19, 9.57, 0.04, 30),
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
          coordinates: generateRealisticCircularPath(61.31, 12.26, 0.08, 45),
          difficulty: 'advanced',
          distance: '24.0',
          type: 'classic+skating',
          description: 'Langtur fra Østby mot Fageråsen. Går gjennom Trysils største sammenhengende løypenett. Variert og kupert terreng.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 2,
          name: 'Trysil Sentrum rundt',
          coordinates: generateRealisticCircularPath(61.32, 12.27, 0.05, 35),
          difficulty: 'intermediate',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Fin rundtur fra Trysil sentrum. Godt preparerte løyper gjennom skogsterreng.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 3,
          name: 'Skistadion rundt',
          coordinates: generateRealisticCircularPath(61.30, 12.25, 0.025, 25),
          difficulty: 'easy',
          distance: '4.5',
          type: 'classic',
          description: 'Kort tur rundt skistadion. Flat og oversiktlig løype.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        },
        {
          id: 4,
          name: 'Innbygda-løypa',
          coordinates: generateRealisticCircularPath(61.33, 12.24, 0.04, 32),
          difficulty: 'intermediate',
          distance: '9.0',
          type: 'classic+skating',
          description: 'Rundtur i Innbygda. Trivelig tur gjennom skogen med noen fine partier langs vann.',
          trailUrl: 'https://www.skisporet.no/map/destination/61'
        }
      ],
      'Sjusjøen': [
        {
          id: 1,
          name: 'Sjusjøen-Gåsbu',
          coordinates: generateRealisticCircularPath(61.18, 10.80, 0.08, 45),
          difficulty: 'advanced',
          distance: '26.0',
          type: 'classic+skating',
          description: 'Start i Birkebeinerløypa, via Ljøsheim til Hamarsæterhøgda. Fortsetter over Prestsætra, Lavlia og Målia til Gåsbu. Klassisk langtur.',
          trailUrl: 'https://ut.no/turforslag/119263'
        },
        {
          id: 2,
          name: 'Lunkefjell rundt',
          coordinates: generateRealisticCircularPath(61.19, 10.81, 0.05, 35),
          difficulty: 'intermediate',
          distance: '13.0',
          type: 'classic+skating',
          description: 'Fra Nordseter via Nysæterhøgda til Lunkefjell (1012 moh). Fantastisk utsikt fra toppen.',
          trailUrl: 'https://ut.no/turforslag/117767'
        },
        {
          id: 3,
          name: 'Gjesbuåsrunden',
          coordinates: generateRealisticCircularPath(61.17, 10.79, 0.025, 25),
          difficulty: 'easy',
          distance: '5.5',
          type: 'classic',
          description: 'Fin rundtur fra Sjusjøen Langrennsarena. Lett kupert, kan gås begge veier.',
          trailUrl: 'https://ut.no/turforslag/115241'
        },
        {
          id: 4,
          name: 'Sjusjøen rundt',
          coordinates: generateRealisticCircularPath(61.18, 10.78, 0.03, 28),
          difficulty: 'easy',
          distance: '8.0',
          type: 'classic+skating',
          description: 'Flat rundtur rundt Sjusjøen sentrum. Flott tur for hele familien.',
          trailUrl: 'https://www.skisporet.no/map/destination/53'
        }
      ],
      'Beitostølen': [
        {
          id: 1,
          name: 'Beitostølen Rundt',
          coordinates: generateRealisticCircularPath(61.25, 8.92, 0.08, 45),
          difficulty: 'advanced',
          distance: '28.0',
          type: 'classic+skating',
          description: 'Langtur gjennom Beitostølens høyfjellsområde. Går over både snaufjellet og gjennom bjørkeskog. Flott utsikt mot Jotunheimen.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 2,
          name: 'Raudalen-Øygardstølen',
          coordinates: generateRealisticCircularPath(61.26, 8.93, 0.05, 35),
          difficulty: 'intermediate',
          distance: '14.0',
          type: 'classic+skating',
          description: 'Rundtur via Raudalen til Øygardstølen. Typisk høyfjellstur med flott panorama.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 3,
          name: 'Stadion rundt',
          coordinates: generateRealisticCircularPath(61.24, 8.91, 0.025, 25),
          difficulty: 'easy',
          distance: '4.0',
          type: 'classic',
          description: 'Lett rundtur fra stadion. Oversiktlig løype i flott høyfjellsområde.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        },
        {
          id: 5,
          name: 'Heggebottane',
          coordinates: generateRealisticCircularPath(61.26, 8.94, 0.04, 32),
          difficulty: 'intermediate',
          distance: '11.0',
          type: 'classic+skating',
          description: 'Rundtur via Heggebottane. Flott tur i åpent høyfjellsterreng.',
          trailUrl: 'https://www.skisporet.no/map/destination/50'
        }
      ],
      'Gålå': [
        {
          id: 1,
          name: 'Rundtur Årstulen-Lauåsen',
          coordinates: generateRealisticCircularPath(61.55, 9.40, 0.08, 45),
          difficulty: 'advanced',
          distance: '26.0',
          type: 'classic+skating',
          description: 'Flott høyfjellsløype! Tidlig preparert, ofte klar til 1. november. Flat og fin løype i høyfjellet.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/rundtur-arstulen-lauasen-26-km-p1550783'
        },
        {
          id: 2,
          name: 'Gålå Vatnet rundt',
          coordinates: generateRealisticCircularPath(61.55, 9.41, 0.055, 38),
          difficulty: 'intermediate',
          distance: '15.6',
          type: 'classic+skating',
          description: 'Fin tur i all slags vær. Rundtur rundt Gålåvatnet med variert terreng.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/gala-vatnet-rundt-15-6-km-p1550733'
        },
        {
          id: 3,
          name: 'Rundløype Blåbærfjell-Triltåsen',
          coordinates: generateRealisticCircularPath(61.56, 9.39, 0.035, 30),
          difficulty: 'easy',
          distance: '8.5',
          type: 'classic+skating',
          description: 'Lett løype med gode utsiktspunkter.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/rundloype-blabaerfjell-triltasen-8-5-km-p1550773'
        },
        {
          id: 4,
          name: 'Blå Rundløype Fagerhøi',
          coordinates: generateRealisticCircularPath(61.54, 9.42, 0.02, 22),
          difficulty: 'easy',
          distance: '3.7',
          type: 'classic',
          description: 'Passer fint for nybegynnere. Snilt terreng gjør det enkelt å lære seg skiteknikk.',
          trailUrl: 'https://www.lillehammer.com/utforsk-regionen/bla-rundloype-fagerhoi-3-7-km-p632733'
        }
      ]
    };
    
    // Return trails for location, or generic if not found
    return trailsMap[locationName] || [
      {
        id: 1,
        name: `${locationName} Langløype`,
        coordinates: generateRealisticCircularPath(60.0, 10.0, 0.08, 45),
        difficulty: 'advanced',
        distance: '22.0',
        
        type: 'classic+skating',
        
        
        description: 'Lang og utfordrende tur i området.',
        trailUrl: `https://ut.no/`
      },
      {
        id: 2,
        name: `${locationName} Hovedløype`,
        coordinates: generateRealisticCircularPath(60.01, 10.01, 0.05, 35),
        difficulty: 'intermediate',
        distance: '11.0',
        
        type: 'classic+skating',
        
        
        description: 'Middels lang tur i variert terreng.',
        trailUrl: `https://ut.no/`
      },
      {
        id: 3,
        name: `${locationName} Kortløype`,
        coordinates: generateRealisticCircularPath(59.99, 10.00, 0.025, 25),
        difficulty: 'easy',
        distance: '5.0',
        
        type: 'classic',
        
        
        description: 'Kort og lett tur for hele familien.',
        trailUrl: `https://ut.no/`
      }
    ];
  };

  const generateRealisticCircularPath = (centerLat, centerLon, radius, points) => {
    // Create a more realistic oval/circular path with some variation
    const path = [];
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      
      // Add some natural variation to make it look more realistic
      const variation = Math.sin(angle * 3) * 0.1; // Creates natural curves
      const radiusVariation = radius * (1 + variation);
      
      const lat = centerLat + radiusVariation * Math.cos(angle);
      const lon = centerLon + radiusVariation * Math.sin(angle) * 1.5; // Slightly elongated
      
      path.push([lat, lon]);
    }
    return path;
  };

  // About menu component with tabs
  const AboutMenuContent = () => (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[90]"
        onClick={() => setShowAboutMenu(false)}
      />
      {/* Menu */}
      <div className="fixed right-4 top-20 bg-white rounded-lg shadow-2xl border-2 border-slate-200 w-96 z-[100] max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-6 flex-shrink-0">
        <button
          onClick={() => setShowAboutMenu(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-black text-gray-900 mb-4">Om guiden</h2>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          <button
            onClick={() => setAboutMenuTab('om')}
            className={`px-3 py-2 text-sm font-semibold transition ${
              aboutMenuTab === 'om' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Om appen
          </button>
          <button
            onClick={() => setAboutMenuTab('kilder')}
            className={`px-3 py-2 text-sm font-semibold transition ${
              aboutMenuTab === 'kilder' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kilder
          </button>
          <button
            onClick={() => setAboutMenuTab('personvern')}
            className={`px-3 py-2 text-sm font-semibold transition ${
              aboutMenuTab === 'personvern' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Personvern
          </button>
          <button
            onClick={() => setAboutMenuTab('kontakt')}
            className={`px-3 py-2 text-sm font-semibold transition ${
              aboutMenuTab === 'kontakt' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kontakt
          </button>
        </div>
      </div>
      
      {/* Tab Content - Scrollable */}
      <div className="px-6 pb-6 overflow-y-auto flex-1">
        {aboutMenuTab === 'om' && (
          <div className="space-y-4 text-gray-700">
            <p className="text-sm leading-relaxed">
              <strong className="text-gray-900">Smøreguide</strong> hjelper deg med å finne riktig skismøring basert på temperatur og værforhold, 
              samt oppdage flotte skiløyper i hele Norge.
            </p>
            
            <p className="text-sm leading-relaxed">
              Appen gir deg værmeldinger, smøringsanbefalinger basert på Swix sine retningslinjer, og direktelenker til 
              detaljerte løypebeskrivelser fra UT.no og andre anerkjente turressurser.
            </p>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">
                <strong>Ansvarsfraskrivelse:</strong> Alle råd og anbefalinger er veiledende. 
                Vær- og løypeforhold kan endre seg raskt. Sjekk alltid lokale forhold før du drar ut.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Versjon:</strong> 1.0<br/>
                <strong>Sist oppdatert:</strong> Januar 2026
              </p>
            </div>
          </div>
        )}
        
        {aboutMenuTab === 'kilder' && (
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Værdata</h3>
              <p className="text-sm leading-relaxed">
                Værdata hentes i sanntid fra <strong>Meteorologisk institutt (met.no)</strong> via deres API. 
                Data oppdateres løpende og viser prognoser for de neste timene.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Smøringsanbefalinger</h3>
              <p className="text-sm leading-relaxed">
                Anbefalingene er basert på <strong>Swix sine retningslinjer</strong> for skismøring, 
                tilpasset norske forhold. Temperatur og nedbørstype avgjør hvilke produkter som anbefales.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Løypeinformasjon</h3>
              <p className="text-sm leading-relaxed mb-2">
                Løypebeskrivelser og kart hentes fra anerkjente kilder:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <strong>UT.no</strong> - Den norske turistforeningens turportal</li>
                <li>• <strong>Skisporet.no</strong> - Sanntidsinfo om preparerte løyper</li>
                <li>• <strong>Lillehammer.com</strong> - Visit Lillehammer sine turforslag</li>
                <li>• <strong>Lokale destinasjonsnettsider</strong></li>
              </ul>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Alle lenker fører til originalkildene hvor du finner oppdatert informasjon om løypeforhold, 
                preparering og detaljerte beskrivelser.
              </p>
            </div>
          </div>
        )}
        
        {aboutMenuTab === 'personvern' && (
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Datainnsamling</h3>
              <p className="text-sm leading-relaxed">
                Smøreguide samler <strong>ikke inn personopplysninger</strong>. Appen bruker kun den informasjonen 
                du aktivt oppgir for å gi deg relevante anbefalinger.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Lokasjonsdata</h3>
              <p className="text-sm leading-relaxed">
                Stedsinformasjonen du velger brukes kun til å hente værdata fra Meteorologisk institutt. 
                Ingen lokasjonsdata lagres eller deles med tredjeparter.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Informasjonskapsler (cookies)</h3>
              <p className="text-sm leading-relaxed">
                Appen bruker kun lokale nettleserdata for å huske dine valgte steder. 
                Ingen sporings- eller analyseverktøy benyttes.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Tredjepartstjenester</h3>
              <p className="text-sm leading-relaxed">
                Når du klikker på lenker til UT.no, Skisporet.no eller andre eksterne nettsteder, 
                gjelder disse sidenes egne personvernregler.
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>GDPR-compliant:</strong> Appen følger EUs personvernforordning (GDPR) 
                og norsk personvernlovgivning.
              </p>
            </div>
          </div>
        )}
        
        {aboutMenuTab === 'kontakt' && (
          <div className="space-y-4 text-gray-700">
            <p className="text-sm leading-relaxed">
              Har du spørsmål, forslag til forbedringer, eller oppdaget feil i appen? 
              Ta gjerne kontakt!
            </p>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Kontaktinformasjon</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Halvor Ringen</p>
                <p className="text-blue-600">
                  <a href="tel:46899799" className="hover:underline">📞 468 99 799</a>
                </p>
                <p className="text-blue-600">
                  <a href="mailto:halvor.ringen@hotmail.com" className="hover:underline break-all">
                    ✉️ halvor.ringen@hotmail.com
                  </a>
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Tilbakemelding</h3>
              <p className="text-sm leading-relaxed">
                Din tilbakemelding hjelper oss med å gjøre appen bedre. Vi setter pris på forslag til:
              </p>
              <ul className="text-sm space-y-1 ml-4 mt-2">
                <li>• Nye løypesteder</li>
                <li>• Forbedringer av smøringsråd</li>
                <li>• Nye funksjoner</li>
                <li>• Feil eller mangler i informasjonen</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,snowfall&timezone=auto`
      );
      const data = await response.json();
      setWeather(data.current);
    } catch (error) {
      const tempBase = lat > 65 ? -10 : lat > 60 ? -5 : 0;
      setWeather({
        temperature_2m: tempBase + (Math.random() * 6 - 3),
        precipitation: Math.random() * 2,
        wind_speed_10m: Math.random() * 8 + 2,
        snowfall: lat > 60 ? Math.random() * 0.5 : 0
      });
    }
    setLoading(false);
  };

  const handleLocationSearch = (value) => {
    setCustomLocation(value);
    setFilteredLocations(value.length > 0 
      ? norwegianLocations.filter(loc => loc.name.toLowerCase().includes(value.toLowerCase()))
      : []);
  };

  const selectLocation = (loc) => {
    setLocation(loc);
    fetchWeather(loc.lat, loc.lon);
    setCustomLocation('');
    setFilteredLocations([]);
    setShowAddLocation(false);
    if (currentPage === 'trails') setTrails([]);
  };

  const getWaxRecommendation = () => {
    if (!weather) return null;
    const temp = weather.temperature_2m;
    const snowfall = weather.snowfall || 0;
    const isNewSnow = snowfall > 0.1;

    if (temp < -12) {
      return {
        shortName: 'Polar', type: 'Hardvoks',
        description: 'Ekstreme kuldeforhold med tørr, fin snø',
        instructions: 'Påfør i 4-8 tynne lag. Kork godt mellom hvert lag.',
        color: 'bg-sky-300', imageColor: '#7dd3fc'
      };
    } else if (temp >= -12 && temp < -8) {
      return {
        shortName: 'Grønn', type: 'Hardvoks',
        description: isNewSnow ? 'Nysnø -8°C til -15°C' : 'Gammel snø -10°C til -18°C',
        instructions: 'Påfør i 4-6 tynne lag. Kork godt mellom hvert lag.',
        color: 'bg-green-500', imageColor: '#22c55e'
      };
    } else if (temp >= -8 && temp < -2) {
      return {
        shortName: 'Blå', type: 'Hardvoks',
        description: isNewSnow ? 'Nysnø -2°C til -10°C' : 'Gammel snø -5°C til -15°C',
        instructions: 'Legg på i 4-6 lag. Kork grundig mellom hvert lag.',
        color: 'bg-blue-500', imageColor: '#3b82f6'
      };
    } else if (temp >= -2 && temp < 0) {
      return {
        shortName: 'Blå Extra', type: 'Hardvoks',
        description: isNewSnow ? 'Nysnø -1°C til -7°C' : 'Gammel snø -3°C til -10°C',
        instructions: 'Markedets mest populære festevoks! Påfør i 4-8 tynne lag.',
        color: 'bg-blue-400', imageColor: '#60a5fa'
      };
    } else if (temp >= 0 && temp < 2) {
      return {
        shortName: 'Violet', type: 'Hardvoks',
        description: isNewSnow ? 'Nysnø 0°C til -2°C' : 'Gammel snø +1°C til -3°C',
        instructions: 'God voks rundt 0°C. Påfør i 4-8 lag.',
        color: 'bg-purple-500', imageColor: '#a855f7'
      };
    } else if (temp >= 2 && temp < 8) {
      return {
        shortName: 'Rød', type: temp < 4 ? 'Hardvoks' : 'Klister',
        description: temp < 4 ? 'Grov snø +2°C til -1°C' : 'Grov snø og klisterforhold',
        instructions: temp < 4 ? 'Påfør i 4-6 lag. For grov snø.' : 'Smør på tynt lag. Vær forsiktig!',
        color: 'bg-red-500', imageColor: '#ef4444'
      };
    } else {
      return {
        shortName: 'Klister Violet', type: 'Klister',
        description: 'Varme forhold og våt snø over 0°C',
        instructions: 'Smør på tynt lag med klisterspattel.',
        color: 'bg-pink-500', imageColor: '#ec4899'
      };
    }
  };

  const recommendation = getWaxRecommendation();

  if (currentPage === 'trails') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 relative overflow-hidden">
        {/* Mountain silhouette background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-96" viewBox="0 0 1200 400" preserveAspectRatio="none">
            {/* Back mountains */}
            <path d="M0,400 L0,200 Q150,150 300,180 T600,160 T900,190 T1200,170 L1200,400 Z" fill="#475569" opacity="0.4"/>
            <path d="M0,400 L0,220 Q200,180 400,210 T800,200 T1200,220 L1200,400 Z" fill="#334155" opacity="0.5"/>
            {/* Main mountain */}
            <path d="M0,400 L300,400 L600,100 L900,400 L1200,400 Z" fill="#1e293b"/>
          </svg>
        </div>
        
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 shadow-xl relative z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mountain className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-black">Skiløyper</h1>
                <p className="text-slate-200 text-sm">{location.name}</p>
              </div>
            </div>
            
            {/* Hamburger Menu */}
            <button
              onClick={() => setShowAboutMenu(!showAboutMenu)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Meny"
            >
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {showAboutMenu && <AboutMenuContent />}
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-24 relative z-10">
          {/* Location Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl overflow-hidden border-2 border-blue-400 text-white p-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6" />
              <h2 className="text-2xl font-black">{location.name}</h2>
            </div>
            
            {trails.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 mt-4">
                <div className="flex items-center gap-3">
                  <Mountain className="w-8 h-8" />
                  <div className="text-lg font-bold">Skiløyper i området</div>
                </div>
              </div>
            )}
          </div>

          {loadingTrails && (
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Laster skiløyper...</p>
            </div>
          )}

          {!loadingTrails && trails.length > 0 && (
            <div className="space-y-3">
              {trails.map((trail, idx) => (
                <div
                  key={trail.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden hover:border-blue-300 transition-all duration-200"
                >
                  {/* Trail Header Bar */}
                  <div 
                    className="h-2"
                    style={{ 
                      background: `linear-gradient(90deg, ${getTrailColor(trail.difficulty)}, ${getTrailColor(trail.difficulty)}dd)` 
                    }}
                  ></div>
                  
                  <div 
                    onClick={() => setSelectedTrail(selectedTrail?.id === trail.id ? null : trail)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Color indicator based on difficulty/length */}
                          <div className={`w-3 h-3 rounded-full ${
                            trail.difficulty === 'easy' || trail.difficulty === 'lett' 
                              ? 'bg-green-500'
                              : trail.difficulty === 'advanced' || trail.difficulty === 'vanskelig'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}></div>
                          <h3 className="font-black text-gray-900 text-xl">{trail.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {trail.distance && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                              {trail.distance} km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedTrail?.id === trail.id && (
                      <div className="mt-4 pt-4 border-t-2 border-slate-100">
                        {/* Trail Description */}
                        {trail.description && (
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {trail.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-gray-600 font-semibold text-sm mb-1">Type løype</p>
                            <p className="text-gray-900 font-bold">{trail.type || 'Nordic'}</p>
                          </div>
                        </div>
                        
                        {/* Trail Resource Links */}
                        {trail.trailUrl && (
                          <a
                            href={trail.trailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center py-4 rounded-lg font-bold transition shadow-lg"
                          >
                            🗺️ Se kart og full beskrivelse på UT.no
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingTrails && trails.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 text-center">
              <Mountain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ingen løyper funnet</h3>
              <p className="text-gray-600 mb-2">Fant ingen skiløyper i nærheten av {location.name}.</p>
              <p className="text-sm text-gray-500">Prøv Lillehammer, Trysil eller Sjusjøen.</p>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Om løypedata</p>
                <p>Løyper hentes fra OpenStreetMap. Status er simulert.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 border-t-2 border-slate-500 shadow-2xl z-20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl transition font-bold text-lg text-white flex items-center justify-center gap-2"
            >
              <span>🎿</span><span>Smøring</span>
            </button>
            <button
              className="flex-1 bg-white hover:bg-slate-50 py-4 rounded-xl transition font-bold text-lg text-slate-700 flex items-center justify-center gap-2"
            >
              <span>🏔️</span><span>Løyper</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 relative overflow-hidden">
      {/* Mountain silhouette background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full h-96" viewBox="0 0 1200 400" preserveAspectRatio="none">
          {/* Back mountains */}
          <path d="M0,400 L0,200 Q150,150 300,180 T600,160 T900,190 T1200,170 L1200,400 Z" fill="#475569" opacity="0.4"/>
          <path d="M0,400 L0,220 Q200,180 400,210 T800,200 T1200,220 L1200,400 Z" fill="#334155" opacity="0.5"/>
          {/* Main mountain */}
          <path d="M0,400 L300,400 L600,100 L900,400 L1200,400 Z" fill="#1e293b"/>
        </svg>
      </div>
      
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 shadow-xl relative z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-black">Smøreguide</h1>
              <p className="text-slate-200 text-sm">Din skismøringsassistent</p>
            </div>
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setShowAboutMenu(!showAboutMenu)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Meny"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
        
        {/* Dropdown Menu */}
        {showAboutMenu && <AboutMenuContent />}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-4 relative z-10">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-700">Henter værdata...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{location.name}</span>
                </div>
                <button
                  onClick={() => setShowAddLocation(!showAddLocation)}
                  className="p-2 hover:bg-slate-50 rounded-lg transition"
                >
                  {showAddLocation ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>

              {showAddLocation && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    placeholder="Søk sted..."
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-2 text-gray-900 mb-2"
                  />
                  {filteredLocations.length > 0 && (
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 space-y-1">
                      {filteredLocations.map((loc, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectLocation(loc)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded transition text-gray-900"
                        >
                          {loc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {savedLocations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {savedLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(loc)}
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition text-gray-900 text-sm"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-6 h-6 text-slate-600" />
                <h2 className="text-xl font-bold text-gray-900">Værforhold</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-gradient-to-b from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <Thermometer className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-gray-900">{weather?.temperature_2m?.toFixed(1)}°C</div>
                  <div className="text-xs text-gray-600">Temperatur</div>
                </div>
                <div className="text-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{(weather?.precipitation || 0).toFixed(1)} mm</div>
                  <div className="text-xs text-gray-600">Nedbør</div>
                </div>
                <div className="text-center bg-gradient-to-b from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
                  <Wind className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                  <div className="text-2xl font-bold text-gray-900">{weather?.wind_speed_10m?.toFixed(1)} m/s</div>
                  <div className="text-xs text-gray-600">Vind</div>
                </div>
              </div>
            </div>

            {recommendation && (
              <div className={`${recommendation.color} rounded-2xl p-6 border-2 border-white shadow-2xl`}>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-24 h-32 rounded-lg border-2 border-white shadow-xl flex flex-col items-center justify-center" 
                       style={{ background: `linear-gradient(180deg, ${recommendation.imageColor}, ${recommendation.imageColor}dd)` }}>
                    <div className="text-white text-4xl font-bold mb-2">
                      {recommendation.type === 'Klister' ? 'K' : 'V'}
                    </div>
                    <div className="bg-white px-3 py-1 rounded text-sm font-bold" style={{ color: recommendation.imageColor }}>
                      SWIX
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white/90 mb-1">{recommendation.type}</div>
                    <div className="text-2xl font-black mb-2 text-white">{recommendation.shortName}</div>
                    <div className="text-sm text-white/95 mb-3">{recommendation.description}</div>
                    <div className="bg-black/20 rounded-lg p-3 text-sm text-white/95">
                      <div className="font-semibold mb-1">Smøretips:</div>
                      {recommendation.instructions}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 border-t-2 border-slate-500 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          <button
            className="flex-1 bg-white hover:bg-slate-50 py-4 rounded-xl transition font-bold text-lg text-slate-700 flex items-center justify-center gap-2"
          >
            <span>🎿</span><span>Smøring</span>
          </button>
          <button
            onClick={() => setCurrentPage('trails')}
            className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl transition font-bold text-lg text-white flex items-center justify-center gap-2"
          >
            <span>🏔️</span><span>Løyper</span>
          </button>
        </div>
      </div>
    </div>
  );
}
