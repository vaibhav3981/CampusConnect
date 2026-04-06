// ============================================================
// UNIVERSITY OF MESSINA — UNIMECONNECT MASTER DATA FILE
// Combined from UniMe International website + scraped sources
// Last updated: March 2026
// ============================================================

// ─────────────────────────────────────────
// 1. ACADEMIC CALENDAR
// ─────────────────────────────────────────
export const academicCalendar = {
  academicYear: '2025-2026',
  start: '1 October 2025',
  end: '30 September 2026',

  semesters: [
    { name: 'First Semester — Lessons',  start: '22 Sep 2025', end: '19 Dec 2025' },
    { name: 'Second Semester — Lessons', start: '23 Feb 2026', end: '29 May 2026' },
  ],

  examSessions: [
    { name: 'Winter Exam Session',        start: '13 Jan 2026', end: '20 Feb 2026' },
    { name: 'Spring Session (F.C.)',      start: '4 May 2026',  end: '8 May 2026'  },
    { name: 'Summer Exam Session',        start: '4 Jun 2026',  end: '31 Jul 2026' },
    { name: 'Autumn Exam Session',        start: '1 Sep 2026',  end: '30 Sep 2026' },
    { name: 'November Session (F.C.)',    start: '23 Nov 2026', end: '27 Nov 2026' },
  ],

  holidays: [
    { name: 'Ognissanti (All Saints)',         date: '1 Nov 2025'              },
    { name: 'Immacolata Concezione',           date: '8 Dec 2025'              },
    { name: 'Christmas Break',                 date: '24 Dec 2025 – 6 Jan 2026'},
    { name: 'Capodanno (New Year)',            date: '1 Jan 2026'              },
    { name: 'Epifania',                        date: '6 Jan 2026'              },
    { name: 'Easter Break',                    date: '2 Apr 2026 – 7 Apr 2026' },
    { name: 'Pasqua (Easter Sunday)',          date: '5 Apr 2026'              },
    { name: "Lunedì dell'Angelo",              date: '6 Apr 2026'              },
    { name: 'Anniversario Liberazione',        date: '25 Apr 2026'             },
    { name: 'Festa del Lavoro',                date: '1 May 2026'              },
    { name: 'Festa della Repubblica',          date: '2 Jun 2026'              },
    { name: 'Madonna della Lettera (Messina)', date: '3 Jun 2026'              },
    { name: 'Assunzione M.V.',                 date: '15 Aug 2026'             },
  ],
}

// ─────────────────────────────────────────
// 2. DEPARTMENTS
// ─────────────────────────────────────────
export const departments = [
  { id: 'MIFT',        name: 'Mathematics, Computer Science, Physics & Earth Science',        shortName: 'MIFT',        campus: 'Papardo',     color: '#3b82f6', url: 'https://www.mift.unime.it/'        },
  { id: 'DIECII',      name: 'Engineering — Civil, Electronic, Chemical, Industrial',         shortName: 'DIECII',      campus: 'Papardo',     color: '#f43f5e', url: 'https://www.diecii.unime.it/'      },
  { id: 'CHIBIOFARAM', name: 'Chemical, Biological, Pharmaceutical & Environmental Sciences', shortName: 'ChiBioFarAm', campus: 'Annunziata',  color: '#10b981', url: 'https://www.chibiofaram.unime.it/' },
  { id: 'DIMED',       name: 'Clinical & Experimental Medicine',                              shortName: 'DIMED',       campus: 'Policlinico', color: '#8b5cf6', url: 'https://www.dimed.unime.it/'       },
  { id: 'BIOMORF',     name: 'Biomedical, Dental & Morphological Sciences',                   shortName: 'BIOMORF',     campus: 'Policlinico', color: '#a855f7', url: 'https://www.biomorf.unime.it/'     },
  { id: 'DETEV',       name: 'Human Pathology in Adult & Developmental Age',                  shortName: 'DETEV',       campus: 'Policlinico', color: '#c084fc', url: 'https://www.detev.unime.it/'       },
  { id: 'ECONOMIA',    name: 'Economics',                                                     shortName: 'Economics',   campus: 'Central',     color: '#f59e0b', url: 'https://www.economia.unime.it/'    },
  { id: 'GIUR',        name: "Law — 'Salvatore Pugliatti' (Dept. of Excellence 2023–27)",     shortName: 'Law',         campus: 'Central',     color: '#06b6d4', url: 'https://www.giur.unime.it/'        },
  { id: 'SCIPOG',      name: 'Political & Juridical Sciences',                                shortName: 'SCIPOG',      campus: 'Central',     color: '#f97316', url: 'https://www.scipog.unime.it/'      },
  { id: 'COSPECS',     name: 'Cognitive Sciences, Education & Cultural Studies',              shortName: 'COSPECS',     campus: 'Annunziata',  color: '#ec4899', url: 'https://www.cospecs.unime.it/'     },
  { id: 'DICAM',       name: 'Ancient & Modern Civilisations',                                shortName: 'DICAM',       campus: 'Annunziata',  color: '#14b8a6', url: 'https://www.dicam.unime.it/'       },
  { id: 'VET',         name: 'Veterinary Sciences',                                           shortName: 'Veterinary',  campus: 'Annunziata',  color: '#84cc16', url: 'https://www.vet.unime.it/'         },
]

// ─────────────────────────────────────────
// 3. DEGREE PROGRAMMES
// ─────────────────────────────────────────
export const programmes = {
  bachelors: [
    { name: 'Data Analysis',                                dept: 'MIFT',        campus: 'Papardo',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Civil Engineering',                            dept: 'DIECII',      campus: 'Papardo',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Heritage Innovation Engineering',              dept: 'DIECII',      campus: 'Papardo',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Biomedical Engineering',                       dept: 'DIECII',      campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Electronic & Computer Engineering',            dept: 'DIECII',      campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Management Engineering',                       dept: 'DIECII',      campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Industrial Engineering',                       dept: 'DIECII',      campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Navigation Sciences & Technologies',           dept: 'DIECII',      campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Mathematics',                                  dept: 'MIFT',        campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Physics',                                      dept: 'MIFT',        campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Computer Science',                             dept: 'MIFT',        campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Geological Sciences',                          dept: 'MIFT',        campus: 'Papardo',     lang: 'Italian', years: 3, englishTaught: false },
    { name: 'Business Management',                          dept: 'ECONOMIA',    campus: 'Central',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'International Management',                     dept: 'ECONOMIA',    campus: 'Central',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Political Sciences & International Relations', dept: 'SCIPOG',      campus: 'Central',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Transnational & European Legal Studies',       dept: 'GIUR',        campus: 'Central',     lang: 'English', years: 3, englishTaught: true  },
    { name: 'Marine Biology & Blue Biotechnologies',        dept: 'CHIBIOFARAM', campus: 'Annunziata',  lang: 'English', years: 3, englishTaught: true  },
    { name: 'Cognitive Science',                            dept: 'COSPECS',     campus: 'Annunziata',  lang: 'Italian', years: 3, englishTaught: false },
  ],

  masters: [
    { name: 'Data Science',                                       dept: 'MIFT',     campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Engineering in Computer Science',                    dept: 'DIECII',   campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Civil Engineering',                                  dept: 'DIECII',   campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Sustainable Engineering for Water-related Risks',    dept: 'DIECII',   campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Geophysical Sciences for Seismic Risk',              dept: 'MIFT',     campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Physics: Materials',                                 dept: 'MIFT',     campus: 'Papardo',    lang: 'English', years: 2, englishTaught: true  },
    { name: 'Mechanical Engineering',                             dept: 'DIECII',   campus: 'Papardo',    lang: 'Italian', years: 2, englishTaught: false },
    { name: 'Management Engineering',                             dept: 'DIECII',   campus: 'Papardo',    lang: 'Italian', years: 2, englishTaught: false },
    { name: 'Bioengineering',                                     dept: 'DIECII',   campus: 'Papardo',    lang: 'Italian', years: 2, englishTaught: false },
    { name: 'Maritime & Aeronautical Transport Logistics',        dept: 'DIECII',   campus: 'Papardo',    lang: 'Italian', years: 2, englishTaught: false },
    { name: 'Electronic Engineering for Industry',                dept: 'DIECII',   campus: 'Papardo',    lang: 'Italian', years: 2, englishTaught: false },
    { name: 'Cognitive Science',                                  dept: 'COSPECS',  campus: 'Annunziata', lang: 'English', years: 2, englishTaught: true  },
    { name: 'International Management',                           dept: 'ECONOMIA', campus: 'Central',    lang: 'English', years: 2, englishTaught: true  },
  ],

  singleCycle: [
    { name: 'Medicine & Surgery', dept: 'DIMED',       campus: 'Policlinico', lang: 'English', years: 6, englishTaught: true  },
    { name: 'Law',                dept: 'GIUR',         campus: 'Central',    lang: 'Italian', years: 5, englishTaught: false },
    { name: 'Pharmacy',           dept: 'CHIBIOFARAM',  campus: 'Annunziata', lang: 'Italian', years: 5, englishTaught: false },
    { name: 'Veterinary Medicine',dept: 'VET',          campus: 'Annunziata', lang: 'Italian', years: 5, englishTaught: false },
  ],

  phd: [
    { name: 'Computer Science & Mathematics',   dept: 'MIFT',        campus: 'Papardo'     },
    { name: 'Civil Engineering & Architecture', dept: 'DIECII',      campus: 'Papardo'     },
    { name: 'Physics & Earth Science',          dept: 'MIFT',        campus: 'Papardo'     },
    { name: 'Clinical Medicine',                dept: 'DIMED',       campus: 'Policlinico' },
    { name: 'Biomedical Sciences',              dept: 'BIOMORF',     campus: 'Policlinico' },
    { name: 'Chemical Sciences',                dept: 'CHIBIOFARAM', campus: 'Annunziata'  },
    { name: 'Legal Sciences',                   dept: 'GIUR',        campus: 'Central'     },
    { name: 'Economic & Business Sciences',     dept: 'ECONOMIA',    campus: 'Central'     },
    { name: 'Cognitive Sciences & Education',   dept: 'COSPECS',     campus: 'Annunziata'  },
    { name: 'Veterinary Sciences',              dept: 'VET',         campus: 'Annunziata'  },
  ],
}

// ─────────────────────────────────────────
// 4. CANTEEN / MENSA
// ─────────────────────────────────────────
export const mensaLocations = [
  { id: 'mensa_papardo',    name: 'Mensa Papardo Campus', campus: 'Papardo',    address: 'C/da Papardo, Ganzirri',  lat: 38.2621,              lng: 15.5976,              hours: { lunch: '12:00 – 14:30', dinner: null              }, days: 'Mon – Fri',   price: '€2.50 full meal', app: 'ERSU Messina App' },
  { id: 'mensa_central',    name: 'Mensa Ghibellina',     campus: 'Central',    address: 'Via Ghibellina, 146',     lat: 38.1856870151483,     lng: 15.552156923335287,   hours: { lunch: '12:00 – 14:30', dinner: '19:00 – 20:30'   }, days: '7 days/week', price: '€2.50 full meal', app: 'ERSU Messina App' },
  { id: 'mensa_annunziata', name: 'Mensa Annunziata',     campus: 'Annunziata', address: 'C/da Battaglia',          lat: 38.229626929658195,   lng: 15.550354585170671,   hours: { lunch: '12:00 – 14:30', dinner: '19:00 – 20:30'   }, days: '7 days/week', price: '€2.50 full meal', app: 'ERSU Messina App' },
  { id: 'mensa_policlinico',name: 'Mensa Policlinico',    campus: 'Policlinico',address: 'Via Consolare Valeria',   lat: 38.16389991614373,    lng: 15.536213185374976,   hours: { lunch: '12:00 – 14:30', dinner: null              }, days: 'Mon – Fri',   price: '€2.50 full meal', app: 'ERSU Messina App' },
]

// ─────────────────────────────────────────
// 5. RESIDENCES
// ─────────────────────────────────────────
export const residences = [
  { id: 'ersu_papardo',    name: 'ERSU Residence Papardo',    campus: 'Papardo',    lat: 38.2629,              lng: 15.5957,              description: 'Student residential halls managed by ERSU. On-site laundry, common rooms, Wi-Fi.' },
  { id: 'ersu_annunziata', name: 'ERSU Residence Annunziata', campus: 'Annunziata', lat: 38.22941956651129,    lng: 15.550401989991068,   description: 'Student halls near the Annunziata campus.' },
  { id: 'ersu_gravitelli', name: 'Gravitelli Residence',      campus: 'Central',    lat: 38.19493050332314,    lng: 15.539964971602894,   description: 'City-centre student housing near the main university buildings.' },
]

// ─────────────────────────────────────────
// 6. LIBRARIES (SBA)
// ─────────────────────────────────────────
export const libraries = [
  { name: 'SBA — Polo Papardo',     campus: 'Papardo',     lat: 38.2612,              lng: 15.5972,              url: 'https://sba.unime.it' },
  { name: 'SBA — Polo Annunziata',  campus: 'Annunziata',  lat: 38.23092899514196,    lng: 15.551055572982621,   url: 'https://sba.unime.it' },
  { name: 'SBA — Polo Centrale',    campus: 'Central',     lat: 38.217223778333306,   lng: 15.547109750661265,   url: 'https://sba.unime.it' },
  { name: 'SBA — Polo Policlinico', campus: 'Policlinico', lat: 38.165430479791375,   lng: 15.538034390163299,   url: 'https://sba.unime.it' },
]

// ─────────────────────────────────────────
// 7. KEY SERVICE LINKS
// ─────────────────────────────────────────
export const serviceLinks = [
  { id: 'esse3',     name: 'ESSE3',      description: 'Book exams, check grades, manage your academic career',      url: 'https://unime.esse3.cineca.it/', icon: 'GraduationCap',   color: '#3b82f6' },
  { id: 'email',     name: 'Email',      description: 'codicefiscale@studenti.unime.it — Outlook',                  url: 'https://outlook.office.com/',    icon: 'Mail',            color: '#06b6d4' },
  { id: 'ersu_app',  name: 'ERSU App',   description: 'Canteen balance, meal booking, residence info',              url: 'https://www.ersumessina.it/',    icon: 'UtensilsCrossed', color: '#f59e0b' },
  { id: 'sba',       name: 'SBA',        description: 'Book study rooms, access IEEE, Scopus, Web of Science',      url: 'https://sba.unime.it/',          icon: 'BookOpen',        color: '#8b5cf6' },
  { id: 'moodle',    name: 'Moodle',     description: 'Course materials, assignments, professor uploads',            url: 'https://moodle.unime.it/',       icon: 'Monitor',         color: '#10b981' },
  { id: 'esn',       name: 'ESN',        description: 'Erasmus student network — events, accommodation, buddies',   url: 'https://esnmessina.it/',         icon: 'Globe',           color: '#f43f5e' },
  { id: 'transport', name: 'Bus Pass',   description: '€30/year student discounted pass — request via ESSE3',       url: 'https://unime.esse3.cineca.it/', icon: 'Bus',             color: '#f97316' },
  { id: 'apply',     name: 'Apply',      description: 'Applications for international students',                    url: 'https://unime.gomovein.com/',    icon: 'FileText',        color: '#ec4899' },
]

// ─────────────────────────────────────────
// 8. CAMPUSES
// ─────────────────────────────────────────
export const campuses = [
  { id: 'papardo',     name: 'Papardo Campus',         center: { lat: 38.2605, lng: 15.5977 }, defaultZoom: 17, description: 'Engineering, Mathematics, Physics, Computer Science, Earth Sciences',       departments: ['MIFT', 'DIECII']                    },
  { id: 'annunziata',  name: 'Annunziata Campus',      center: { lat: 38.2295, lng: 15.5505 }, defaultZoom: 16, description: 'Chemistry, Biology, Pharmacy, Veterinary, Cognitive Sciences, Humanities', departments: ['CHIBIOFARAM', 'VET', 'COSPECS', 'DICAM'] },
  { id: 'central',     name: 'Central Campus',         center: { lat: 38.1894, lng: 15.5535 }, defaultZoom: 16, description: 'Law, Economics, Political Sciences — city centre',                         departments: ['GIUR', 'ECONOMIA', 'SCIPOG']        },
  { id: 'policlinico', name: 'Policlinico G. Martino', center: { lat: 38.1657, lng: 15.5372 }, defaultZoom: 16, description: 'Medicine, Dentistry, Biomedical Sciences',                                 departments: ['DIMED', 'BIOMORF', 'DETEV']         },
]

// ─────────────────────────────────────────
// 9. PROGRAMME DROPDOWN OPTIONS
// ─────────────────────────────────────────
export const programmeOptions = {
  bachelors: [
    'Biomedical Engineering',
    'Business Management',
    'Civil Engineering',
    'Cognitive Science',
    'Computer Science',
    'Data Analysis',
    'Electronic & Computer Engineering',
    'Geological Sciences',
    'Heritage Innovation Engineering',
    'Industrial Engineering',
    'International Management',
    'Management Engineering',
    'Marine Biology & Blue Biotechnologies',
    'Mathematics',
    'Navigation Sciences & Technologies',
    'Physics',
    'Political Sciences & International Relations',
    'Transnational & European Legal Studies',
  ],

  masters: [
    'Bioengineering',
    'Civil Engineering',
    'Cognitive Science',
    'Data Science',
    'Electronic Engineering for Industry',
    'Engineering in Computer Science',
    'Geophysical Sciences for Seismic Risk',
    'International Management',
    'Management Engineering',
    'Maritime & Aeronautical Transport Logistics',
    'Mechanical Engineering',
    'Physics: Materials',
    'Sustainable Engineering for Water-related Risks',
  ],

  singleCycle: [
    'Law',
    'Medicine & Surgery',
    'Pharmacy',
    'Veterinary Medicine',
  ],

  phd: [
    'Biomedical Sciences',
    'Chemical Sciences',
    'Civil Engineering & Architecture',
    'Clinical Medicine',
    'Cognitive Sciences & Education',
    'Computer Science & Mathematics',
    'Economic & Business Sciences',
    'Legal Sciences',
    'Physics & Earth Science',
    'Veterinary Sciences',
  ],
}