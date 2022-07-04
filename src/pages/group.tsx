import { useMetaMask } from 'metamask-react';
import { useMutation } from 'react-query';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import {
  useConnectedSemaphore,
  useSemaphore,
} from '../providers/semaphore.provider';
import { Link } from '@tanstack/react-location';

function GroupPage() {
  const { status } = useMetaMask();
  const { id } = useSemaphore();

  if (!id) {
    return (
      <div>
        <div>
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
        <div>You need to be connected in order to going on here!</div>
      </div>
    );
  }

  return <UserGroup />;
}

function UserGroup() {
  const { id } = useConnectedSemaphore();

  useMutation(
    async () => {
      const group = new Group();
      group.addMember(id.generateCommitment());
      console.log('ROOT', group.root);

      const signal = 'watsup';

      const fullProof = await generateProof(id, group, group.root, signal, {
        wasmFilePath: `${process.env.PUBLIC_URL}/semaphore.wasm`,
        zkeyFilePath: `${process.env.PUBLIC_URL}/semaphore.zkey`,
      });
      console.log('DONE');

      console.log('AHAHA: ', fullProof.proof);
    },
    {
      onError: (err) => {
        console.log('error: ', err);
      },
    },
  );

  return (
    <div className="w-full px-16 py-8">
      <Link className="hover:underline hover:underline-offset-2" to="/identity">
        {'<-'} Back to identity
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-8">Stop #2 - Group</div>
      </div>
    </div>
  );
}

export default GroupPage;
