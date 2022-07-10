import { ethers } from 'ethers';
import { Identity } from '@semaphore-protocol/identity';
import * as React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { ImBin } from 'react-icons/im';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useConnectedMetaMask, useMetaMask } from 'metamask-react';
import { useMutation } from 'react-query';
import { cutHexString } from '../utils';
import { Link } from '@tanstack/react-location';
import { useSemaphore } from '../providers/semaphore.provider';
import Button from '../components/button';

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

type HexShowProps = {
  value: string;
};
function HexShow({ value }: HexShowProps) {
  const [show, setShow] = React.useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setShow(true);
  };
  React.useEffect(() => {
    if (!show) return;
    const timeoutId = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(timeoutId);
  }, [show]);

  return (
    <div className="relative">
      <div
        className="hover:cursor-pointer px-2 active:shadow-lg hover:shadow-md"
        onClick={copyToClipboard}
      >
        {cutHexString(value)}
      </div>
      {show ? (
        <div className="absolute inset-x-full top-0 w-fit text-sm px-2 border-2 rounded border-current">
          Copied
        </div>
      ) : null}
    </div>
  );
}

function bigIntToHex(i: bigint) {
  return `0x${i.toString(16)}`;
}

function IdentityPage() {
  const { status, connect } = useMetaMask();
  const { id } = useSemaphore();

  const [randomId, setRandomId] = React.useState(() => {
    const randomMessage = Math.floor(Math.random() * 10000000).toString();
    const id = new Identity(randomMessage);
    return id;
  });

  const regenRandomId = () => {
    const id = new Identity();
    setRandomId(id);
  };

  return (
    <div className="w-full px-16 py-8">
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
              <div className="text-xs">Derive</div>
              <FaLongArrowAltRight className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <PublicBadge className="mb-6 text-md" />
              <div className="font-bold">"Commitment"</div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <div className="text-lg mr-8 flex-2">
            A Semaphore identity can be randomly generated:
          </div>
          <div className="flex-1 flex items-center text-sm">
            <div>
              <div className="flex">
                <div className="text-red-600 mr-2">Trapdoor: </div>
                <HexShow value={bigIntToHex(randomId.getTrapdoor())} />
              </div>
              <div className="flex">
                <div className="text-red-600 mr-2">Nullifier: </div>
                <HexShow value={bigIntToHex(randomId.getNullifier())} />
              </div>
              <div className="flex">
                <div className="text-green-600 mr-2">Derived commitment: </div>
                <HexShow value={bigIntToHex(randomId.generateCommitment())} />
              </div>
            </div>
            <Button onClick={regenRandomId} status="enabled" className="ml-8">
              <BiRefresh />
            </Button>
          </div>
        </div>
        <div className="border border-black opacity-30 w-1/2 mt-8" />
        <div className="mt-8 flex justify-between items-center">
          <div className="mr-8 flex-1">
            <div className="text-lg">
              Or it can be deterministically generated:
            </div>
            <div className="mt-4 text-sm">
              Signing a message with a wallet and hashing it is a deterministic
              way to generate an ID linked to a wallet
            </div>
          </div>
          <div className="flex-1">
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
  );
}

function UserId() {
  const { id, setId } = useSemaphore();

  if (!id) return <GenerateId />;

  return (
    <div className="flex-1 flex items-center text-sm">
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
      <Button onClick={() => setId(null)} status="enabled" className="ml-8">
        <ImBin />
      </Button>
    </div>
  );
}

function GenerateId() {
  const { ethereum } = useConnectedMetaMask();
  const { setId } = useSemaphore();

  const { mutate, status } = useMutation(
    async () => {
      const message = "Mais oui François, t'es beau";
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const signedMessage = await signer.signMessage(message);
      return { id: new Identity(signedMessage) };
    },
    {
      onSuccess: (data) => {
        setId(data.id);
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
