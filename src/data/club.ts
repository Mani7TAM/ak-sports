// Club details used across the site. Anything left as '' (or an empty list) is hidden
// until you fill it in. Lines marked TODO are placeholders.
export const club = {
  name: 'AK Sports Club',
  shortName: 'AK',
  tagline: 'Weekend cricket, played with heart.', // TODO
  // Used for search results and WhatsApp/social link previews.
  description:
    'AK Sports Club is an amateur cricket club. Fixtures, results, the squad and how to join.', // TODO
  founded: 2020, // TODO
  city: '', // TODO e.g. 'Chennai'

  // About page, one paragraph per entry.
  story: [
    "Write the club's story here: how it started, who founded it and when.", // TODO
    'Then what the club is about today: the tournaments you play, the kind of cricket, the people.', // TODO
  ],
  // e.g. { year: 2025, title: 'Winners, Some Premier League' }
  achievements: [] as { year: number; title: string }[],
  committee: [
    { role: 'Captain', name: 'Your Name' }, // TODO
  ],

  ground: {
    name: 'Home ground', // TODO
    address: '', // TODO
    mapsUrl: '', // Google Maps → Share → Copy link
    mapEmbedUrl: '', // Google Maps → Share → Embed a map → the iframe's src
  },
  practice: [
    { days: 'Saturday & Sunday', time: '6:00 – 9:00 AM' }, // TODO
  ],

  contact: {
    whatsapp: '', // country code + number, digits only, e.g. '919876543210'
    email: '',
  },
  links: {
    cricheroes: '', // team profile URL
    instagram: '',
    facebook: '',
    youtube: '',
  },
  // Google Form → Send → <> → the iframe's src (ends with ?embedded=true)
  joinFormUrl: '',

  // Match times in matches.json are local times at this offset.
  timeZone: 'Asia/Kolkata',
  utcOffset: '+05:30',
};

export const whatsappLink = (message: string) =>
  club.contact.whatsapp
    ? `https://wa.me/${club.contact.whatsapp}?text=${encodeURIComponent(message)}`
    : '';
