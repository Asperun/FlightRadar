//1.) Create plane pool based on numplanes
//2.) Use only backward iterations for performance
//3.) Get response planes array
//3.1) Iterate through state plane array
//3.2) Find index of icao of the plane with icao of response plane
//3.3) if -1 set that array item to null  - else update
//




// {
//   const planeList = [];
//   const incomingPlanes = [];
//
//
//   for (let i = 300; i-- >0;){ // first list (existing)
//     planeList.push({icao24 : "asd-" + i, asd:1, asd2:"agsfdg"})
//   }
//
//   for (let i = 200; i-- >0;){ // incoming list
//     incomingPlanes.push({icao24 : "asd-" + i, asd:1, asd2:"agsfdg"})
//   }
//
//
//   const timer = Date.now();
//
//   for (let i = planeList.length; i-- >0;){ // iterate through existing list;
//      const index = incomingPlanes.findIndex(plane => plane.icao24 === planeList[i].icao24);
//
//     if(index !== -1){ // we have a match -- update
//       planeList[i] = incomingPlanes[index];
//       incomingPlanes.splice(index,1); // remove it from the list;
//     }else{ // plane is no longer in bounds or just gone -- remove
//       // planeList.splice(i,1);
//       delete planeList[i]; // remove it from the list but preserve index
//     }
//   }
//
//
//
//   const finalResult =[...planeList, ...incomingPlanes];
//
//
//     // finalResult.forEach(plane=> {console.log(plane)})
//
// const result = Date.now() - timer;
//   console.log( "time elapsed="+result+"ms")
//
//
// }


// 0: (2) [50.033333, 8.570556]
// 1: (2) [55.7287, -5.8715]
// 2: (2) [47.44900131225586, -122.30899810791016]


const arr = [[55.617900848389, 12.656000137329],[57.0561, 10.1019],[52.3086013794, 4.763889789579999]]


const airportsDistance = [Math.abs(arr[0][0] - arr[2][0]),Math.abs(arr[0][1] - arr[2][1])]
// console.log(`airportsDistance=${airportsDistance}`)
const currentPlaneDistanceFromStart = [Math.abs(arr[0][0] - arr[1][0]), Math.abs(arr[0][1] - arr[1][1])]
// console.log(`currentPlaneDistanceFromStart=${currentPlaneDistanceFromStart}`)
const percentageX = Math.abs(currentPlaneDistanceFromStart[0] -airportsDistance[0]) / airportsDistance[0]
const percentageY = Math.abs(currentPlaneDistanceFromStart[1] -airportsDistance[1]) / airportsDistance[1]
// console.log(`percentageX=${percentageX} percentageY=${percentageY}`);


const longitudeDistance = airportsDistance[1];
// console.log("longitudeDistance="+longitudeDistance)
const curPlaneLong = currentPlaneDistanceFromStart[1];
// console.log("curPlaneLong="+curPlaneLong)
const perc = curPlaneLong / longitudeDistance * 100;   // 11%
// console.log("longProgress="+perc+"%");


const latDistance = airportsDistance[0];
console.log("latDistance="+latDistance)
const curPlanelat = currentPlaneDistanceFromStart[0];
console.log("curPlaneLat="+curPlanelat)
const percLat = curPlanelat / latDistance * 100;   // 11%
console.log("latProgress="+percLat+"%");


// const x = Math.abs(arr[2][1] - arr[1][1]) / Math.abs(arr[0][1] - arr[1][1]) ;
// const y = Math.abs(arr[2][0] - arr[1][0]) /Math.abs(arr[0][0] - arr[1][0]);

// console.log(Math.floor((x+y)/2 * 100) + "%")
// console.log(Math.floor(x* 100) + "%")

// const tripCompleteness = Math.floor(((Math.abs(currentPlaneDistanceFromStart[0] -airportsDistance[0]) / airportsDistance[0]) + (Math.abs(currentPlaneDistanceFromStart[1] -airportsDistance[1]) / airportsDistance[1]) /2) *100);
// console.log(tripCompleteness +"%");


const totalDist = Math.abs(arr[0][1] - arr[2][1]);
const deportPlaneDist = Math.abs(arr[0][1] - arr[1][1]);
console.log(Math.floor((deportPlaneDist/totalDist)  * 100))