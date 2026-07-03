import EmptyState from '../../components/ui/EmptyState'

export function WorkspaceTimeline({ items = [], loading = false, emptyIcon: EmptyIcon, emptyTitle = 'No activity yet', emptyDescription = 'Activity will appear here.', renderItem }) {
  if (loading) return <div className="workspaceMuted">Loading activity…</div>
  if (!items.length) return <EmptyState icon={EmptyIcon} title={emptyTitle} description={emptyDescription} />
  return <div className="workspaceTimeline">
    {items.map(item => renderItem ? renderItem(item) : <div className="workspaceTimelineItem" key={item.id}><div className="timelineDot" /><div><strong>{item.title || item.activity_type || 'Activity'}</strong><p>{item.note || item.message}</p><span>{item.date || item.created_at}</span></div></div>)}
  </div>
}
