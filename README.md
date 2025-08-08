# Undertone

A personal reading tracker application built with Next.js and Supabase.

## 🚀 Getting Started

### Prerequisites

1. Node.js 16.8 or later
2. npm
3. Supabase account (https://supabase.com/)

### Environment Setup

1. Create a new file called `.env.local` in the root directory
2. Add the following environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database (from Supabase project settings > Database)
POSTGRES_URL=your-database-connection-string
```

### Supabase Setup

1. Create a new project in Supabase
2. Go to Project Settings > API to find your URL and anon/public key
3. Enable Email Auth in Authentication > Providers > Email
4. Set up your database tables by running the Prisma migrations (see below)

### Database Migrations

After setting up your `.env.local` with the database connection strings, run:

```bash
npx prisma migrate dev --name init
```

## 🛠 Development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Production Build

To create a production build:

```bash
npm run build
```

Then start the server with:

```bash
npm start
```

## 📚 Learn More

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:8888](http://localhost:8888) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
