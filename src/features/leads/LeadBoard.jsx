import { Search, Plus, ExternalLink, Download, LayoutDashboard, Table2, ChevronRight, ChevronLeft, GripVertical, MessageSquare, Monitor, Rocket, Pencil, Trash2 } from 'lucide-react'
import { leadCategories, priorities } from '../../constants'

export default function LeadBoard(props) {
  const {
    leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory,
    pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId,
    handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead,
    openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin
  } = props

  return <>
    <section className="stats compactStats">
      <div><span>Total Leads</span><strong>{leads.length}</strong></div>
      <div><span>No/Weak Website</span><strong>{noWebsite}</strong></div>
      <div><span>Demos/Pipeline</span><strong>{demos}</strong></div>
      <div><span>Projected MRR</span><strong>${mrr}</strong></div>
    </section>

    <main className="fullBoardMain">
      <section className="card tableWrap fullBoardCard">
        <div className="toolbar">
          <div className="search"><Search size={16}/><input placeholder="Search leads" value={query} onChange={e=>setQuery(e.target.value)}/></div>
          <select value={status} onChange={e=>setStatus(e.target.value)}>{['All',...pipelineStages].map(x=><option key={x}>{x}</option>)}</select>
          <select value={category} onChange={e=>setCategory(e.target.value)}>{['All',...leadCategories].map(x=><option key={x}>{x}</option>)}</select>
          <div className="viewToggle">
            <button type="button" className={viewMode === 'kanban' ? 'active' : ''} onClick={()=>setView('kanban')}><LayoutDashboard size={16}/> Kanban</button>
            <button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={()=>setView('table')}><Table2 size={16}/> Table</button>
          </div>
          <button type="button" className="addLeadBtn" onClick={()=>setShowAddModal(true)}><Plus size={16}/> Add Prospect</button>
          <button onClick={exportCsv}><Download size={16}/> CSV</button>
        </div>

        {viewMode === 'kanban'
          ? <KanbanView {...{ pipelineStages, draggingLeadId, handleDrop, pipelineCounts, filtered, setDraggingLeadId, handleDragStart, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }} />
          : <TableView {...{ filtered, updateLead, pipelineStages, openActivities, openDemoManager, openBuildDemo, startEdit, deleteLead, isAdmin }} />}
      </section>
    </main>
  </>
}

function KanbanView({ pipelineStages, draggingLeadId, handleDrop, pipelineCounts, filtered, setDraggingLeadId, handleDragStart, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  return <div className="kanbanBoard">
    {pipelineStages.map((stage, stageIndex)=><section className={`kanbanColumn ${draggingLeadId ? 'dropReady' : ''}`} key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, stage)}>
      <div className="kanbanHeader"><strong>{stage}</strong><span>{pipelineCounts[stage] || 0}</span></div>
      <div className="kanbanCards">
        {filtered.filter(l => (l.status || 'Research') === stage).map(l=><article className={`kanbanCard ${draggingLeadId === l.id ? 'dragging' : ''}`} key={l.id} draggable onDragStart={e=>handleDragStart(e, l.id)} onDragEnd={()=>setDraggingLeadId(null)}>
          <div className="kanbanTop"><div className="dragHandle" title="Drag to another stage"><GripVertical size={16}/></div><div className="kanbanTitle"><strong>{l.business_name}</strong><small>{l.city || 'Phoenix'} · {l.category}</small></div><span className={`priorityBadge priority${l.priority || 'B'}`}>{l.priority || 'B'}</span></div>
          <p>{l.instagram_handle || 'No Instagram added'}</p>
          <div className="kanbanMeta"><span>{l.website_status}</span><span className="demoChip">Demo: {demoStatusForLead(l)}</span>{l.google_reviews ? <span>{l.google_reviews} reviews</span> : null}</div>
          {l.notes && <p className="kanbanNotes">{l.notes}</p>}
          <div className="kanbanActions">
            <button className="iconBtn" disabled={stageIndex === 0} onClick={()=>updateLead(l.id,{status:pipelineStages[stageIndex-1]})} title="Move back"><ChevronLeft size={15}/></button>
            <button className="iconBtn" onClick={()=>openDemoManager(l)} title="Demo website"><Monitor size={15}/></button>
            <button className="iconBtn" onClick={()=>openBuildDemo(l)} title="Build demo website"><Rocket size={15}/></button>
            <button className="iconBtn" onClick={()=>openActivities(l)} title="Activity notes"><MessageSquare size={15}/></button>
            <button className="iconBtn" onClick={()=>startEdit(l)} title="Edit prospect"><Pencil size={15}/></button>
            {isAdmin && <button className="iconBtn dangerBtn" onClick={()=>deleteLead(l.id)} title="Delete prospect"><Trash2 size={15}/></button>}
            <button className="iconBtn" disabled={stageIndex === pipelineStages.length - 1} onClick={()=>updateLead(l.id,{status:pipelineStages[stageIndex+1]})} title="Move forward"><ChevronRight size={15}/></button>
          </div>
        </article>)}
      </div>
    </section>)}
  </div>
}

function TableView({ filtered, updateLead, pipelineStages, openActivities, openDemoManager, openBuildDemo, startEdit, deleteLead, isAdmin }) {
  return <table>
    <thead><tr><th>Business</th><th>IG</th><th>Category</th><th>Website</th><th>Priority</th><th>Status</th><th>Notes</th><th>Activity</th><th>Actions</th></tr></thead>
    <tbody>{filtered.map(l=><tr key={l.id}>
      <td><strong>{l.business_name}</strong><small>{l.city}</small></td>
      <td>{l.instagram_handle}</td><td>{l.category}</td>
      <td>{l.website_url ? <a href={l.website_url} target="_blank" rel="noreferrer">{l.website_status} <ExternalLink size={12}/></a> : l.website_status}</td>
      <td><select value={l.priority || 'B'} onChange={e=>updateLead(l.id,{priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></td>
      <td><select value={l.status || 'Research'} onChange={e=>updateLead(l.id,{status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></td>
      <td>{l.notes}</td>
      <td><button className="secondaryBtn compactBtn" onClick={()=>openActivities(l)}><MessageSquare size={14}/> Log</button></td>
      <td><div className="rowActions"><button className="iconBtn" onClick={()=>openDemoManager(l)} title="Demo website"><Monitor size={15}/></button><button className="iconBtn" onClick={()=>openBuildDemo(l)} title="Build demo website"><Rocket size={15}/></button><button className="iconBtn" onClick={()=>openActivities(l)} title="Activity notes"><MessageSquare size={15}/></button><button className="iconBtn" onClick={()=>startEdit(l)} title="Edit prospect"><Pencil size={15}/></button>{isAdmin && <button className="iconBtn dangerBtn" onClick={()=>deleteLead(l.id)} title="Delete prospect"><Trash2 size={15}/></button>}</div></td>
    </tr>)}</tbody>
  </table>
}
