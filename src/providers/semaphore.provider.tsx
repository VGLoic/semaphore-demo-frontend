import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import request, { gql } from 'graphql-request';
import * as React from 'react';
import { useQuery } from 'react-query';
import { GROUP_ID, SUBGRAPH_ENDPOINT } from '../constants';

type ISemaphoreContext =
  | {
      id: Identity;
      setId: (id: Identity | null) => void;
      hasJoined: boolean;
      groupWrapper: null | { group: Group; commitments: string[] };
    }
  | {
      id: null;
      setId: (id: Identity | null) => void;
      hasJoined: boolean;
      groupWrapper: null | { group: Group; commitments: string[] };
    };

const SemaphoreContext = React.createContext<ISemaphoreContext | undefined>(
  undefined,
);

type SemaphoreProviderProps = any;
export function SemaphoreProvider(props: SemaphoreProviderProps) {
  const [id, setId] = React.useState<Identity | null>(null);

  const query = useQuery(["group", { id: GROUP_ID }], () => {
    return request<{
      group: {
        members: {
          identityCommitment: string
        }[]
      }
    }>(
    SUBGRAPH_ENDPOINT,
    gql`
  query {
    group(id: ${GROUP_ID}) {
      members {
        identityCommitment
      }
    }
  }
`)}, {
  refetchInterval: 1000
});

  const groupWrapper = React.useMemo(() => {
    if (query.status !== 'success') return null;
    const commitments = query.data.group.members.map(m => m.identityCommitment);
    const group = new Group();
    group.addMembers(commitments);
    return { group, commitments };
  }, [query.status, query.data]);
  
  const hasJoined = Boolean(id && groupWrapper && groupWrapper.commitments.includes(id.generateCommitment().toString()));

  const value: ISemaphoreContext = { id, setId, hasJoined, groupWrapper  };

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
