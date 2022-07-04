import { useMetaMask } from 'metamask-react';
import { isNetworkSupported, Networks } from '../constants';

const DEFAULT_NETWORK_ID = Networks.Polygon;

export function useNetwork() {
  const { chainId, status } = useMetaMask();
  if (status === 'connected')
    return {
      chainId: Number(chainId),
      supported: isNetworkSupported(Number(chainId)),
    };
  return { chainId: DEFAULT_NETWORK_ID, supported: true };
}
