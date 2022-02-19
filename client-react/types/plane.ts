export interface Plane {
  icao24: string
  callSign?: string | null
  trueTrack: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  isSelected?: boolean
}