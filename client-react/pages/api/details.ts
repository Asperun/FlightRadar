import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.icao24) {
    const response = await fetch(`https://opensky-network.org/api/metadata/aircraft/icao/${req.query.icao24}`);

    if (response.ok) {
      const planeInfo = await response.json();
      return res.status(200).json(planeInfo);
    }

    return res.status(500).json("Server error");
  }

  return res.status(400).json({ error: "Bad request, include icao24" });
}
