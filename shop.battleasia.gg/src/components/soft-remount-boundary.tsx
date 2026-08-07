import { Component, type ErrorInfo, type ReactNode } from 'react';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

type State = {
  generation: number;
  fatal: Error | null;
};

function isDomRaceError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || '';
  return (
    error.name === 'NotFoundError' ||
    msg.includes('removeChild') ||
    msg.includes('insertBefore') ||
    msg.includes('The node to be removed is not a child')
  );
}

/**
 * Recovers from React/DOM races (extensions, toast portals, LazyMotion async features)
 * that throw NotFoundError on removeChild — remount instead of white-screen.
 */
export class SoftRemountBoundary extends Component<Props, State> {
  state: State = { generation: 0, fatal: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    if (isDomRaceError(error)) {
      return { fatal: null };
    }
    return { fatal: error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (isDomRaceError(error)) {
      window.setTimeout(() => {
        this.setState((s) => ({ generation: s.generation + 1, fatal: null }));
      }, 0);
    }
  }

  render() {
    if (this.state.fatal) {
      throw this.state.fatal;
    }
    return (
      <div key={this.state.generation} style={{ display: 'contents' }}>
        {this.props.children}
      </div>
    );
  }
}
