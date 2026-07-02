import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Plus, ExternalLink, Download, RefreshCw } from 'lucide-react'
import { supabase } from './supabase'
import './styles.css'

const blankLead = {
  business_name: '', instagram_handle: '', category: 'Mobile Detailing', city: 'Phoenix', followers: '',
  website_status: 'Needs verification', website_url: '', email: '', phone: '', google_rating: '',
  google_reviews: '', priority: 'B', status: 'Research', notes: ''
}

function App() {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(blankLead)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [message, setMessage] = useState('')

  const connected = Boolean(supabase)

  async function loadLeads() {
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('crm_leads') || '[]')
      setLeads(local)
      return
    }
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setLeads(data || [])
  }

  useEffect(() => { loadLeads() }, [])

  async function addLead(e) {
    e.preventDefault()
    if (!form.business_name.trim()) return
    const payload = {
      ...form,
      followers: form.followers ? Number(form.followers) : null,
      google_rating: form.google_rating ? Number(form.google_rating) : null,
      google_reviews: form.google_reviews ? Number(form.google_reviews) : null
    }
    if (!supabase) {
      const newLead = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const next = [newLead, ...leads]
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); setForm(blankLead); return
    }
    const { error } = await supabase.from('leads').insert(payload)
    if (error) setMessage(error.message)
    else { setForm(blankLead); loadLeads() }
  }

  async function updateLead(id, patch) {
    if (!supabase) {
      const next = leads.map(l => l.id === id ? { ...l, ...patch } : l)
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); return
    }
    await supabase.from('leads').update(patch).eq('id', id)
    loadLeads()
  }

  const filtered = useMemo(() => leads.filter(l => {
    const hay = `${l.business_name} ${l.instagram_handle} ${l.category} ${l.city} ${l.notes}`.toLowerCase()
    return hay.includes(query.toLowerCase()) && (status === 'All' || l.status === status) && (category === 'All' || l.category === category)
  }), [leads, query, status, category])

  const mrr = leads.filter(l => l.status === 'Won').length * 99
  const demos = leads.filter(l => ['Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won'].includes(l.status)).length
  const noWebsite = leads.filter(l => ['No website','Likely no/weak site','Social-only'].includes(l.website_status)).length

  function exportCsv() {
    const rows = [Object.keys(blankLead), ...leads.map(l => Object.keys(blankLead).map(k => JSON.stringify(l[k] ?? '')))]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'website-agency-crm-leads.csv'; a.click()
  }

  return <div>
    <header>
      <div><h1>Website Agency CRM</h1><p>{connected ? 'Connected to Supabase' : 'Local mode — add Supabase keys to sync online'}</p></div>
      <button onClick={loadLeads}><RefreshCw size={16}/> Refresh</button>
    </header>

    {message && <div className="notice">{message}</div>}

    <section className="stats">
      <div><span>Total Leads</span><strong>{leads.length}</strong></div>
      <div><span>No/Weak Website</span><strong>{noWebsite}</strong></div>
      <div><span>Demos/Pipeline</span><strong>{demos}</strong></div>
      <div><span>Projected MRR</span><strong>${mrr}</strong></div>
    </section>

    <main>
      <form onSubmit={addLead} className="card form">
        <h2><Plus size={18}/> Add Lead</h2>
        <input placeholder="Business name" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/>
        <input placeholder="Instagram handle" value={form.instagram_handle} onChange={e=>setForm({...form,instagram_handle:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select>
        <input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
        <input placeholder="Followers" value={form.followers} onChange={e=>setForm({...form,followers:e.target.value})}/>
        <select value={form.website_status} onChange={e=>setForm({...form,website_status:e.target.value})}>{['Needs verification','No website','Likely no/weak site','Social-only','Website found','Strong website'].map(x=><option key={x}>{x}</option>)}</select>
        <input placeholder="Website URL" value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
        <button type="submit">Add Prospect</button>
      </form>

      <section className="card tableWrap">
        <div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search leads" value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}>{['All','Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost'].map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}>{['All','Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select><button onClick={exportCsv}><Download size={16}/> CSV</button></div>
        <table><thead><tr><th>Business</th><th>IG</th><th>Category</th><th>Website</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td><strong>{l.business_name}</strong><small>{l.city}</small></td><td>{l.instagram_handle}</td><td>{l.category}</td><td>{l.website_url ? <a href={l.website_url} target="_blank">{l.website_status} <ExternalLink size={12}/></a> : l.website_status}</td><td><select value={l.priority || 'B'} onChange={e=>updateLead(l.id,{priority:e.target.value})}>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></td><td><select value={l.status || 'Research'} onChange={e=>updateLead(l.id,{status:e.target.value})}>{['Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost'].map(x=><option key={x}>{x}</option>)}</select></td><td>{l.notes}</td></tr>)}</tbody></table>
      </section>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
