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

import { calcRuns, getIsvalidBall, getOverStr, getScore } from "@/lib/utils";
import { EventType } from "@/types";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

function WormChart({
  ballEvents,
  teams,
  totalOvers,
}: {
  ballEvents: EventType[][];
  teams: Team[];
  totalOvers: number;
}) {
  const adjustExtras = (events: string[]): string[] => {
    const adjustedEvents: string[] = [];

    let consicutiveExtras = 0;

    events.forEach((event) => {
      let curBallRun = 0;

      const isExtra = !getIsvalidBall(event);

      if (isExtra) {
        const extraRuns = calcRuns([event]);
        consicutiveExtras += extraRuns;
        return;
      }

      const isWicket = event.includes("-1");
      const run = calcRuns([event]);

      curBallRun += run + consicutiveExtras;

      adjustedEvents.push(
        isWicket ? "-1_x_x_" + consicutiveExtras : curBallRun.toString(),
      );
      consicutiveExtras = 0;
    });

    return adjustedEvents;
  };

  const adjustBallEvents1 = adjustExtras(ballEvents[0]);
  const adjustBallEvents2 = adjustExtras(ballEvents[1]);

  const combineData = () => {
    const data = [];

    let team1TotalRuns = 0;
    let team2TotalRuns = 0;

    let team1TotalWickets = 0;
    let team2TotalWickets = 0;

    const maxBalls = Math.max(
      adjustBallEvents1.length,
      adjustBallEvents2.length,
      totalOvers * 6,
    );

    for (let i = 0; i < maxBalls; i++) {
      const curEvent1 = adjustBallEvents1?.[i];
      const curEvent2 = adjustBallEvents2?.[i];

      const score1 = curEvent1
        ? parseInt(curEvent1) >= 10
          ? { ...getScore({ balls: [curEvent1] }), runs: parseInt(curEvent1) }
          : getScore({ balls: [curEvent1] })
        : null;
      const score2 = curEvent2
        ? parseInt(curEvent2) >= 10
          ? { ...getScore({ balls: [curEvent2] }), runs: parseInt(curEvent2) }
          : getScore({ balls: [curEvent2] })
        : null;

      if (score1 !== null) {
        team1TotalRuns += score1.runs;
        team1TotalWickets += score1.wickets;
      }

      if (score2 !== null) {
        team2TotalRuns += score2.runs;
        team2TotalWickets += score2.wickets;
      }

      data.push({
        over: (i + 1) % 6 === 0 ? (i + 1) / 6 : "",
        overStr: getOverStr(i + 1, true),
        [teams[0].name]: score1 !== null ? team1TotalRuns : null,
        [teams[1].name]: score2 !== null ? team2TotalRuns : null,
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
      overStr: "0.0",
      [teams[0].name]: 0,
      [teams[1].name]: 0,
      wickets: {
        [teams[0].name]: 0,
        [teams[1].name]: 0,
      },
    },
    ...combineData(),
  ];

  const CustomDot1 = (props: JSX.Element["props"]) => {
    const { cx, cy, index } = props;

    const r = 3;
    if (
      chartData[index].wickets?.[teams[0].name] >
      chartData[index - 1]?.wickets?.[teams[0].name]
    )
      return (
        <circle
          cx={cx - r / (r * 2)}
          cy={cy - r / (r * 2)}
          r={r}
          fill="#1d4ed8"
        />
      );
    else return null;
  };

  const CustomDot2 = (props: JSX.Element["props"]) => {
    const { cx, cy, index } = props;

    const r = 3;
    if (
      chartData[index].wickets?.[teams[1].name] >
      chartData[index - 1]?.wickets?.[teams[1].name]
    )
      return (
        <circle
          cx={cx - r / (r * 2)}
          cy={cy - r / (r * 2)}
          r={r}
          fill="#b45309"
        />
      );
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
            tickCount={totalOvers}
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
            content={({ payload }) => {
              const wickets = payload?.map(
                (payload) => payload.payload.wickets,
              )[0];

              return (
                <Card>
                  <CardContent>
                    <CardTitle className="mb-2 text-lg">
                      Over{" "}
                      {payload?.[0]?.payload.overStr ||
                        payload?.[1]?.payload.overStr}
                    </CardTitle>
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
            type="bump"
            dataKey={teams[0].name}
            stroke="#3b82f6"
            strokeWidth="2.5"
            dot={<CustomDot1 />}
          />
          <Line
            strokeLinecap="round"
            type="bump"
            dataKey={teams[1].name}
            stroke="#f59e0b"
            strokeWidth="2.5"
            dot={<CustomDot2 />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WormChart;
