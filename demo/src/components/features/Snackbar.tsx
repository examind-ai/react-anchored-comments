import { useEffect, useState } from 'react';

type SnackbarProps = {
  message: string;
  show: boolean;
};

const Snackbar = ({ message, show }: SnackbarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 transform rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800 shadow-lg transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Snackbar;
