export * from './cut';

export function bigIntToHex(i: bigint) {
  return `0x${i.toString(16)}`;
}
