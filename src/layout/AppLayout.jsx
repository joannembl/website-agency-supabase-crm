export default function AppLayout({ sidebar, topbar, teambar, children }) {
  return <div className="appShell standardizedAppShell">
    {sidebar}
    <main className="workspace standardizedWorkspace">
      {topbar}
      {teambar}
      {children}
    </main>
  </div>
}
