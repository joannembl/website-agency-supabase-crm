import React from 'react'
import { Button, Card } from '../components/ui'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Agency OS crashed', error, errorInfo)
  }

  render() {
    if (!this.state.error) return this.props.children

    return <main className="fatalErrorShell">
      <Card className="fatalErrorCard">
        <h1>Something went wrong</h1>
        <p>{this.state.error?.message || 'The app hit an unexpected error.'}</p>
        <Button onClick={() => window.location.reload()}>Reload app</Button>
      </Card>
    </main>
  }
}
