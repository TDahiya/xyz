import React, { createContext, useContext, useState } from 'react';

type DriverContextType = {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
};

const DriverContext = createContext<DriverContextType>({
  isOnline: false,
  setIsOnline: () => {},
});

export const useDriver = () => useContext(DriverContext);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <DriverContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </DriverContext.Provider>
  );
}
