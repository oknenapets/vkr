import { ReactNode, createContext, useState } from "react";

type ContextType = {
  name: string;
  setName: (name: string) => void;
};

const contextDefaultValue: ContextType = {
  name: Date.now().toString(),
  setName: () => {},
};

export const GlobalContext = createContext<ContextType>(contextDefaultValue);

export const GlobalContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [name, setName] = useState<string>(contextDefaultValue.name);

  return (
    <GlobalContext.Provider value={{ name, setName }}>
      {children}
    </GlobalContext.Provider>
  );
};
