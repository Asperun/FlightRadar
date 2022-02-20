export type Plane = {
  icao24: string
  callSign?: string
  trueTrack: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  isSelected?: boolean
}