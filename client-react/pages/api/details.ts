import {NextApiRequest, NextApiResponse} from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {

  // console.log(cityCollection)
  if (req.query.icao24) {
    console.log(req.query.icao24)

    const info = await fetch(`https://opensky-network.org/api/metadata/aircraft/icao/${req.query.icao24}`)

    const response =await info.json()
    return res.status(200).json(response )
    // return res.status(200).json("all")
  }

    return res.status(400).json({error: "Bad request, include icao24"})

}