export interface Plane {
  icao24: string;
  callSign?: string;
  trueTrack: number;
  latitude: number;
  longitude: number;
  geoAltitude: number;
  velocity: number;
  isSelected?: boolean;
  regCountry?: string;
}

// An object containing data from 3 fetches
export interface PlaneDetails extends Plane, PlanePicture, Flight {
  isSelected?: boolean;
  owner?: string;
  operator?: string;
  operatorCallsign?: string;
  model?: string;
  registration?: string;
  serialNumber?: string;
  country?: string;
  manufacturerIcao?: string;
  typecode: string;
}

export interface Checkpoint {
  latitude: number;
  longitude: number;
  altitude: number;
  creationTime: Date;
  trueTrack: number;
  velocity: number;
  verticalRate: number;
}

export interface Flight {
  flights: { checkpoints: Checkpoint[] }[];
}

export interface PlanePicture {
  photographer: string;
  url: string;
}

export type MapData = {
  planes: Plane[];
  amountReceived: number;
};
