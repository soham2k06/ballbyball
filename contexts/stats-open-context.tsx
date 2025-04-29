"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

import { addAnalytics } from "@/lib/actions/app-analytics";

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
    if (o)
      addAnalytics({
        event: "click",
        module: "scorer",
        property: "btn-scorecard",
      });
    setShowScorecard(o);
  }

  function handleShowRunrateChart(o: boolean) {
    if (o)
      addAnalytics({
        event: "click",
        module: "scorer",
        property: "btn-runrate_chart",
      });
    setShowRunrateChart(o);
  }

  function handleShowOverSummaries(o: boolean) {
    if (o)
      addAnalytics({
        event: "click",
        module: "scorer",
        property: "btn-over_summaries",
      });
    setShowOverSummaries(o);
  }

  function handleShowWormChart(o: boolean) {
    if (o)
      addAnalytics({
        event: "click",
        module: "scorer",
        property: "btn-worm_chart",
      });
    setShowWormChart(o);
  }

  function handleShowPlayerRivalries(o: boolean) {
    if (o)
      addAnalytics({
        event: "click",
        module: "scorer",
        property: "btn-player_rivalries",
      });
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
