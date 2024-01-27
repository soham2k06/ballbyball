import { Bar, BarChart, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { EventType } from "@/types";

function OverStats({ overSummaries }: { overSummaries: EventType[][] }) {
  const chartSummaryData = overSummaries.map((summary) => ({
    runs: summary.reduce((acc, cur) => acc + Number(cur), 0),
    wickets: summary.filter((ball) => ball === "-1").length,
  }));

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    const radius = 10;

    if (!value) return null;
    return (
      <>
        {Array.from({ length: value }).map((_, i) => (
          <g key={i}>
            <circle
              cx={x + width / 2}
              cy={y - radius * (2 * i + 1)}
              r={radius}
              style={{ fill: "hsl(var(--destructive))" }}
            />
            <text
              x={x + width / 2}
              y={y - radius * (2 * i + 1)}
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              w
            </text>
          </g>
        ))}
      </>
    );
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Stats</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="h-96">
          <div className="h-full max-w-7xl mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={100}
                height={40}
                // data={chartSummaryData}
                data={[
                  { runs: 12, wickets: 2 },
                  { runs: 5, wickets: 1 },
                  { runs: 6 },
                  { runs: 15 },
                  { runs: 4 },
                  { runs: 3 },
                  { runs: 0 },
                  { runs: 0 },
                  { runs: 0 },
                ]}
              >
                <Bar
                  dataKey="runs"
                  style={{
                    fill: "hsl(var(--foreground))",
                    opacity: 0.9,
                  }}
                >
                  <LabelList
                    dataKey="wickets"
                    content={renderCustomizedLabel}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default OverStats;
