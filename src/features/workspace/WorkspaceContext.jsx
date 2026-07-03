import { createContext, useContext } from 'react'

export const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ value, children }) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used inside EntityWorkspace')
  return context
}
