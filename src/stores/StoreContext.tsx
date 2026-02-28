import { createContext, ReactNode, useContext } from 'react';
import rootStore from './RootStore';

// Create the context
const StoreContext = createContext(rootStore);

// Provider component
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store
export const useStore = () => useContext(StoreContext);

// Specialized hooks for each store
export const useHabitStore = () => useContext(StoreContext).habitStore;
export const useCheckInStore = () => useContext(StoreContext).checkInStore;
export const useLifeMomentStore = () => useContext(StoreContext).lifeMomentStore;
export const useTaskStore = () => useContext(StoreContext).taskStore;
export const useIdeaStore = () => useContext(StoreContext).ideaStore;
export const useRelationshipStore = () => useContext(StoreContext).relationshipStore;
export const useUIStore = () => useContext(StoreContext).uiStore;