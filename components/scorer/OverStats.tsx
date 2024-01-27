import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { EventType } from "@/types";

function OverStats({
  chartSummaryData,
}: {
  chartSummaryData: { runs: number; wickets: number }[];
}) {
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    const radius = 10;

    // if (!value) return null;
    // return (
    //   <>
    //     {Array.from({ length: value }).map((_, i) => (
    //       <g key={i}>
    //         <circle
    //           cx={x + width / 2}
    //           cy={y - radius * (2 * i + 1)}
    //           r={radius}
    //           style={{ fill: "hsl(var(--destructive))" }}
    //         />
    //         <text
    //           x={x + width / 2}
    //           y={y - radius * (2 * i + 1)}
    //           fill="#fff"
    //           textAnchor="middle"
    //           dominantBaseline="middle"
    //         >
    //           w
    //         </text>
    //       </g>
    //     ))}
    //   </>
    // );

    return (
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Stats</Button>
      </DrawerTrigger>
      <DrawerContent className="p-2">
        <DrawerHeader className="pt-6 pb-4 mb-2 shadow shadow-muted">
          <DrawerTitle className="text-2xl">Run rate bar</DrawerTitle>
        </DrawerHeader>
        <div className="h-96">
          <div className="h-full max-w-7xl mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={100}
                height={40}
                data={chartSummaryData}
                // data={[
                //   { i: 1, runs: 12, wickets: 2 },
                //   { i: 2, runs: 5, wickets: 1 },
                //   { i: 3, runs: 6 },
                //   { i: 4, runs: 18 },
                //   { i: 5, runs: 4 },
                //   { i: 6, runs: 3 },
                //   { i: 7, runs: 0 },
                //   { i: 8, runs: 0 },
                //   { i: 9, runs: 0 },
                // ]}
              >
                <XAxis dataKey="name" />
                <Bar
                  dataKey="runs"
                  style={{
                    fill: "hsl(var(--foreground))",
                    opacity: 0.9,
                  }}
                >
                  <LabelList dataKey="runs" content={renderCustomizedLabel} />
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
