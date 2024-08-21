import { generateOverSummary, getScore } from "@/lib/utils";
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
import { Card, CardContent, CardTitle } from "../ui/card";

function WormChart({
  ballEvents,
  teams,
  totalOvers,
}: {
  ballEvents: EventType[][];
  teams: Team[];
  totalOvers: number;
}) {
  const { overSummaries } = generateOverSummary(ballEvents[0]);
  const { overSummaries: overSummaries2 } = generateOverSummary(ballEvents[1]);

  const team1Score = overSummaries.map((summary) => {
    const { runs, wickets } = getScore(summary);
    return {
      runs,
      wickets,
    };
  });
  const team2Score = overSummaries2.map((summary) => {
    const { runs, wickets } = getScore(summary);
    return {
      runs,
      wickets,
    };
  });

  const combineData = (
    team1Score: { runs: number; wickets: number }[],
    team2Score: { runs: number; wickets: number }[],
    totalOvers: number,
  ) => {
    const data = [];

    let team1TotalRuns = 0;
    let team2TotalRuns = 0;

    let team1TotalWickets = 0;
    let team2TotalWickets = 0;

    for (let i = 0; i < totalOvers; i++) {
      const aggrTeam1Score = i < team1Score.length ? team1Score[i] : null;
      const aggrTeam2Runs = i < team2Score.length ? team2Score[i] : null;

      if (aggrTeam1Score !== null) {
        team1TotalRuns += aggrTeam1Score.runs;
        team1TotalWickets += aggrTeam1Score.wickets;
      }

      if (aggrTeam2Runs !== null) {
        team2TotalRuns += aggrTeam2Runs.runs;
        team2TotalWickets += aggrTeam2Runs.wickets;
      }

      data.push({
        over: i + 1,
        [teams[0].name]: aggrTeam1Score !== null ? team1TotalRuns : null,
        [teams[1].name]: aggrTeam2Runs !== null ? team2TotalRuns : null,
        wickets: {
          [teams[0].name]: team1TotalWickets,
          [teams[1].name]: team2TotalWickets,
        },
      });
    }

    return data;
  };

  const chartData = [
    {
      over: "",
      [teams[0].name]: 0,
      [teams[1].name]: 0,
      wickets: {
        [teams[0].name]: 0,
        [teams[1].name]: 0,
      },
    },
    ...combineData(team1Score, team2Score, totalOvers),
  ];

  const CustomDot1 = (props: JSX.Element["props"]) => {
    const { cx, cy, index } = props;
    if (
      chartData[index].wickets?.[teams[0].name] >
      chartData[index - 1]?.wickets?.[teams[0].name]
    )
      return <circle cx={cx} cy={cy} r={6} fill="#605cbd" />;
    else return null;
  };

  const CustomDot2 = (props: JSX.Element["props"]) => {
    const { cx, cy, index } = props;

    if (
      chartData[index].wickets?.[teams[1].name] >
      chartData[index - 1]?.wickets?.[teams[1].name]
    )
      return <circle cx={cx} cy={cy} r={6} fill="#467055" />;
    else return null;
  };

  return (
    <div className="h-96 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={800}
          height={400}
          data={chartData}
          margin={{ top: 20, left: -32, bottom: 5 }}
        >
          <XAxis
            dataKey="over"
            tickLine={false}
            fontSize={12}
            stroke="hsla(var(--muted-foreground) / 0.75)"
          />
          <YAxis
            tickLine={false}
            fontSize={12}
            stroke="hsla(var(--muted-foreground) / 0.75)"
          />
          <Tooltip
            cursor={{
              style: { stroke: "hsla(var(--muted-foreground) / 0.5)" },
            }}
            content={({ payload, label }) => {
              const wickets = payload?.map(
                (payload) => payload.payload.wickets,
              )[0];

              return (
                <Card>
                  <CardContent>
                    <CardTitle className="mb-2 text-lg">Over {label}</CardTitle>
                    <div className="text-sm font-semibold text-muted-foreground">
                      {payload?.[0] && (
                        <>
                          {payload?.[0].name} {payload?.[0].value}/
                          {wickets?.[payload?.[0].name || ""]}
                        </>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">
                      {payload?.[1] && (
                        <>
                          {payload?.[1].name} {payload?.[1].value}/
                          {wickets?.[payload?.[1]?.name || ""]}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, left: 0 }} />
          <Line
            strokeLinecap="round"
            type="monotone"
            dataKey={teams[0].name}
            stroke="#8884d8"
            strokeWidth={6}
            dot={<CustomDot1 />}
          />
          <Line
            strokeLinecap="round"
            type="monotone"
            dataKey={teams[1].name}
            stroke="#82ca9d"
            strokeWidth={6}
            dot={<CustomDot2 />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WormChart;
