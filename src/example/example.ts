import { prmg } from "../prmg";

const example = prmg({
  chunks: {
    width: 10,
    height: 10
  },
  generation: {
    ice: {
      probability: 5,
      range: [
        { x: 0, y: 0, width: 100, height: 25 }
      ]
    },
    snow: {
      probability: 9,
      range: [
        { x: 0, y: 0, width: 100, height: 25 }
      ]
    },
    grass: {
      probability: 9,
      range: [
        { x: 0, y: 25, width: 100, height: 50 }
      ]
    },
    dirt: {
      probability: 3,
      adjacency: {
        anywhere: {
          grass: {
            average: 5
          },
          sand: {
            average: 1
          },
          water: {
            override: 0
          }
        }
      }
    },
    sand: {
      probability: 6,
      range: [
        { x: 0, y: 75, width: 100, height: 25 }
      ]
    },
    water: {
      probability: 3
    }
  }
});

console.log(example.load(0, 0));
