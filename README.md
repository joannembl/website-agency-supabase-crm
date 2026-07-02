# Website Agency Supabase CRM

A simple Supabase-backed CRM for your local website agency.

## Setup

1. Create a free Supabase project.
2. Open Supabase > SQL Editor.
3. Paste and run `supabase-schema.sql`.
4. Copy `.env.example` to `.env`.
5. Add your Supabase project URL and anon key.
6. Run:

```bash
npm install
npm run dev
```

## Deploy

Deploy to Netlify or Cloudflare Pages.

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Add environment variables in your hosting dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Notes

The included RLS policies are permissive for easy solo setup. Before sharing publicly or adding users, replace them with authenticated-user policies.
