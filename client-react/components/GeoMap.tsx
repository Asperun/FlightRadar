import {ChoroplethCanvas} from "@nivo/geo";
import countries from "../public/world_countries.json";
import {GeoGraphData} from "../types/graph";


export type Props = {
  data: GeoGraphData[]
  width: number
}

const GeoMap = ( {data,width}:Props ) : JSX.Element => {
  return (<ChoroplethCanvas
      height={450}
      width={width}
      data={data}
      features={countries.features}
      margin={{top: 0, right: 0, bottom: 0, left: 0}}
      colors="purples"
      domain={[0, 1000]}
      unknownColor="#000000"
      label="properties.name"
      valueFormat=".2s"
      projectionTranslation={[0.5, 0.7]}
      pixelRatio={2}
      projectionRotation={[0, 0, 0]}
      enableGraticule={true}
      graticuleLineColor="rgba(0, 0, 0, .2)"
      borderWidth={0.5}
      borderColor="#000000"
      projectionScale={148}
      theme={{
        tooltip: {
          container: {
            background: "#243c5a",
            opacity: "85%",
            borderRadius: "5%"
          }
        }
      }}
      legends={[
        {
          anchor: 'bottom-left',
          direction: 'column',
          justify: true,
          translateX: 20,
          translateY: -60,
          itemsSpacing: 0,
          itemWidth: 92,
          itemHeight: 18,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 18
        }
      ]}
    />
  )
}

export default GeoMap