export default function AppLayout({ sidebar, topbar, children }) {
  return <div className="appShell standardizedAppShell saasAppShell">
    {sidebar}
    <main className="workspace standardizedWorkspace saasWorkspace">
      {topbar}
      <div className="saasPageFrame">
        {children}
      </div>
    </main>
  </div>
}
