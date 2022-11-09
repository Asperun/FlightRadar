import { ResponsiveLine } from '@nivo/line';

import type { LinearGraphData } from '../types/graph';

type Props = {
  data: LinearGraphData[];
};

const LinearGraph = ({ data }: Props): JSX.Element | null => {
  if (!data) {
    return null;
  }

  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 50, bottom: 70, left: 50 }}
      xScale={{ type: 'point' }}
      colors={{ scheme: 'nivo' }}
      curve={'monotoneX'}
      enableSlices={'x'}
      lineWidth={4}
      xFormat=' >-'
      theme={{
        tooltip: {
          container: {
            background: '#243c5a',
            opacity: '85%',
            borderRadius: '5%'
          }
        },
        axis: {
          ticks: {
            text: {
              fill: '#FFFFFF',
              opacity: '85%'
            }
          },
          legend: {
            text: {
              fill: '#FFFFFF',
              opacity: '85%'
            }
          }
        },
        legends: {
          title: {
            text: {
              fill: '#FFFFFF',
              opacity: '85%'
            }
          },
          text: {
            fill: '#FFFFFF',
            opacity: '85%'
          }
        },
        grid: {
          line: {
            stroke: 'gray',
            strokeWidth: 0.2
          }
        }
      }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto'
      }}
      yFormat=' >-.2f'
      axisTop={null}
      axisRight={null}
      axisBottom={{
        // @ts-ignore
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'time of the day(UTC)',
        legendOffset: 36,
        legendPosition: 'middle'
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'amount',
        legendOffset: -40,
        legendPosition: 'middle'
      }}
      pointSize={10}
      pointColor='#7f0099'
      pointBorderWidth={3}
      pointBorderColor={{ from: 'serieColor', modifiers: [] }}
      pointLabelYOffset={-14}
      useMesh={true}
      legends={[
        {
          anchor: 'top',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: -40,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
    />
  );
};

export default LinearGraph;
