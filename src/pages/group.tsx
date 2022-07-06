import { useMetaMask } from 'metamask-react';
import { useMutation, useQueryClient } from 'react-query';
import {
  useConnectedSemaphore,
  useSemaphore,
} from '../providers/semaphore.provider';
import { Link } from '@tanstack/react-location';
import { contractStore, useWalletSigner } from '../contracts';
import { ethers } from 'ethers';
import { Identity } from '@semaphore-protocol/identity';
import { GROUP_ID, SUPPORTED_NETWORK } from '../constants';

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
        <div>You need to be connected in order to go on here!</div>
      </div>
    );
  }

  return <UserGroup />;
}

function UserGroup() {
  const { id, hasJoined } = useConnectedSemaphore();
  const { signer } = useWalletSigner();
  const queryClient = useQueryClient();

  const { mutate, status } = useMutation(
    async (semaphoreId: Identity) => {
      const semaphoreDemoContractArtifacts = contractStore.getContract(SUPPORTED_NETWORK, "SEMAPHORE_DEMO");
      const semaphoreDemoContract = new ethers.Contract(
        semaphoreDemoContractArtifacts.address,
        semaphoreDemoContractArtifacts.abi,
        signer
      );
      const tx = await semaphoreDemoContract.join(semaphoreId.generateCommitment());
      await tx.wait();
      // const group = new Group();
      // group.addMember(id.generateCommitment());
      // console.log('ROOT', group.root);

      // const signal = 'watsup';

      // const fullProof = await generateProof(id, group, group.root, signal, {
      //   wasmFilePath: `${process.env.PUBLIC_URL}/semaphore.wasm`,
      //   zkeyFilePath: `${process.env.PUBLIC_URL}/semaphore.zkey`,
      // });
      // console.log('DONE');

      // console.log('AHAHA: ', fullProof.proof);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["group", { id: GROUP_ID }])
      }
    }
  );

  return (
    <div className="w-full px-16 py-8">
      <Link className="hover:underline hover:underline-offset-2" to="/identity">
        {'<-'} Back to identity
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-8">Stop #2 - Group</div>
        {hasJoined
          ? (
            <Link
              to="/proof"
              className="self-center hover:underline hover:underline-offset-2 text-lg"
            >
              Third stop: Proof and signal {'->'}
            </Link>
          ) : (
            <button
              disabled={status === 'loading'}
              className="py-2 px-4 border border-black font-semibold shadow rounded  hover:outline hover:outline-1 hover:outline-slate-400"
              onClick={() => mutate(id)}
            >
              Join group
            </button>
          )
        }
      </div>
    </div>
  );
}

export default GroupPage;
