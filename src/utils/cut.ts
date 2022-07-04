export function cutHexString(str: string) {
  return `${str.substring(0, 6)}...${str.substring(
    str.length - 4,
    str.length,
  )}`;
}
