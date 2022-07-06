import { MultiNetworkContractStore } from 'contract-store';
import { SEMAPHORE_ABI, SEMAPHORE_ADDRESS, SEMAPHORE_DEMO_ABI, SEMAPHORE_DEMO_ADDRESS, SUPPORTED_NETWORK } from '../constants';

export * from './providers';
export * from './network';
export * from './wallet-signer';

export const contractStore = new MultiNetworkContractStore([SUPPORTED_NETWORK])

contractStore.registerContract(
    SUPPORTED_NETWORK,
    "SEMAPHORE_DEMO",
    {
        abi: SEMAPHORE_DEMO_ABI,
        address: SEMAPHORE_DEMO_ADDRESS
    }
);

contractStore.registerContract(
    SUPPORTED_NETWORK,
    "SEMAPHORE",
    {
        abi: SEMAPHORE_ABI,
        address: SEMAPHORE_ADDRESS
    }
);