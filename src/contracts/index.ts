import * as React from 'react';
import { MultiNetworkContractStore } from 'contract-store';
import { ethers } from 'ethers';
import {
  SEMAPHORE_ABI,
  SEMAPHORE_ADDRESS,
  SEMAPHORE_DEMO_ABI,
  SEMAPHORE_DEMO_ADDRESS,
  SUPPORTED_NETWORK,
} from '../constants';
import { useWalletSigner } from './wallet-signer';

export * from './providers';
export * from './network';
export * from './wallet-signer';

export const contractStore = new MultiNetworkContractStore([SUPPORTED_NETWORK]);

contractStore.registerContract(SUPPORTED_NETWORK, 'SEMAPHORE_DEMO', {
  abi: SEMAPHORE_DEMO_ABI,
  address: SEMAPHORE_DEMO_ADDRESS,
});

contractStore.registerContract(SUPPORTED_NETWORK, 'SEMAPHORE', {
  abi: SEMAPHORE_ABI,
  address: SEMAPHORE_ADDRESS,
});

export function useSemaphoreDemoContract() {
  const { signer } = useWalletSigner();
  return React.useMemo(() => {
    const semaphoreDemoContractArtifacts = contractStore.getContract(
      SUPPORTED_NETWORK,
      'SEMAPHORE_DEMO',
    );
    return new ethers.Contract(
      semaphoreDemoContractArtifacts.address,
      semaphoreDemoContractArtifacts.abi,
      signer,
    );
  }, [signer]);
}

export function useSemaphoreContract() {
  const { signer } = useWalletSigner();
  return React.useMemo(() => {
    const semaphoreDemoContractArtifacts = contractStore.getContract(
      SUPPORTED_NETWORK,
      'SEMAPHORE',
    );
    return new ethers.Contract(
      semaphoreDemoContractArtifacts.address,
      semaphoreDemoContractArtifacts.abi,
      signer,
    );
  }, [signer]);
}
