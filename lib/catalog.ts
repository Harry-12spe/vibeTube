export type ContentItem = {
  id: string;
  title: string;
  creator: string;
  avatar: string;
  image: string;
  duration: string;
  views: string;
  year: string;
  genre: string;
  type: "Movie" | "Video" | "Short Film" | "Series";
  rating?: string;
  progress?: number;
  description: string;
  badge?: string;
  streamUrl?: string;
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const hero: ContentItem = {
  id: "last-signal",
  title: "The Last Signal",
  creator: "VibeTube Originals",
  avatar: photo("photo-1527980965255-d3b416303d12"),
  image: photo("photo-1500534623283-312aade485b7"),
  duration: "2h 04m",
  views: "4.8M views",
  year: "2026",
  genre: "Sci-Fi • Thriller",
  type: "Movie",
  rating: "8.8",
  badge: "VIBETUBE ORIGINAL",
  description: "When a signal from deep space reaches a quiet coastal town, four strangers uncover a secret that was never meant to return.",
};

export const catalog: ContentItem[] = [
  hero,
  {
    id: "afterglow",
    title: "Afterglow",
    creator: "Mira Voss",
    avatar: photo("photo-1534528741775-53994a69daeb"),
    image: photo("photo-1519608487953-e999c86e7451"),
    duration: "1h 47m", views: "2.1M views", year: "2026", genre: "Drama • Mystery", type: "Movie", rating: "8.2",
    description: "A photographer follows a trail of light across a city that refuses to sleep.", badge: "NEW"
  },
  {
    id: "microcosm",
    title: "Microcosm",
    creator: "Frame By Frame",
    avatar: photo("photo-1500648767791-00dcc994a43e"),
    image: photo("photo-1531058020387-3be344556be6"),
    duration: "18:42", views: "983K views", year: "2026", genre: "Documentary", type: "Short Film", rating: "9.1",
    description: "Inside the miniature worlds that make impossible stories feel real.", badge: "STAFF PICK"
  },
  {
    id: "neon-circuit",
    title: "Neon Circuit",
    creator: "Dax Morrow",
    avatar: photo("photo-1506794778202-cad84cf45f1d"),
    image: photo("photo-1519608487953-e999c86e7451"),
    duration: "42:16", views: "1.6M views", year: "2026", genre: "Tech • Design", type: "Video",
    description: "The radical ideas powering tomorrow's urban life.", progress: 61
  },
  {
    id: "canvas-of-sound",
    title: "Canvas of Sound",
    creator: "Iris Celine",
    avatar: photo("photo-1544005313-94ddf0286df2"),
    image: photo("photo-1516280440614-37939bbacd81"),
    duration: "14:08", views: "760K views", year: "2026", genre: "Music", type: "Video",
    description: "A live session painted in color, rhythm and midnight blue.", progress: 24
  },
  {
    id: "soft-focus",
    title: "Soft Focus",
    creator: "New Wave Cinema",
    avatar: photo("photo-1494790108377-be9c29b29330"),
    image: photo("photo-1500530855697-b586d89ba3ee"),
    duration: "23:14", views: "452K views", year: "2025", genre: "Romance", type: "Short Film", rating: "8.6",
    description: "Two people meet in a city full of almosts.", badge: "FESTIVAL WINNER"
  },
  {
    id: "the-archivist",
    title: "The Archivist",
    creator: "VibeTube Originals",
    avatar: photo("photo-1560250097-0b93528c311a"),
    image: photo("photo-1489599849927-2ee91cede3ba"),
    duration: "8 Episodes", views: "3.2M views", year: "2026", genre: "Crime • Drama", type: "Series", rating: "8.9",
    description: "Every file has a story. This one has a body.", badge: "ORIGINAL"
  },
  {
    id: "motion-theory",
    title: "Motion Theory",
    creator: "Studio Arc",
    avatar: photo("photo-1535713875002-d1d0cf377fde"),
    image: photo("photo-1536240478700-b869070f9279"),
    duration: "28:03", views: "1.1M views", year: "2026", genre: "Education", type: "Video",
    description: "Why great interfaces feel alive before you notice why.", progress: 78
  },
  {
    id: "monsoon",
    title: "Monsoon",
    creator: "Kite & Key Films",
    avatar: photo("photo-1531123897727-8f129e1688ce"),
    image: photo("photo-1470770841072-f978cf4d019e"),
    duration: "1h 36m", views: "894K views", year: "2025", genre: "Adventure • Drama", type: "Movie", rating: "8.0",
    description: "One summer, one storm, one way home."
  },
  {
    id: "focus-mode",
    title: "Focus Mode: build anything",
    creator: "Dev Notes",
    avatar: photo("photo-1507003211169-0a1dd7228f2d"),
    image: photo("photo-1488590528505-98d2b5aba04b"),
    duration: "16:32", views: "639K views", year: "2026", genre: "Tech • Education", type: "Video",
    description: "A practical system for making more room for deep work."
  },
  {
    id: "paper-airplanes",
    title: "Paper Airplanes",
    creator: "Northlight Pictures",
    avatar: photo("photo-1508214751196-bcfd4ca60f91"),
    image: photo("photo-1499084732479-de2c02d45fc4"),
    duration: "11:22", views: "2.4M views", year: "2026", genre: "Animation", type: "Short Film", rating: "9.0",
    description: "An impossible flight through the notes we leave behind.", badge: "ORIGINAL"
  }
];

export const rows = [
  { title: "Continue watching", subtitle: "Pick up exactly where you left off", ids: ["neon-circuit", "canvas-of-sound", "motion-theory"] },
  { title: "Movies (Coming Soon)", subtitle: "The stories everyone is talking about", ids: ["afterglow", "microcosm", "the-archivist", "monsoon", "paper-airplanes"] },
  { title: "VibeTube Originals (Coming Soon)", subtitle: "Made to be felt on a bigger screen", ids: ["last-signal", "the-archivist", "paper-airplanes", "microcosm"] },
  { title: "Fresh from creators", subtitle: "New perspectives, right now", ids: ["focus-mode", "canvas-of-sound", "soft-focus", "motion-theory"] },
];

export const getById = (id: string) => catalog.find((item) => item.id === id) ?? hero;
