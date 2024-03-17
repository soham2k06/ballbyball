import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from "recharts";

function OverStats({
  chartSummaryData,
}: {
  chartSummaryData: { runs: number }[];
}) {
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    const radius = 10;

    return (
      <text
        x={x + width / 2}
        y={y - radius}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="h-96 p-2">
      {chartSummaryData.length > 0 ? (
        <div className="mx-auto h-full max-w-7xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={100}
              height={40}
              data={chartSummaryData}
              margin={{ top: 20 }}
            >
              <XAxis dataKey="name" />
              <Bar
                dataKey="runs"
                style={{
                  fill: "hsl(var(--foreground))",
                  opacity: 0.9,
                }}
              >
                {chartSummaryData.length <= 15 && (
                  <LabelList dataKey="runs" content={renderCustomizedLabel} />
                )}
              </Bar>
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
