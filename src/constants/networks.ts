export enum Networks {
  Mainnet = 1, // 0x1
  // Test nets
  Goerli = 5, // 0x5
  Ropsten = 3, // 0x3
  Rinkeby = 4, // 0x4
  Kovan = 42, // 42 0x2a
  Mumbai = 80001, // 0x13881
  // Layers 2
  Arbitrum = 42161, // 0xa4b1
  Optimism = 10, // 0xa
  // Side chains
  Polygon = 137, // 0x89
  GnosisChain = 100, // 0x64
  // Alt layer 1
  BinanceSmartChain = 56, // 0x38
  Avalanche = 43114, // 0xa86a
  Cronos = 25, // 0x19
  Fantom = 250, // 0xfa
}

export const SUPPORTED_NETWORK = Networks.Goerli;

export function isNetworkSupported(chainId: number) {
  return chainId === SUPPORTED_NETWORK;
}

export function getNetworkName(chainId: number) {
  const network = Networks[chainId];
  if (!network) return null;
  return network;
}
