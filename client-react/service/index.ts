import { PlaneDetails } from "../types/plane";
import { LatLngExpression } from "leaflet";
const BezierSpline = require("bezier-spline");

export function getPath(plane: PlaneDetails): LatLngExpression[][] {
  const arr = plane.flights[0].checkpoints.map((checkpoint) => [
    checkpoint.latitude,
    checkpoint.longitude,
  ]);
  arr.push([plane.latitude, plane.longitude]);
  return processPath(arr);
}

function processPath(checkpoints: number[][]) {
  if (checkpoints.length < 10) return checkpoints;
  const bezier = new BezierSpline(checkpoints, () => 1).curves;

  return bezier.reduce((acc: [], line: any) => {
    return [...acc, line[0], line[1], line[2], line[3]];
  }, []);
}

const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

export const blurredShimmer = (w: number, h: number) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
