import React, {ReactNode, useState} from 'react';

type Props = {
  children?: ReactNode[];
  className?: string;
  onClick: any;
  toast: string;
};

const ToastButton = ({children,className,onClick,toast}: Props): JSX.Element => {
  const [text, setText] = useState<string | null>(null);

  const showToast = (e: React.MouseEvent): void => {
    setText(toast);
    setTimeout(() => setText(null), 1000);
  }

  return (
    <div onClick={showToast}>
      <button className={className}
              onClick={onClick}>
        {text !== null && text || children}
      </button>
    </div>
  );
}

export default ToastButton