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
  showScorecard: boolean;
  showRunrateChart: boolean;
  showOverSummaries: boolean;
  showWormChart: boolean;
  showDetails: boolean;
  showPlayerRivalries: boolean;

  setShowDetails: SetOpenType;
  // eslint-disable-next-line no-unused-vars
  handleShowScorecard: (o: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleShowRunrateChart: (o: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleShowOverSummaries: (o: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleShowWormChart: (o: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleShowPlayerRivalries: (o: boolean) => void;
}

const StatsOpenContext = createContext<StatsOpenContextProps>({
  showScorecard: false,
  showRunrateChart: false,
  showOverSummaries: false,
  showWormChart: false,
  showDetails: false,
  showPlayerRivalries: false,

  setShowDetails: () => {},
  handleShowScorecard: () => {},
  handleShowRunrateChart: () => {},
  handleShowOverSummaries: () => {},
  handleShowWormChart: () => {},
  handleShowPlayerRivalries: () => {},
});

function StatsOpenProvider({ children }: { children: React.ReactNode }) {
  const [showScorecard, setShowScorecard] = useState(false);
  const [showRunrateChart, setShowRunrateChart] = useState(false);
  const [showOverSummaries, setShowOverSummaries] = useState(false);
  const [showWormChart, setShowWormChart] = useState(false);
  const [showPlayerRivalries, setShowPlayerRivalries] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  function handleShowScorecard(o: boolean) {
    setShowScorecard(o);
  }

  function handleShowRunrateChart(o: boolean) {
    setShowRunrateChart(o);
  }

  function handleShowOverSummaries(o: boolean) {
    setShowOverSummaries(o);
  }

  function handleShowWormChart(o: boolean) {
    setShowWormChart(o);
  }

  function handleShowPlayerRivalries(o: boolean) {
    setShowPlayerRivalries(o);
  }

  return (
    <StatsOpenContext.Provider
      value={{
        showScorecard,
        showRunrateChart,
        showOverSummaries,
        showWormChart,
        showDetails,
        showPlayerRivalries,

        setShowDetails,
        handleShowScorecard,
        handleShowRunrateChart,
        handleShowOverSummaries,
        handleShowWormChart,
        handleShowPlayerRivalries,
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
