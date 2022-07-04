import { Identity } from '@semaphore-protocol/identity';
import * as React from 'react';

type ISemaphoreContext =
  | {
      id: Identity;
      setId: (id: Identity | null) => void;
    }
  | {
      id: null;
      setId: (id: Identity | null) => void;
    };

const SemaphoreContext = React.createContext<ISemaphoreContext | undefined>(
  undefined,
);

type SemaphoreProviderProps = any;
export function SemaphoreProvider(props: SemaphoreProviderProps) {
  const [id, setId] = React.useState<Identity | null>(null);

  const value: ISemaphoreContext = { id, setId };

  return (
    <SemaphoreContext.Provider value={value}>
      {props.children}
    </SemaphoreContext.Provider>
  );
}

export function useSemaphore() {
  const context = React.useContext(SemaphoreContext);

  if (!context) {
    throw new Error('`useSemaphore` must be used within a `SemaphoreProvider');
  }

  return context;
}

export function useConnectedSemaphore() {
  const context = useSemaphore();

  if (!context.id) {
    throw new Error(
      '`useConnectedSemaphore` can only be used when an ID has been generated',
    );
  }

  return context;
}
