import { calcRuns, generateOverSummary } from "@/lib/utils";
import { EventType } from "@/types";
import { Team } from "@prisma/client";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function WormChart({
  ballEvents,
  teams,
}: {
  ballEvents: EventType[][];
  teams: Team[];
}) {
  const { overSummaries } = generateOverSummary(ballEvents[0]);
  const { overSummaries: overSummaries2 } = generateOverSummary(ballEvents[1]);

  const team1Data = overSummaries.map((summary) => calcRuns(summary));
  const team2Data = overSummaries2.map((summary) => calcRuns(summary));

  const combineData = (team1Data: number[], team2Data: number[]) => {
    const maxOvers = Math.max(team1Data.length, team2Data.length);
    const data = [];

    let team1Total = 0;
    let team2Total = 0;

    for (let i = 0; i < maxOvers; i++) {
      const team1Runs = i < team1Data.length ? team1Data[i] : null;
      const team2Runs = i < team2Data.length ? team2Data[i] : null;

      if (team1Runs !== null) {
        team1Total += team1Runs;
      }

      if (team2Runs !== null) {
        team2Total += team2Runs;
      }

      data.push({
        over: i + 1,
        [teams[0].name]: team1Runs !== null ? team1Total : null,
        [teams[1].name]: team2Runs !== null ? team2Total : null,
      });
    }

    return data;
  };

  const chartData = [
    {
      over: "",
      [teams[0].name]: 0,
      [teams[1].name]: 0,
    },
    ...combineData(team1Data, team2Data),
  ];

  return (
    <div className="h-96 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={800}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="over" />
          <YAxis />
          <Tooltip wrapperClassName="!bg-background !border-muted rounded-md" />
          <Legend />
          <Line
            type="monotone"
            dataKey={teams[0].name}
            stroke="#8884d8"
            strokeWidth={6}
          />
          <Line
            type="monotone"
            dataKey={teams[1].name}
            stroke="#82ca9d"
            strokeWidth={6}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WormChart;
