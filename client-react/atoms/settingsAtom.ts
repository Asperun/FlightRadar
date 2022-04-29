import { atom } from "recoil";

export const showPathsState = atom({
  key: "showPathsState",
  default: true,
});

export const showLandedState = atom({
  key: "showLandedState",
  default: false,
});

export const maxPlanesState = atom({
  key: "maxPlanesState",
  default: 300,
});
