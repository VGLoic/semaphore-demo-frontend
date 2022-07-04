import { ethers } from 'ethers';
import { Networks } from '../constants';

const infuraKey = 'dc300b0f9d1c4f4eb48f997ca37336d3';

export const providers: Record<number, ethers.providers.StaticJsonRpcProvider> =
  {
    [Networks.Mainnet]: new ethers.providers.StaticJsonRpcProvider(
      `https://mainnet.infura.io/v3/${infuraKey}`,
      Networks.Mainnet,
    ),
    [Networks.Polygon]: new ethers.providers.StaticJsonRpcProvider(
      `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
      Networks.Polygon,
    ),
  };

export const mainnetProvider = providers[Networks.Mainnet];

export function getProvider(chainId: number) {
  const provider = providers[chainId];
  if (!provider) {
    throw new Error(`Provider for chain ID ${chainId} not configured!`);
  }
  return provider;
}
