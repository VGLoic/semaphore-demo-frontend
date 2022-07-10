import * as React from 'react';
import {
  FullProof,
  generateProof,
  packToSolidityProof,
} from '@semaphore-protocol/proof';
import { Link } from '@tanstack/react-location';
import { BigNumber, ethers } from 'ethers';
import { useMetaMask } from 'metamask-react';
import { useForm } from 'react-hook-form';
import { BsCheckLg } from 'react-icons/bs';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { GROUP_ID } from '../constants';
import { useSemaphoreContract } from '../contracts';
import {
  useConnectedSemaphore,
  useSemaphore,
} from '../providers/semaphore.provider';
import Button from '../components/button';

function SignalPage() {
  const { status } = useMetaMask();
  const { id, hasJoined } = useSemaphore();

  if (!id) {
    return (
      <div>
        <div className="mb-6">
          You need to have generated an ID at step 1 before continuing here!
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

  if (!hasJoined) {
    return (
      <div>
        <div className="mb-6">
          You need to belong to the group before continuing here!
        </div>
        <Link
          className="mt-4 self-center hover:underline hover:underline-offset-2"
          to="/group"
        >
          {'<-'} Second stop: Group
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

  return (
    <div className="w-full px-16 py-8">
      <Link className="hover:underline hover:underline-offset-2" to="/group">
        {'<-'} Back to group
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-8">Stop #3 - Proof and signal</div>
        <div className="px-8 py-4 border-2 rounded border-current shadow-md max-w-lg flex flex-col text-sm">
          <h1 className="text-lg mb-4">What is a signal in Semaphore?</h1>
          <div className="mb-4 flex flex-col justify-center">
            <div className="mb-2">A signal is simply a small message.</div>
            <div className="mb-2 text-base font-bold">
              But it is broadcasted anonymously
            </div>
            <div className="mb-2 text-xs">
              It is done using a zero knowledge proof proving that the creator
              of the signal is one of the members of the group, but nobody will
              know which one
            </div>
            <div className="text-xs">
              Another data is needed for the proof: the "external nullifier"
              which is used in order to prevent double signalling
            </div>
          </div>
        </div>
        <div className="flex">
          <BroadcastSignal />
          <div className="border border-black opacity-30 h-52 w-0.5 mx-8 mt-10" />
          <Signals />
        </div>
      </div>
    </div>
  );
}

type FormData = {
  signal: string;
  nullifier: number;
};

function BroadcastSignal() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const queryClient = useQueryClient();
  const { id, groupWrapper } = useConnectedSemaphore();
  const semaphoreContract = useSemaphoreContract();

  const [generatedProof, setGeneratedProof] = React.useState<
    (FullProof & { signal: string }) | null
  >(null);

  const proofMutation = useMutation(
    async ({ signal, nullifier }: FormData) => {
      if (!groupWrapper) {
        throw new Error('Oh no, it is broken :(');
      }
      const externalNullifier = Number(nullifier).toString();

      const proofWrapper = await generateProof(
        id,
        groupWrapper.group,
        externalNullifier,
        signal,
        {
          wasmFilePath: `${process.env.PUBLIC_URL}/semaphore.wasm`,
          zkeyFilePath: `${process.env.PUBLIC_URL}/semaphore.zkey`,
        },
      );

      return {
        ...proofWrapper,
        signal,
      };
    },
    {
      onSuccess: (data) => {
        setGeneratedProof(data);
      },
    },
  );

  const publishMutation = useMutation(
    async ({
      signal,
      publicSignals,
      proof,
    }: FullProof & { signal: string }) => {
      const bytes32Signal = ethers.utils.formatBytes32String(signal);

      await semaphoreContract.callStatic.verifyProof(
        GROUP_ID,
        bytes32Signal,
        publicSignals.nullifierHash,
        publicSignals.externalNullifier,
        packToSolidityProof(proof),
        {
          gasLimit: 500000,
        },
      );
      const tx = await semaphoreContract.verifyProof(
        GROUP_ID,
        bytes32Signal,
        publicSignals.nullifierHash,
        publicSignals.externalNullifier,
        packToSolidityProof(proof),
        {
          gasLimit: 500000,
        },
      );
      await tx.wait();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', { id: GROUP_ID }, 'signals']);
        reset();
      },
    },
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col items-center">
        <div>First, we need to generate the proof for a signal</div>
        <div className="text-sm mt-2">
          It proves that "I am a member of the group" and "I am the creator of
          both the signal and this proof"
        </div>
        <div className="text-sm mt-2">
          The external nullifier is chosen by you here, try to use twice the
          same
        </div>
        <form
          className="mt-4 flex items-end"
          onSubmit={handleSubmit((data) => proofMutation.mutate(data))}
        >
          <div className="flex flex-col">
            <label htmlFor="nullifer" className="text-sm">
              External nullifier
            </label>
            <input
              id="nullifer"
              placeholder="123456"
              className="mr-4 py-2 px-4 border border-black shadow rounded tracking-widest"
              {...register('nullifier', { required: true, min: 0 })}
              type="number"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="signal" className="text-sm">
              Message
            </label>
            <input
              id="signal"
              placeholder="sup"
              className="mr-4 py-2 px-4 border border-black shadow rounded tracking-widest"
              {...register('signal', { required: true, maxLength: 32 })}
            />
          </div>
          <Button
            status={proofMutation.status === 'loading' ? 'loading' : 'enabled'}
            type="submit"
          >
            Generate proof
          </Button>
        </form>
        <div className="mt-4">
          Once generated, we can verify this proof on chain, hence broadcasting
          the signal
        </div>
        <div>
          <div className="text-sm mt-2">
            You can use any address to publish the proof!
          </div>
          <div className="text-xs mt-2">
            In particular, a different address than the one used in the ID
            commitment is recommended
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="mr-6">
            {generatedProof ? (
              <GeneratedProof proof={generatedProof} />
            ) : (
              <div>No proof yet</div>
            )}
          </div>
          <Button
            onClick={() =>
              publishMutation.mutate(
                generatedProof as FullProof & { signal: string },
              )
            }
            status={
              !generatedProof
                ? 'disabled'
                : publishMutation.status === 'loading'
                ? 'loading'
                : 'enabled'
            }
          >
            Publish on chain
          </Button>
        </div>
        {publishMutation.error ? (
          <div className="text-red-500">
            Unable to broadcast the signal! Have you already used this external
            nullifier?
          </div>
        ) : null}
      </div>
    </div>
  );
}

type GeneratedProofProps = { proof: FullProof & { signal: string } };
function GeneratedProof({ proof }: GeneratedProofProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!show) return;
    const timeoutId = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(timeoutId);
  }, [show]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(proof));
    setShow(true);
  };

  return (
    <div className="relative">
      <div
        className="hover:cursor-pointer px-2 active:shadow-lg hover:shadow-md flex items-center"
        onClick={copyToClipboard}
      >
        <div className="mr-2">Proof generated</div>
        <BsCheckLg />
      </div>
      {show ? (
        <div className="absolute inset-y-full bottom-0 w-fit h-fit text-sm px-2 border-2 rounded border-current">
          Copied
        </div>
      ) : null}
    </div>
  );
}

function Signals() {
  const semaphoreContract = useSemaphoreContract();
  const query = useQuery(
    ['group', { id: GROUP_ID }, 'signals'],
    async () => {
      const events = await semaphoreContract.queryFilter(
        semaphoreContract.filters.ProofVerified(GROUP_ID),
      );
      const signals = events
        .map((e) => {
          const [, hexSignal] = e.args as [BigNumber, string];
          return {
            value: ethers.utils.parseBytes32String(hexSignal),
            transactionHash: e.transactionHash,
          };
        })
        .reverse();
      return signals;
    },
    {
      refetchInterval: 1000,
    },
  );
  return (
    <div className="mt-8">
      <div className="text-lg mb-6">Latest emitted signals:</div>
      <ul>
        {query.data?.map((signal) => {
          return (
            <li className="mb-4" key={signal.transactionHash}>
              - {signal.value}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SignalPage;
