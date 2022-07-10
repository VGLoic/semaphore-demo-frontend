import * as React from 'react';
import { contractStore } from 'semaphore-demo-contracts';
import { ethers } from 'ethers';
import { SUPPORTED_NETWORK } from '../constants';
import { useWalletSigner } from './wallet-signer';

export * from './providers';
export * from './network';
export * from './wallet-signer';

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
