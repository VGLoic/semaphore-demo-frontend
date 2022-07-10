import { useConnectedMetaMask, useMetaMask } from 'metamask-react';
import * as React from 'react';
import { useQuery } from 'react-query';
import { getNetworkName, SUPPORTED_NETWORK } from '../constants';
import { mainnetProvider, useNetwork } from '../contracts';
import Button from './button';

type LayoutProps = {
  children: React.ReactElement;
};
export default function Layout({ children }: LayoutProps) {
  const { supported } = useNetwork();

  return (
    <div
      className="h-screen bg-cover bg-no-repeat overflow-auto"
      style={{ backgroundImage: 'url("/images/background.jpeg")' }}
    >
      <div className="flex justify-between items-center px-16 py-8">
        <h1 className="text-2xl">Semaphore Demo</h1>
        <div className="flex items-center justify-end w-64">
          <Network />
          <ConnectButton />
        </div>
      </div>
      <div className="flex justify-center">
        {supported ? children : <WrongNetwork />}
      </div>
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
