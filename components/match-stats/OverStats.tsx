import { calcRuns, generateOverSummary } from "@/lib/utils";
import { EventType } from "@/types";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

function OverStats({
  ballEvents,
  totalOvers,
  runRate,
}: {
  ballEvents: EventType[];
  totalOvers?: number;
  runRate: number;
}) {
  const { overSummaries } = generateOverSummary(ballEvents);

  const chartSummaryData = [];

  for (let i = 0; i < (totalOvers ?? overSummaries.length); i++) {
    const summary = overSummaries[i] || ["0"];
    const overName = overSummaries.length > 9 ? `Over ${i + 1}` : i + 1;

    chartSummaryData.push({
      name: overName,
      runs: calcRuns(summary),
    });
  }

  return (
    <div className="h-96 p-2">
      {chartSummaryData.length > 0 ? (
        <div className="mx-auto h-full max-w-7xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={100}
              height={40}
              data={chartSummaryData}
              margin={{ top: 20, left: -40 }}
              maxBarSize={80}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                fontSize={12}
                stroke="hsla(var(--muted-foreground) / 0.75)"
              />
              <YAxis
                tickLine={false}
                fontSize={12}
                stroke="hsla(var(--muted-foreground) / 0.75)"
              />
              <ReferenceLine
                y={runRate}
                stroke="hsla(var(--muted-foreground) / 0.75)"
                strokeDasharray={3}
              />
              <Bar
                dataKey="runs"
                style={{ fill: "hsl(var(--primary))" }}
                radius={[5, 5, 0, 0]}
                label={{
                  position: "top",
                  stroke: "hsl(var(--foreground))",
                  strokeWidth: 0.5,
                  fontSize: 12,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">There is no data to show!</h2>
          <p>Start adding runs to see data</p>
        </div>
      )}
    </div>
  );
}

export default OverStats;
