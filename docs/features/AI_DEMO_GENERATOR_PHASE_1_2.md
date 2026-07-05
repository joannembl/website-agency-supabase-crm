# AI Demo Generator — Phase 1 + 2

This feature adds AI-assisted demo website generation to the existing Build Demo Website flow.

## Phase 1 — AI Demo Content Generator

- Uses business information from the prospect and builder form.
- Generates a demo brief.
- Generates structured homepage copy.
- Falls back to a local generator if the Supabase Edge Function or OpenAI key is not configured.

## Phase 2 — AI HTML Generator

- Generates a complete responsive single-file `index.html`.
- Keeps the generated HTML editable and downloadable from the Build Demo modal.
- Saves generated output into the existing demo workflow.

## Files added

- `src/features/demos/aiDemoService.js`
- `src/features/demos/BuildDemoModal.jsx`
- `supabase/functions/generate-demo-site/index.ts`

## Setup for real AI

```bash
supabase functions deploy generate-demo-site
supabase secrets set OPENAI_API_KEY=sk-your-key
```

The local fallback works without an API key, so the app still builds and the feature remains usable during development.
