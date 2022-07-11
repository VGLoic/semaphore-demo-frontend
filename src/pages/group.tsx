import { useMetaMask } from 'metamask-react';
import { useMutation, useQueryClient } from 'react-query';
import {
  useConnectedSemaphore,
  useSemaphore,
} from '../providers/semaphore.provider';
import { Link } from '@tanstack/react-location';
import { useSemaphoreDemoContract } from '../contracts';
import { Identity } from '@semaphore-protocol/identity';
import { GROUP_ID } from '../constants';
import Button from '../components/button';

function GroupPage() {
  const { status } = useMetaMask();
  const { id } = useSemaphore();

  if (!id) {
    return (
      <div>
        <div className="mb-6">
          You need to have generated an ID at step 1 before going on here!
        </div>
        <Link
          className="mt-4 self-center hover:underline hover:underline-offset-2"
          to="/identity"
        >
          {'<-'} First stop: Identity
        </Link>
      </div>
    );
  }

  if (status !== 'connected') {
    return (
      <div>
        <div>You need to be connected in order to go on here!</div>
      </div>
    );
  }

  return <UserGroup />;
}

function UserGroup() {
  const { hasJoined, groupWrapper } = useConnectedSemaphore();

  return (
    <div className="w-full px-16 pt-2  pb-8">
      <Link className="hover:underline hover:underline-offset-2" to="/identity">
        {'<-'} Back to identity
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-8">Stop #2 - Group</div>
        <div className="px-8 py-4 border-2 rounded border-current shadow-md max-w-lg flex flex-col text-sm">
          <h1 className="text-lg mb-4">What is a group in Semaphore?</h1>
          <div className="mb-4 flex flex-col justify-center">
            <div className="mb-4">
              A group contains the identity commitments of its members.
            </div>
            <div className="mb-4">
              Groups can be on chain or off chain and the conditions for
              entering or leaving the groups are up to the groups designers
            </div>
            <div className="text-sm">
              Technically speaking, the commmitments are organised in a Merkle
              tree
            </div>
          </div>
        </div>
        <div className="my-8 flex flex-col items-center">
          <div className="text-lg mb-4">
            In this demonstration, the group is on chain, and anybody is free to
            join it!
          </div>
          <div>
            {groupWrapper
              ? `${groupWrapper.commitments.length} members so far!`
              : null}
          </div>
        </div>
        {hasJoined ? (
          <div className="flex items-center">
            <div className="mr-4">You are a member of the group!</div>
            <Link
              to="/signal"
              className="self-center hover:underline hover:underline-offset-2 text-lg"
            >
              Third stop: Proof and signal {'->'}
            </Link>
          </div>
        ) : (
          <JoinGroup />
        )}
      </div>
    </div>
  );
}

function JoinGroup() {
  const { id } = useConnectedSemaphore();
  const queryClient = useQueryClient();
  const semaphoreDemoContract = useSemaphoreDemoContract();

  const { mutate, status } = useMutation(
    async (semaphoreId: Identity) => {
      const tx = await semaphoreDemoContract.join(
        semaphoreId.generateCommitment(),
      );
      await tx.wait();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', { id: GROUP_ID }]);
      },
    },
  );
  return (
    <div className="flex flex-col items-center">
      <Button
        status={status === 'loading' ? 'loading' : 'enabled'}
        onClick={() => mutate(id)}
      >
        Join group
      </Button>
      <div className="flex flex-col items-center max-w-3xl">
        <div className="mt-6">
          By clicking on this button, you will add your public identity
          commitment to the group
        </div>
        <div className="text-sm mt-4">
          As the group is on chain, joining the group is a transaction and the
          commitment will be published on chain
        </div>
        <div className="text-sm mt-4">
          Privacy tip: In this case, you can get an extra dose of privacy by
          using a different address for the transaction than the one linked to
          the commitment
        </div>
      </div>
    </div>
  );
}

export default GroupPage;
