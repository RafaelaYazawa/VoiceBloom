import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { useStore } from '../../store/store';

const ProgressChart: React.FC = () => {
  const { recordings } = useStore();
  
  // Generate data from the recordings with metrics
  const progressData = recordings
    .filter(r => r.metrics)
    .map(r => ({
      date: r.date.split('T')[0],
      tone: r.metrics!.tone,
      confidence: r.metrics!.confidence,
      fluency: r.metrics!.fluency,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Generate some demo data if no recordings with metrics exist
  const demoData = Array.from({ length: 7 }).map((_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    return {
      date,
      tone: Math.floor(5 + Math.random() * 5),
      confidence: Math.floor(4 + Math.random() * 6),
      fluency: Math.floor(4 + Math.random() * 6),
    };
  });
  
  const data = progressData.length > 0 ? progressData : demoData;

  const formatXAxis = (dateStr: string) => format(parseISO(dateStr), 'MMM d');
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-md rounded-md">
          <p className="text-sm font-medium">{format(parseISO(label), 'MMMM d, yyyy')}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any) => (
              <p
                key={entry.name}
                className="text-xs"
                style={{ color: entry.color }}
              >
                {`${entry.name}: ${entry.value}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-6">Progress Chart</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="tone"
              stroke="#8b5cf6" // primary
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#3b82f6" // secondary
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="fluency"
              stroke="#f97316" // accent
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Tone</p>
          <p className="text-2xl font-semibold mt-1">
            {data.length > 0
              ? (data.reduce((sum, item) => sum + item.tone, 0) / data.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-xs text-muted-foreground">Average</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-secondary">Confidence</p>
          <p className="text-2xl font-semibold mt-1">
            {data.length > 0
              ? (data.reduce((sum, item) => sum + item.confidence, 0) / data.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-xs text-muted-foreground">Average</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-accent">Fluency</p>
          <p className="text-2xl font-semibold mt-1">
            {data.length > 0
              ? (data.reduce((sum, item) => sum + item.fluency, 0) / data.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-xs text-muted-foreground">Average</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;