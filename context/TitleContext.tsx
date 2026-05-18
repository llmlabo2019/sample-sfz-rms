'use client';
import { createContext, useContext, useState } from 'react';

const TitleContext = createContext({
  titleName: '',
  setTitleName: (title: string) => {},
});

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [titleName, setTitleName] = useState('');

  return (
    <TitleContext.Provider value={{ titleName, setTitleName }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => useContext(TitleContext);
