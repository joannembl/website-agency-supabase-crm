export function normalizeDemoForm(source = {}) {
  return {
    demo_url: source.demo_url || '',
    live_url: source.live_url || '',
    github_repo: source.github_repo || '',
    hosting_provider: source.hosting_provider || 'Netlify',
    demo_status: source.demo_status || 'Not Started',
    deploy_status: source.deploy_status || '',
    preview_note: source.preview_note || '',
    feedback: source.feedback || ''
  }
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function slugify(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'demo-site'
}

export function servicesList(source = {}) {
  const raw = source.services || ''
  const parts = raw.split(/\n|,/).map(x => x.trim()).filter(Boolean)
  if (parts.length) return parts.slice(0, 6)
  const byTemplate = {
    'Mobile Detailing': ['Maintenance Wash', 'Interior Detail', 'Full Detail', 'Paint Correction', 'Ceramic Coating'],
    'Detail Shop': ['Interior Detail', 'Exterior Detail', 'Paint Correction', 'Ceramic Coating', 'Maintenance Plans'],
    'Tint / PPF': ['Window Tint', 'Paint Protection Film', 'Ceramic Coating', 'Windshield Protection', 'Quote Requests'],
    'Wrap Shop': ['Color Change Wraps', 'Commercial Graphics', 'Chrome Delete', 'Paint Protection Film', 'Wrap Care'],
    'Repair Shop': ['Diagnostics', 'Brake Service', 'Oil Change', 'Suspension Repair', 'Preventive Maintenance'],
    'Mobile Mechanic': ['Mobile Diagnostics', 'Brake Service', 'Battery Service', 'Oil Change', 'Emergency Help'],
    'Performance Shop': ['Performance Installs', 'Dyno Tuning', 'Maintenance', 'Fabrication', 'Build Consults'],
    'Automotive Photographer': ['Automotive Shoots', 'Rolling Shots', 'Event Coverage', 'Commercial Content', 'Social Media Packages'],
    'Wheel Repair': ['Curb Rash Repair', 'Wheel Refinishing', 'Powder Coat', 'Crack Repair', 'Mount & Balance']
  }
  return byTemplate[source.template] || ['Services', 'Gallery', 'Reviews', 'Contact']
}

export function generateDemoBrief(lead, source = {}) {
  if (!lead) return ''
  const services = source.services?.trim() || 'Add the main services/packages for this business.'
  const photos = source.photos?.trim() || 'Use placeholder automotive/detailing imagery until client photos are provided.'
  const notes = source.notes?.trim() || 'Create a simple demo-first landing page that makes the business look established and easy to contact.'
  return [
    `Demo website brief for ${lead.business_name}`,
    ``,
    `Business type: ${lead.category || source.template}`,
    `City/market: ${lead.city || 'Phoenix'}`,
    `Instagram: ${lead.instagram_handle || 'Not added'}`,
    `Website status: ${lead.website_status || 'Needs verification'}`,
    `Google rating/reviews: ${lead.google_rating || 'N/A'} (${lead.google_reviews || 0} reviews)`,
    ``,
    `Template: ${source.template}`,
    `Visual style: ${source.style}`,
    ``,
    `Recommended sections:`,
    `1. Hero section with clear headline, service area, and call-to-action`,
    `2. Services/packages section`,
    `3. Before/after or portfolio gallery`,
    `4. Why choose us / trust section`,
    `5. Google reviews/testimonials`,
    `6. Contact form and call/text buttons`,
    `7. Footer with Instagram, phone, service area, and preview disclaimer`,
    ``,
    `Services to feature:`,
    services,
    ``,
    `Photo/content notes:`,
    photos,
    ``,
    `Build notes:`,
    notes,
    ``,
    `Next step: Build the demo, save the preview URL in Demo Manager, then move this prospect to Demo Built.`
  ].join('\n')
}

export function generateSiteCopy(lead, source = {}) {
  if (!lead) return ''
  const services = servicesList(source)
  const city = lead.city || 'Phoenix'
  const name = lead.business_name || 'Your Business'
  const category = lead.category || source.template
  const serviceLine = services.slice(0, 3).join(', ')
  return [
    `Website copy for ${name}`,
    ``,
    `Hero headline: ${category} in ${city}, built around quality work and easy booking.`,
    `Hero subheadline: Make ${name} look established with a clean, mobile-ready demo site that turns visitors into calls, DMs, and quote requests.`,
    `Primary CTA: Request a Quote`,
    `Secondary CTA: View Services`,
    ``,
    `Services section intro: Whether customers need ${serviceLine}, this page makes the offer clear without forcing them to DM for every detail.`,
    ...services.map((item, index) => `${index + 1}. ${item} — Clear service card with short benefit-driven copy.`),
    ``,
    `Trust section: Feature Google rating, review count, service area, fast response time, and real customer photos once available.`,
    `Gallery section: Use placeholder automotive visuals now, then replace with the owner’s best Instagram photos.`,
    `Contact section: Encourage visitors to call, text, DM, or submit a simple quote form.`,
    `Footer disclaimer: Preview website created for ${name}. Images/content may be placeholders. Not yet live.`
  ].join('\n')
}

export function generateSiteHtml(lead, source = {}) {
  if (!lead) return ''
  const name = escapeHtml(lead.business_name || 'Demo Business')
  const city = escapeHtml(lead.city || 'Phoenix')
  const category = escapeHtml(lead.category || source.template || 'Automotive Business')
  const style = source.style || 'Modern / clean'
  const services = servicesList(source)
  const rating = lead.google_rating ? `${lead.google_rating}★` : '5-star quality'
  const reviews = lead.google_reviews ? `${lead.google_reviews} Google reviews` : 'trusted local service'
  const instagram = lead.instagram_handle ? `https://instagram.com/${lead.instagram_handle.replace('@','')}` : '#'
  const serviceCards = services.map(service => `<article class="card"><h3>${escapeHtml(service)}</h3><p>Clear package details, benefits, and a simple call-to-action so customers know exactly what to do next.</p></article>`).join('\n        ')
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name} · Preview Website</title>
  <style>
    * { box-sizing: border-box; } body { margin:0; font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif; color:#101828; background:#f8fafc; } a { color:inherit; text-decoration:none; }
    .wrap { max-width:1120px; margin:0 auto; padding:0 22px; } header { background:#0f172a; color:white; padding:18px 0; position:sticky; top:0; } nav { display:flex; align-items:center; justify-content:space-between; gap:16px; } .brand { font-weight:900; letter-spacing:-.03em; } .navlinks { display:flex; gap:18px; font-size:14px; opacity:.9; }
    .hero { display:grid; grid-template-columns:1.1fr .9fr; gap:36px; align-items:center; padding:86px 22px; } .eyebrow { text-transform:uppercase; letter-spacing:.14em; font-size:12px; font-weight:800; color:#2563eb; } h1 { font-size:56px; line-height:.95; margin:12px 0 18px; letter-spacing:-.06em; } .lead { font-size:19px; line-height:1.6; color:#475467; max-width:620px; } .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:26px; } .btn { background:#2563eb; color:white; padding:13px 18px; border-radius:14px; font-weight:800; } .btn.secondary { background:white; color:#0f172a; border:1px solid #e5e7eb; }
    .heroCard { background:white; border:1px solid #e5e7eb; border-radius:28px; overflow:hidden; box-shadow:0 24px 70px rgba(15,23,42,.12); } .photo { height:310px; background:linear-gradient(135deg,#111827,#334155 50%,#93c5fd); } .stats { display:grid; grid-template-columns:repeat(3,1fr); } .stat { padding:18px; border-right:1px solid #e5e7eb; } .stat:last-child{border-right:0}.stat strong{display:block;font-size:20px}.stat span{font-size:12px;color:#64748b}
    section { padding:64px 0; } .sectionHead { display:flex; justify-content:space-between; gap:22px; align-items:end; margin-bottom:22px; } h2 { font-size:36px; margin:8px 0 0; letter-spacing:-.04em; } .muted { color:#64748b; line-height:1.6; } .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; } .card { background:white; border:1px solid #e5e7eb; border-radius:22px; padding:22px; box-shadow:0 12px 34px rgba(15,23,42,.06); } .card h3 { margin:0 0 10px; } .card p { color:#64748b; line-height:1.55; }
    .gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }.tile{height:220px;border-radius:22px;background:linear-gradient(135deg,#1f2937,#64748b);}.contact{background:#0f172a;color:white;border-radius:28px;padding:36px;display:flex;align-items:center;justify-content:space-between;gap:20px}.contact .muted{color:#cbd5e1} footer{padding:28px 0;color:#64748b;font-size:13px;text-align:center}
    @media(max-width:800px){.hero,.grid,.gallery{grid-template-columns:1fr}h1{font-size:42px}.navlinks{display:none}.sectionHead,.contact{display:block}.stats{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <header><div class="wrap"><nav><div class="brand">${name}</div><div class="navlinks"><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a></div></nav></div></header>
  <main>
    <div class="wrap hero"><div><div class="eyebrow">${category} · ${city}</div><h1>${name} makes it easy to book quality automotive work.</h1><p class="lead">A clean demo website built to help customers understand the services, trust the business, and reach out without hunting through social media DMs.</p><div class="actions"><a class="btn" href="#contact">Request a Quote</a><a class="btn secondary" href="#services">View Services</a></div></div><aside class="heroCard"><div class="photo"></div><div class="stats"><div class="stat"><strong>${escapeHtml(rating)}</strong><span>${escapeHtml(reviews)}</span></div><div class="stat"><strong>${city}</strong><span>Service Area</span></div><div class="stat"><strong>${escapeHtml(style)}</strong><span>Demo Style</span></div></div></aside></div>
    <section id="services"><div class="wrap"><div class="sectionHead"><div><div class="eyebrow">Services</div><h2>Clear offers, fewer missed leads.</h2></div><p class="muted">Service cards can be customized with pricing, package details, and booking buttons.</p></div><div class="grid">${serviceCards}</div></div></section>
    <section id="gallery"><div class="wrap"><div class="sectionHead"><div><div class="eyebrow">Gallery</div><h2>Built for before-and-after proof.</h2></div><p class="muted">Replace these placeholders with Instagram photos or client-provided images.</p></div><div class="gallery"><div class="tile"></div><div class="tile"></div><div class="tile"></div></div></div></section>
    <section><div class="wrap"><div class="grid"><div class="card"><h3>Fast response</h3><p>Make phone, text, and quote requests obvious from every page.</p></div><div class="card"><h3>Mobile-ready</h3><p>Most local automotive leads browse from their phone. This layout is built for that.</p></div><div class="card"><h3>Trust-focused</h3><p>Show reviews, photos, location, and service details in one polished place.</p></div></div></div></section>
    <section id="contact"><div class="wrap"><div class="contact"><div><div class="eyebrow">Ready to book?</div><h2>Request a quote from ${name}.</h2><p class="muted">Call, text, DM, or use this form area to capture leads from the website.</p></div><div class="actions"><a class="btn" href="tel:${escapeHtml(lead.phone || '')}">Call Now</a><a class="btn secondary" href="${escapeHtml(instagram)}">Instagram</a></div></div></div></section>
  </main>
  <footer><div class="wrap">Preview website created for ${name}. Images and copy are placeholders. Not yet live.</div></footer>
</body>
</html>`
}
