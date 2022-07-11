import { ethers } from 'ethers';
import { Identity } from '@semaphore-protocol/identity';
import { ImBin } from 'react-icons/im';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useConnectedMetaMask, useMetaMask } from 'metamask-react';
import { useMutation } from 'react-query';
import { Link } from '@tanstack/react-location';
import { useSemaphore } from '../providers/semaphore.provider';
import Button from '../components/button';
import HexShow from '../components/hex-show';
import { bigIntToHex } from '../utils';

type BadgeProps = {
  className?: string;
};
function PrivateBadge({ className }: BadgeProps) {
  return (
    <div
      className={`${className} text-red-600 border-2 border-current rounded-lg px-2 mx-auto`}
    >
      private part
    </div>
  );
}
function PublicBadge({ className }: BadgeProps) {
  return (
    <div
      className={`${className} text-green-600 border-2 border-current rounded-lg px-2 mx-auto`}
    >
      public part
    </div>
  );
}

function IdentityPage() {
  const { status, connect } = useMetaMask();
  const { id } = useSemaphore();

  return (
    <div className="w-full px-16 pt-2 pb-8">
      <Link className="hover:underline hover:underline-offset-2" to="/">
        {'<-'} Back to home
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-8">Stop #1 - Identity</div>
        <div className="px-8 py-4 border-2 rounded border-current shadow-md max-w-lg flex flex-col text-sm">
          <h1 className="text-lg mb-4">What is an identity in Semaphore?</h1>
          <div className="mb-4 flex justify-between">
            <div className="flex flex-col">
              <PrivateBadge className="mb-4 text-sm" />
              <div className="font-bold mb-2">"Trapdoor"</div>
              <div className="font-bold">+ "Nullifier"</div>
            </div>
            <div className="flex flex-col items-center">
              <PrivateBadge className="mb-6 invisible" />
              <div className="text-sm">Derive</div>
              <FaLongArrowAltRight className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <PublicBadge className="mb-6 text-md" />
              <div className="font-bold">"Commitment"</div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center max-w-3xl">
          <div className="text-lg">
            A Semaphore identity can be randomly or deterministically generated:
          </div>
          <div className="mt-4">
            In this demonstration, we'll generate an identity from our Ethereum
            wallet
          </div>
          <div className="mt-2 text-sm">
            One way to do that is to sign a message, hash the signature and use
            this result as the generator of the identity
          </div>
          <div className="mt-6">
            {status === 'connected' ? (
              <UserId />
            ) : (
              <Button
                onClick={connect}
                status={
                  status === 'connecting'
                    ? 'loading'
                    : status === 'unavailable'
                    ? 'disabled'
                    : 'enabled'
                }
              >
                Connect
              </Button>
            )}
          </div>
          {Boolean(id) ? (
            <Link
              to="/group"
              className="mt-8 self-center hover:underline hover:underline-offset-2 text-lg"
            >
              Second stop: Group {'->'}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UserId() {
  const { id, clearIdentity } = useSemaphore();

  if (!id) return <GenerateId />;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center text-sm">
        <div className="mr-6 text-lg">Generated ID:</div>
        <div>
          <div className="flex">
            <div className="text-red-600 mr-2">Trapdoor: </div>
            <HexShow value={bigIntToHex(id.getTrapdoor())} />
          </div>
          <div className="flex">
            <div className="text-red-600 mr-2">Nullifier: </div>
            <HexShow value={bigIntToHex(id.getNullifier())} />
          </div>
          <div className="flex">
            <div className="text-green-600 mr-2">Derived commitment: </div>
            <HexShow value={bigIntToHex(id.generateCommitment())} />
          </div>
        </div>
        <Button
          onClick={() => clearIdentity()}
          status="enabled"
          className="ml-8"
        >
          <ImBin />
        </Button>
      </div>
      <div className="mt-4">
        Your Ethereum address has been used in order to generate the identity
        that will be used accross the app
      </div>
      <div className="mt-2">
        But there is actually no need to use this address for the transactions
        to come, you are free, and invited, to use any address from now on
      </div>
    </div>
  );
}

function GenerateId() {
  const { ethereum } = useConnectedMetaMask();
  const { setIdentity } = useSemaphore();

  const { mutate, status } = useMutation(
    async () => {
      const message = 'One baguette per day is good';
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const signedMessage = await signer.signMessage(message);
      const address = await signer.getAddress();
      return {
        id: new Identity(signedMessage),
        idArguments: { message, address },
      };
    },
    {
      onSuccess: (data) => {
        setIdentity({ id: data.id, idArguments: data.idArguments });
      },
    },
  );

  return (
    <Button
      onClick={() => mutate()}
      status={status === 'loading' ? 'loading' : 'enabled'}
      className="ml-8"
    >
      Generate ID
    </Button>
  );
}

export default IdentityPage;
