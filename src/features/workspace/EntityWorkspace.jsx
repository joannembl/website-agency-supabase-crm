import { useMemo, useState } from 'react'
import Badge from '../../components/ui/Badge'
import { PageLayout } from '../../layout'
import WorkspaceHeader from './WorkspaceHeader'
import WorkspaceTabs from './WorkspaceTabs'
import { WorkspaceContent } from './WorkspaceContent'
import { WorkspaceProvider } from './WorkspaceContext'

export default function EntityWorkspace({
  entity,
  entityType,
  title,
  subtitle,
  eyebrow,
  avatar,
  onBack,
  backLabel,
  actions,
  statusBadges = [],
  tabs = [],
  sidebar,
  defaultTab,
  className = ''
}) {
  const firstTab = defaultTab || tabs[0]?.id || tabs[0]?.label || tabs[0]
  const [activeTab, setActiveTab] = useState(firstTab)
  const activeTabConfig = tabs.find(tab => (tab.id || tab.label || tab) === activeTab) || tabs[0]
  const workspaceValue = useMemo(() => ({ entity, entityType, activeTab, setActiveTab, tabs }), [entity, entityType, activeTab, tabs])

  return <WorkspaceProvider value={workspaceValue}>
    <PageLayout className={`prospectWorkspacePage entityWorkspace ${className}`}>
      <WorkspaceHeader title={title} subtitle={subtitle} eyebrow={eyebrow} avatar={avatar} onBack={onBack} backLabel={backLabel} actions={actions} />
      {statusBadges.length ? <div className="workspaceStatusBar entityWorkspaceStatusBar">
        {statusBadges.map((badge, index) => <Badge key={`${badge.label}-${index}`} tone={badge.tone || 'neutral'} dot={badge.dot}>{badge.label}</Badge>)}
      </div> : null}
      <WorkspaceTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <WorkspaceContent sidebar={sidebar}>{activeTabConfig?.render ? activeTabConfig.render() : null}</WorkspaceContent>
    </PageLayout>
  </WorkspaceProvider>
}
