import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class VoiceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    /* keep modal shell visible */
  }

  componentDidUpdate(prev: Props) {
    if (prev.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <p style={{ color: '#fff', marginTop: 16 }}>
            Something went wrong. Close and try again.
          </p>
        )
      );
    }
    return this.props.children;
  }
}
