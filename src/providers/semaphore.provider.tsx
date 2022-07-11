import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import request, { gql } from 'graphql-request';
import * as React from 'react';
import { useQuery } from 'react-query';
import { GROUP_ID, SUBGRAPH_ENDPOINT } from '../constants';

type IdArguments = {
  address: string;
  message: string;
};

type GeneratedIdentity = {
  id: Identity;
  idArguments: IdArguments;
};

type StringifiedGeneratedIdentity = {
  idString: string;
  message: string;
  address: string;
};

type ISemaphoreContext =
  | {
      id: Identity;
      idArguments: IdArguments;
      setIdentity: (id: GeneratedIdentity) => void;
      clearIdentity: () => void;
      hasJoined: boolean;
      groupWrapper: null | { group: Group; commitments: string[] };
    }
  | {
      id: null;
      idArguments: null;
      setIdentity: (id: GeneratedIdentity) => void;
      clearIdentity: () => void;
      hasJoined: boolean;
      groupWrapper: null | { group: Group; commitments: string[] };
    };

const SemaphoreContext = React.createContext<ISemaphoreContext | undefined>(
  undefined,
);

type SemaphoreProviderProps = any;
export function SemaphoreProvider(props: SemaphoreProviderProps) {
  const [generatedId, setGeneratedId] =
    React.useState<GeneratedIdentity | null>(() => {
      const cachedValue = localStorage.getItem('@slourp/semaphore-demo');
      if (!cachedValue) return null;
      try {
        const parsedValue: StringifiedGeneratedIdentity =
          JSON.parse(cachedValue);
        if (
          !parsedValue.address ||
          !parsedValue.message ||
          !parsedValue.idString
        ) {
          throw new Error('Value not valid');
        }
        const id = new Identity(parsedValue.idString);
        return {
          id,
          idArguments: {
            address: parsedValue.address,
            message: parsedValue.message,
          },
        };
      } catch (err) {
        localStorage.removeItem('@slourp/semaphore-demo');
        return null;
      }
    });

  React.useEffect(() => {
    if (!generatedId) {
      localStorage.removeItem('@slourp/semaphore-demo');
    } else {
      const data: StringifiedGeneratedIdentity = {
        idString: generatedId.id.toString(),
        address: generatedId.idArguments.address,
        message: generatedId.idArguments.message,
      };
      localStorage.setItem('@slourp/semaphore-demo', JSON.stringify(data));
    }
  }, [generatedId]);

  const query = useQuery(
    ['group', { id: GROUP_ID }],
    () => {
      return request<{
        group: {
          members: {
            identityCommitment: string;
          }[];
        };
      }>(
        SUBGRAPH_ENDPOINT,
        gql`
  query {
    group(id: ${GROUP_ID}) {
      root
      members(orderBy: index) {
        identityCommitment
      }
    }
  }
`,
      );
    },
    {
      refetchInterval: 1000,
    },
  );

  const groupWrapper = React.useMemo(() => {
    if (query.status !== 'success') return null;
    const commitments = query.data.group.members.map(
      (m) => m.identityCommitment,
    );
    const group = new Group();
    group.addMembers(commitments);
    return { group, commitments };
  }, [query.status, query.data]);

  const hasJoined = Boolean(
    generatedId &&
      groupWrapper &&
      groupWrapper.commitments.includes(
        generatedId.id.generateCommitment().toString(),
      ),
  );

  const value: ISemaphoreContext = generatedId
    ? {
        id: generatedId.id,
        idArguments: generatedId.idArguments,
        setIdentity: (id: GeneratedIdentity) => setGeneratedId(id),
        clearIdentity: () => setGeneratedId(null),
        hasJoined,
        groupWrapper,
      }
    : {
        id: null,
        idArguments: null,
        setIdentity: (id: GeneratedIdentity) => setGeneratedId(id),
        clearIdentity: () => setGeneratedId(null),
        hasJoined,
        groupWrapper,
      };

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
