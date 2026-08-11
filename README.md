# VibeTube

VibeTube is a premium, dark-first streaming experience that pairs an OTT-style discovery surface with creator-community interactions. It is built as a college-project-ready Next.js application, with an immediately usable local UI and a production-oriented PostgreSQL/Prisma data model.

## Included experience

- Cinematic Netflix-inspired hero, content shelves, responsive navigation, and VibeTube Originals promotion
- Searchable catalog, content detail player, HTML5 playback controls, resume cue, My List, likes, subscriptions, sharing/download affordances, and live comment posting
- Mobile bottom navigation and tablet/desktop responsive layouts
- PostgreSQL Prisma schema for users, profiles, content, movies, episodes, social features, playlists, history/progress, notifications, reports, analytics, and search history
- Zod metadata/file validation plus a storage-provider interface. The UI works locally without cloud configuration; connect R2/S3/Supabase by replacing the provider implementation.
- Demo seed with 15 creator videos (including 5 short films), 5 movies, 5 creators, watch history, likes, a playlist, and comments

## Tech stack

Next.js 15 App Router, TypeScript, React 19, Framer Motion, Lucide React, Prisma ORM, PostgreSQL, and Zod. The UI intentionally uses framework-independent CSS to make the first demo fast and portable; its components are ready to be migrated to a shadcn/Tailwind design system if desired.

## Run locally

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`. The cloud storage and Google OAuth variables can be left blank for the demo UI.
2. Install packages:

   ```bash
   npm install
   ```

3. Generate/migrate and seed the database:

   ```bash
   npx prisma generate
   npm run db:migrate
   npm run db:seed
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run linting |
| `npm run db:migrate` | Create/apply Prisma migrations |
| `npm run db:seed` | Load realistic local demo content |

## Storage configuration

Video bytes are never stored in PostgreSQL. `Video.storageKey` holds an object key and `Video.streamUrl` holds the delivery URL. `lib/storage/provider.ts` is the boundary for a Cloudflare R2, Amazon S3, or Supabase Storage implementation. Keep all credentials server-only in `.env`; issue signed URLs only from Route Handlers or Server Actions.

## Authentication and deployment notes

The schema includes email/password credentials and the `USER`, `CREATOR`, and `ADMIN` roles. Add an auth adapter (such as Auth.js) around this model, hash passwords server-side, and enforce roles in server actions/route handlers. For deployment, provision PostgreSQL, set the environment variables in your host, configure the storage provider/CDN, run migrations, and deploy normally to Vercel or another Node-compatible host.
