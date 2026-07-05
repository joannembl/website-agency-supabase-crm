import { supabase } from '../../supabase'

function splitLines(value = '') {
  return String(value || '')
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function titleCase(value = '') {
  return String(value || '')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function escapeHtml(value = '') {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function normalizeDemoInput({ lead = {}, buildForm = {}, buildBrief = '' } = {}) {
  const businessName = buildForm.business_name || lead.business_name || 'Local Business'
  const category = buildForm.category || lead.category || 'Local Service Business'
  const city = buildForm.city || lead.city || 'your area'
  const services = splitLines(buildForm.services || buildForm.service_list || lead.services || '')
  const finalServices = services.length ? services : [
    `${titleCase(category)} services`,
    'Fast quotes and friendly service',
    'Local support from a trusted team'
  ]

  return {
    businessName,
    category,
    city,
    services: finalServices,
    tone: buildForm.tone || 'friendly, confident, local, professional',
    style: buildForm.style || buildForm.visual_style || 'clean, modern, trustworthy, mobile-first',
    primaryColor: buildForm.primary_color || buildForm.brand_color || '#111827',
    accentColor: buildForm.accent_color || '#2563eb',
    cta: buildForm.cta || buildForm.primary_cta || 'Request a Quote',
    phone: buildForm.phone || lead.phone || '',
    email: buildForm.email || lead.email || '',
    instagram: buildForm.instagram_handle || lead.instagram_handle || '',
    notes: buildForm.notes || lead.notes || '',
    hours: buildForm.business_hours || buildForm.hours || '',
    buildBrief
  }
}

export function buildLocalDemoContent(input) {
  const data = normalizeDemoInput(input)
  const serviceText = data.services.slice(0, 3)
  const headline = data.headline || `${data.businessName} — ${titleCase(data.category)} in ${data.city}`
  const subheadline = data.subheadline || `A fast, mobile-friendly demo website built to help ${data.businessName} look professional, earn trust, and turn visitors into calls.`

  return {
    provider: 'local-fallback',
    briefMarkdown: `# AI Demo Brief\n\n## Business\n${data.businessName}\n\n## Market\n${data.category} in ${data.city}\n\n## Tone\n${data.tone}\n\n## Style\n${data.style}\n\n## Primary CTA\n${data.cta}\n\n## Services\n${data.services.map(service => `- ${service}`).join('\n')}\n\n## Notes\n${data.notes || 'No extra notes provided.'}`,
    siteCopy: {
      hero: {
        headline,
        subheadline,
        cta: data.cta
      },
      intro: `${data.businessName} helps customers in ${data.city} get reliable ${data.category.toLowerCase()} support without the back-and-forth. This demo emphasizes clear services, fast contact, and local credibility.`,
      services: data.services.map(service => ({
        title: service,
        description: `Professional ${service.toLowerCase()} designed for local customers who want a simple, trustworthy experience.`
      })),
      about: `${data.businessName} is positioned as a trusted local ${data.category.toLowerCase()} serving ${data.city}. The site focuses on trust, clear contact options, and a simple path to request service.`,
      testimonials: [
        { quote: 'Quick response, professional service, and easy to work with.', name: 'Local Customer' },
        { quote: 'The whole process was smooth from the first message.', name: 'Happy Client' },
        { quote: 'Exactly what I needed and done with care.', name: 'Repeat Customer' }
      ],
      contact: {
        phone: data.phone,
        email: data.email,
        instagram: data.instagram,
        city: data.city
      }
    },
    html: buildDemoHtml(data, { headline, subheadline, serviceText })
  }
}

export function buildDemoHtml(data, copy = {}) {
  const services = data.services.map(service => `
        <article class="card">
          <h3>${escapeHtml(service)}</h3>
          <p>Clear, reliable ${escapeHtml(service.toLowerCase())} for customers in ${escapeHtml(data.city)}.</p>
        </article>`).join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.businessName)} | ${escapeHtml(data.category)} in ${escapeHtml(data.city)}</title>
  <meta name="description" content="${escapeHtml(copy.subheadline || '')}" />
  <style>
    :root { --ink:#111827; --muted:#64748b; --line:#e5e7eb; --brand:${escapeHtml(data.primaryColor)}; --accent:${escapeHtml(data.accentColor)}; --bg:#f8fafc; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color:var(--ink); background:white; }
    a { color: inherit; text-decoration: none; }
    header { position: sticky; top:0; z-index: 10; background:rgba(255,255,255,.92); backdrop-filter: blur(16px); border-bottom:1px solid var(--line); }
    .nav { max-width:1120px; margin:auto; padding:18px 22px; display:flex; justify-content:space-between; align-items:center; gap:18px; }
    .brand { font-weight:900; letter-spacing:-.04em; }
    .nav a.cta, .button { display:inline-flex; align-items:center; justify-content:center; border-radius:999px; padding:12px 18px; background:var(--brand); color:white; font-weight:800; box-shadow: 0 12px 28px rgba(15,23,42,.18); }
    .hero { background:linear-gradient(135deg, var(--bg), #fff 48%, rgba(37,99,235,.08)); }
    .hero-inner { max-width:1120px; margin:auto; padding:86px 22px 72px; display:grid; grid-template-columns: 1.2fr .8fr; gap:42px; align-items:center; }
    .eyebrow { display:inline-flex; padding:8px 12px; border:1px solid var(--line); border-radius:999px; font-size:13px; font-weight:800; color:var(--accent); background:white; }
    h1 { margin:18px 0; font-size:clamp(40px, 7vw, 76px); line-height:.92; letter-spacing:-.07em; }
    .lead { font-size:20px; line-height:1.6; color:var(--muted); max-width:660px; }
    .hero-card { border:1px solid var(--line); border-radius:30px; padding:28px; background:white; box-shadow:0 30px 80px rgba(15,23,42,.12); }
    .hero-card strong { display:block; font-size:44px; letter-spacing:-.06em; }
    .hero-card span { color:var(--muted); }
    section { max-width:1120px; margin:auto; padding:78px 22px; }
    .section-head { max-width:720px; margin-bottom:28px; }
    h2 { font-size:clamp(30px, 5vw, 50px); margin:0 0 12px; letter-spacing:-.05em; }
    .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; }
    .card { border:1px solid var(--line); border-radius:24px; padding:24px; background:white; box-shadow:0 12px 30px rgba(15,23,42,.06); }
    .card h3 { margin:0 0 10px; font-size:20px; }
    .card p, .section-head p, .about p { color:var(--muted); line-height:1.65; }
    .about { display:grid; grid-template-columns:.85fr 1.15fr; gap:28px; align-items:start; }
    .contact { border-radius:30px; background:var(--ink); color:white; padding:42px; display:flex; justify-content:space-between; gap:24px; align-items:center; }
    .contact p { color:#cbd5e1; }
    footer { padding:28px 22px; border-top:1px solid var(--line); color:var(--muted); text-align:center; }
    @media (max-width: 840px) { .hero-inner, .about { grid-template-columns:1fr; } .grid { grid-template-columns:1fr; } .contact { flex-direction:column; align-items:flex-start; } }
  </style>
</head>
<body>
  <header>
    <nav class="nav">
      <div class="brand">${escapeHtml(data.businessName)}</div>
      <a class="cta" href="#contact">${escapeHtml(data.cta)}</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <span class="eyebrow">${escapeHtml(data.category)} · ${escapeHtml(data.city)}</span>
          <h1>${escapeHtml(copy.headline || `${data.businessName} in ${data.city}`)}</h1>
          <p class="lead">${escapeHtml(copy.subheadline || '')}</p>
          <a class="button" href="#contact">${escapeHtml(data.cta)}</a>
        </div>
        <aside class="hero-card">
          <strong>Demo</strong>
          <span>Preview site generated from the business details entered in Agency OS.</span>
        </aside>
      </div>
    </section>
    <section>
      <div class="section-head">
        <h2>Services built around local customers.</h2>
        <p>Simple, clear service sections make it easy for visitors to understand what you offer and take action.</p>
      </div>
      <div class="grid">${services}</div>
    </section>
    <section class="about">
      <div class="section-head">
        <h2>Why choose ${escapeHtml(data.businessName)}?</h2>
      </div>
      <div class="card">
        <p>${escapeHtml(data.businessName)} is positioned as a trusted local ${escapeHtml(data.category.toLowerCase())} serving ${escapeHtml(data.city)}. This demo focuses on credibility, clear contact options, and a strong call to action.</p>
        <p>${escapeHtml(data.notes || 'Add business-specific proof, photos, reviews, and service details before sending this demo.')}</p>
      </div>
    </section>
    <section id="contact">
      <div class="contact">
        <div>
          <h2>Ready to get started?</h2>
          <p>Contact ${escapeHtml(data.businessName)} today.</p>
        </div>
        <a class="button" href="${data.phone ? `tel:${escapeHtml(data.phone)}` : '#'}">${escapeHtml(data.cta)}</a>
      </div>
    </section>
  </main>
  <footer>Preview website for ${escapeHtml(data.businessName)} · Built with Agency OS</footer>
</body>
</html>`
}

export async function generateDemoSiteWithAI(input) {
  if (!supabase?.functions?.invoke) return buildLocalDemoContent(input)

  try {
    const { data, error } = await supabase.functions.invoke('generate-demo-site', {
      body: normalizeDemoInput(input)
    })

    if (error) throw error
    if (!data?.html || !data?.siteCopy) throw new Error('AI generator returned an incomplete response.')
    return { provider: 'supabase-edge-function', ...data }
  } catch (error) {
    console.warn('AI demo generation fell back to local generator:', error)
    return buildLocalDemoContent(input)
  }
}

export function aiDemoProviderNote() {
  return 'Uses the Supabase Edge Function when configured. Falls back to a local generator so the builder still works without an AI key.'
}
