import * as React from 'react';

type ButtonProps = {
  onClick?: () => unknown;
  status: 'enabled' | 'loading' | 'disabled';
  className?: string;
  type?: 'submit' | 'button';
  children: React.ReactNode;
};
function Button({ onClick, status, type, className, children }: ButtonProps) {
  const baseClassName =
    'py-2 px-4 border border-black font-semibold shadow rounded hover:outline hover:outline-1 hover:outline-slate-400 hover:cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:border-gray-500 disabled:text-gray-500';

  const [width, setWidth] = React.useState<null | number>(null);

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (status === 'loading') return;
    setWidth((w) => {
      if (w) return w;
      if (!ref.current) return w;
      return ref.current.offsetWidth + 1;
    });
  }, [status]);

  const style = width ? { width } : {};

  return (
    <button
      ref={ref}
      style={style}
      className={`${className} ${baseClassName}`}
      onClick={onClick}
      type={type || 'button'}
      disabled={status === 'disabled' || status === 'loading'}
    >
      {status === 'loading' ? 'Loading...' : children}
    </button>
  );
}

export default Button;
