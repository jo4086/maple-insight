import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export interface HexnagonChartItemProps {
  vertex_name: string;
  value: number;
  max_value: number;
}

export interface HexagonChartProps {
  values: HexnagonChartItemProps[];
}

export const HexagonChart = ({ values }: HexagonChartProps) => {
  return (
    <ResponsiveContainer className="w-fit" width="20%" height={320}>
      <RadarChart data={values}>
        <PolarGrid stroke="#efb039" fill="#2a2a2a" fillOpacity={0.8} strokeWidth={0.3} />
        <PolarAngleAxis dataKey="vertex_name" />
        {/* <PolarRadiusAxis /> */}
        <Radar
          fill="#f0f0f0" // 내부색
          stroke="#4f46e5"
          fillOpacity={0.4}
          dataKey="value"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
