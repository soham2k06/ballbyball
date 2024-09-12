"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type SetOpenType = Dispatch<SetStateAction<boolean>>;

interface StatsOpenContextProps {
  showRunrateChart: boolean;
  setShowRunrateChart: SetOpenType;
  showOverSummaries: boolean;
  setShowOverSummaries: SetOpenType;
  showWormChart: boolean;
  setShowWormChart: SetOpenType;
  showComments: boolean;
  setShowComments: SetOpenType;
}

const StatsOpenContext = createContext<StatsOpenContextProps>({
  showRunrateChart: false,
  showOverSummaries: false,
  showWormChart: false,
  showComments: false,
  setShowRunrateChart: () => {},
  setShowOverSummaries: () => {},
  setShowWormChart: () => {},
  setShowComments: () => {},
});

function StatsOpenProvider({ children }: { children: React.ReactNode }) {
  const [showRunrateChart, setShowRunrateChart] = useState(false);
  const [showOverSummaries, setShowOverSummaries] = useState(false);
  const [showWormChart, setShowWormChart] = useState(false);

  const [showComments, setShowComments] = useState(false);

  return (
    <StatsOpenContext.Provider
      value={{
        showRunrateChart,
        setShowRunrateChart,
        showOverSummaries,
        setShowOverSummaries,
        showWormChart,
        setShowWormChart,
        showComments,
        setShowComments,
      }}
    >
      {children}
    </StatsOpenContext.Provider>
  );
}

function useStatsOpenContext() {
  const context = useContext(StatsOpenContext);
  if (context === undefined)
    throw new Error("StatsOpenContext is used outside StatsOpenProvider");
  return context;
}

export { StatsOpenProvider, useStatsOpenContext };
