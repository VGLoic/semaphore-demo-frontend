import * as React from 'react';
import { useConnectedMetaMask } from "metamask-react";
import { ethers } from 'ethers';

export function useWalletSigner() {
    const { ethereum } = useConnectedMetaMask();
    const signer = React.useMemo(() => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        return provider.getSigner();
    }, [ethereum]);
    return { signer };
}