import { PrismaClient, Role, VideoKind } from "@prisma/client";

const prisma = new PrismaClient();
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

async function main() {
  await prisma.category.createMany({ data: [
    ["Sci-Fi", "sci-fi"], ["Drama", "drama"], ["Technology", "technology"], ["Music", "music"], ["Animation", "animation"], ["Documentary", "documentary"]
  ].map(([name, slug]) => ({ name, slug })), skipDuplicates: true });
  await prisma.genre.createMany({ data: ["Thriller", "Romance", "Education", "Adventure", "Design", "Crime"].map((name) => ({ name, slug: name.toLowerCase() })), skipDuplicates: true });

  const people = [
    ["maya@vibetube.local", "Maya Rao", "mayarao", Role.USER],
    ["mira@vibetube.local", "Mira Voss", "miravoss", Role.CREATOR],
    ["dax@vibetube.local", "Dax Morrow", "daxmorrow", Role.CREATOR],
    ["iris@vibetube.local", "Iris Celine", "irisceline", Role.CREATOR],
    ["arc@vibetube.local", "Studio Arc", "studioarc", Role.CREATOR],
    ["northlight@vibetube.local", "Northlight Pictures", "northlight", Role.CREATOR]
  ] as const;
  const users = await Promise.all(people.map(async ([email, displayName, username, role], index) => prisma.user.upsert({
    where: { email }, update: {}, create: { email, role, passwordHash: "local-demo-only", profile: { create: { displayName, username, bio: "A local VibeTube demo creator.", avatarUrl: image(["photo-1494790108377-be9c29b29330", "photo-1534528741775-53994a69daeb", "photo-1506794778202-cad84cf45f1d", "photo-1544005313-94ddf0286df2", "photo-1535713875002-d1d0cf377fde", "photo-1508214751196-bcfd4ca60f91"][index]) } } }
  })));
  const [viewer, ...creators] = users;
  const categories = await prisma.category.findMany();
  const categoryId = (name: string) => categories.find((category) => category.name === name)?.id;

  const videoSeed = [
    ["neon-circuit", "Neon Circuit", "Technology", "The radical ideas powering tomorrow's urban life.", "photo-1519608487953-e999c86e7451"],
    ["canvas-of-sound", "Canvas of Sound", "Music", "A live session painted in color, rhythm and midnight blue.", "photo-1516280440614-37939bbacd81"],
    ["motion-theory", "Motion Theory", "Technology", "Why great interfaces feel alive before you notice why.", "photo-1536240478700-b869070f9279"],
    ["focus-mode", "Focus Mode: build anything", "Technology", "A practical system for making more room for deep work.", "photo-1488590528505-98d2b5aba04b"],
    ["daybreak", "Daybreak: a tiny concert", "Music", "A sunrise performance from a room full of friends.", "photo-1524368535928-5b5e00ddc76b"],
    ["future-of-cinema", "The Future of Cinema", "Documentary", "New tools, old stories, and the next generation of filmmakers.", "photo-1485846234645-a62644f84728"],
    ["unseen-cities", "Unseen Cities", "Documentary", "A walking tour of spaces that never make the guidebook.", "photo-1449824913935-59a10b8d2000"],
    ["signal-lab", "Signal Lab", "Technology", "Building a radio telescope from first principles.", "photo-1500534623283-312aade485b7"],
    ["color-grading", "Color Grading a Dream", "Technology", "An editor explains how color becomes emotion.", "photo-1516035069371-29a1b244cc32"],
    ["one-take", "One Take, No Safety Net", "Documentary", "The thrill and terror of making a scene in one shot.", "photo-1489599849927-2ee91cede3ba"]
  ] as const;
  const shortSeed = [
    ["microcosm", "Microcosm", "Documentary", "Inside miniature worlds that make impossible stories feel real.", "photo-1531058020387-3be344556be6"],
    ["soft-focus", "Soft Focus", "Drama", "Two people meet in a city full of almosts.", "photo-1500530855697-b586d89ba3ee"],
    ["paper-airplanes", "Paper Airplanes", "Animation", "An impossible flight through the notes we leave behind.", "photo-1499084732479-de2c02d45fc4"],
    ["the-smallest-room", "The Smallest Room", "Drama", "A student film about a final day before goodbye.", "photo-1497366754035-f200968a6e72"],
    ["midnight-laundry", "Midnight Laundry", "Drama", "A tiny story told between washes.", "photo-1517245386807-bb43f82c33c4"]
  ] as const;
  const allVideos = [...videoSeed.map((item) => [...item, VideoKind.VIDEO] as const), ...shortSeed.map((item) => [...item, VideoKind.SHORT_FILM] as const)];
  await Promise.all(allVideos.map(([slug, title, category, description, thumbnailUrl, kind], index) => prisma.video.upsert({
    where: { slug }, update: {}, create: { slug, title, description, thumbnailUrl: image(thumbnailUrl), storageKey: `demo/${slug}.mp4`, streamUrl: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4", kind, categoryId: categoryId(category), creatorId: creators[index % creators.length].id, durationSecs: kind === VideoKind.SHORT_FILM ? 900 + index * 41 : 720 + index * 67, publishedAt: new Date(Date.now() - index * 86400000), viewCount: 12000 * (index + 3), likeCount: 600 * (index + 2), trendingScore: 100 - index }
  })));

  const movies = [
    ["the-last-signal", "The Last Signal", "Sci-Fi", 2026, 8.8, "photo-1500534623283-312aade485b7"],
    ["afterglow", "Afterglow", "Drama", 2026, 8.2, "photo-1519608487953-e999c86e7451"],
    ["monsoon", "Monsoon", "Drama", 2025, 8.0, "photo-1470770841072-f978cf4d019e"],
    ["the-archivist", "The Archivist", "Drama", 2026, 8.9, "photo-1489599849927-2ee91cede3ba"],
    ["still-water", "Still Water", "Documentary", 2025, 7.9, "photo-1439853949127-fa647821eba0"]
  ] as const;
  await Promise.all(movies.map(([slug, title, category, releaseYear, rating, poster]) => prisma.movie.upsert({ where: { slug }, update: {}, create: { slug, title, description: `A VibeTube feature presentation: ${title}.`, categoryId: categoryId(category), releaseYear, rating, durationSecs: 6780, posterUrl: image(poster), backdropUrl: image(poster), featured: slug === "the-last-signal" } })));

  const videos = await prisma.video.findMany({ orderBy: { createdAt: "asc" } });
  await prisma.videoLike.createMany({ data: videos.slice(0, 5).map((video) => ({ videoId: video.id, userId: viewer.id })), skipDuplicates: true });
  await prisma.watchHistory.upsert({ where: { userId_videoId: { userId: viewer.id, videoId: videos[0].id } }, update: { lastPosition: 2240, completionRate: .61 }, create: { userId: viewer.id, videoId: videos[0].id, lastPosition: 2240, completionRate: .61 } });
  const playlist = await prisma.playlist.upsert({ where: { id: "local-watch-later" }, update: {}, create: { id: "local-watch-later", userId: viewer.id, title: "Watch Later", description: "Your saved VibeTube queue" } });
  await prisma.playlistVideo.createMany({ data: videos.slice(0, 3).map((video, position) => ({ playlistId: playlist.id, videoId: video.id, position })), skipDuplicates: true });
  await prisma.comment.createMany({ data: [{ videoId: videos[0].id, authorId: viewer.id, body: "This belongs on the biggest screen you can find." }, { videoId: videos[1].id, authorId: creators[0].id, body: "Thanks for watching and supporting independent stories." }], skipDuplicates: true });
  await Promise.all(creators.map((creator) => prisma.creatorAnalytics.upsert({ where: { userId: creator.id }, update: {}, create: { userId: creator.id, totalViews: 48000, watchTimeSecs: 340000, subscriberCount: 1200, likesCount: 4900, commentsCount: 660 } })));
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
