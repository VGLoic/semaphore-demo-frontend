import * as React from 'react';
import { cutHexString } from '../utils';

type HexShowProps = {
  value: string;
};
function HexShow({ value }: HexShowProps) {
  const [show, setShow] = React.useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setShow(true);
  };
  React.useEffect(() => {
    if (!show) return;
    const timeoutId = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(timeoutId);
  }, [show]);

  return (
    <div className="relative">
      <div
        className="hover:cursor-pointer px-2 active:shadow-lg hover:shadow-md"
        onClick={copyToClipboard}
      >
        {cutHexString(value)}
      </div>
      {show ? (
        <div className="absolute inset-x-full top-0 w-fit text-sm px-2 border-2 rounded border-current">
          Copied
        </div>
      ) : null}
    </div>
  );
}

export default HexShow;
