import { PageContent } from '../../layout'

export function WorkspaceContent({ children, sidebar }) {
  return <PageContent>
    <div className="workspaceGrid entityWorkspaceGrid">
      <main className="workspaceMainPanel entityWorkspaceMain">{children}</main>
      {sidebar}
    </div>
  </PageContent>
}
