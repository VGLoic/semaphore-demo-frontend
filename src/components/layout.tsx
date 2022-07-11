import { useConnectedMetaMask, useMetaMask } from 'metamask-react';
import * as React from 'react';
import { useQuery } from 'react-query';
import { SiGithub } from 'react-icons/si';
import { ImBin } from 'react-icons/im';
import { GiCancel } from 'react-icons/gi';
import { getNetworkName, SUPPORTED_NETWORK } from '../constants';
import { mainnetProvider, useNetwork } from '../contracts';
import Button from './button';
import {
  useConnectedSemaphore,
  useSemaphore,
} from '../providers/semaphore.provider';
import { bigIntToHex, cutHexString } from '../utils';
import HexShow from './hex-show';

type LayoutProps = {
  children: React.ReactElement;
};
export default function Layout({ children }: LayoutProps) {
  const { supported } = useNetwork();
  const { id } = useSemaphore();

  return (
    <div
      className="h-screen bg-cover bg-no-repeat overflow-auto"
      style={{ backgroundImage: 'url("/images/background.jpeg")' }}
    >
      <div className="flex justify-between items-center px-16 py-8">
        <h1 className="text-2xl">Semaphore Demo</h1>
        <div className="flex flex-1 items-center justify-end w-72">
          {Boolean(id) ? <SemaphoreId /> : null}
          <Network />
          <ConnectButton />
          <a
            className="ml-12 text-3xl hover:cursor-pointer"
            href="https://github.com/VGLoic/semaphore-demo-frontend"
          >
            <SiGithub />
          </a>
        </div>
      </div>
      <div className="flex justify-center">
        {supported ? children : <WrongNetwork />}
      </div>
    </div>
  );
}

function SemaphoreId() {
  const { id, idArguments, clearIdentity } = useConnectedSemaphore();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative mx-auto">
      <Button
        status="enabled"
        className="border-green-800 text-green-800 shadow-inner shadow-xl border-2"
        onClick={() => setOpen((o) => !o)}
      >
        {cutHexString(bigIntToHex(id.generateCommitment()))}
      </Button>
      {open ? (
        <div
          style={{ backgroundImage: 'url("/images/background.jpeg")' }}
          className=" drop-shadow-2xl absolute mt-8 inset-y-full w-80 h-fit px-6 py-4 border-2 rounded border-current bg-cover bg-no-repeat"
        >
          <div className="flex justify-between">
            <div>Identity</div>
            <Button status="enabled" onClick={() => setOpen(false)}>
              <GiCancel />
            </Button>
          </div>
          <div className="text-sm mt-4">
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
          <div className="mt-4 mb-4 w-1/2 mx-auto border border-black" />
          <div>Generated from</div>
          <div className="text-sm mt-4">
            <div>Address: {cutHexString(idArguments.address)}</div>
            <div>Message: "{idArguments.message}"</div>
          </div>
          <div className="mt-4 mb-4 w-1/2 mx-auto border border-black" />
          <div className="text-center">
            <Button onClick={() => clearIdentity()} status="enabled">
              <ImBin />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConnectButton() {
  const { status, connect } = useMetaMask();

  if (status === 'initializing') return null;

  if (status === 'unavailable') return null;

  if (status === 'connected') return <Account />;

  return (
    <Button
      onClick={connect}
      status={status === 'connecting' ? 'loading' : 'enabled'}
    >
      Connect
    </Button>
  );
}

function Account() {
  const { account } = useConnectedMetaMask();

  const ensQuery = useQuery(
    ['ens', { account }],
    () => mainnetProvider.lookupAddress(account),
    {
      staleTime: Infinity,
    },
  );

  if (ensQuery.data) {
    return <div>{ensQuery.data}</div>;
  }

  return (
    <div>
      {account.substring(0, 5)}...
      {account.substring(account.length - 3, account.length)}
    </div>
  );
}

function Network() {
  const { chainId, supported } = useNetwork();
  const networkName = getNetworkName(chainId) || 'Unknown';
  return (
    <div className={`mr-16 ${!supported ? 'text-red-500' : undefined}`}>
      {networkName}
    </div>
  );
}

function WrongNetwork() {
  const { ethereum } = useMetaMask();

  const switchNetwork = () =>
    ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${SUPPORTED_NETWORK.toString(16)}` }],
    });

  return (
    <div className="p-16 flex flex-col items-center justify-center w-full">
      <div className="text-xl mb-8">The current network is not supported</div>
      <div className="mb-8">
        Switch to a supported network in order to discover the demo
      </div>
      <div className="flex">
        <Button onClick={switchNetwork} status="enabled">
          {getNetworkName(SUPPORTED_NETWORK)}
        </Button>
      </div>
    </div>
  );
}
