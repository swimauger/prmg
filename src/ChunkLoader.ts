import { PRNG } from "@prng/core";
import { Chunk } from "./Chunk";
import { Area, Commands, GenerationInstructions, GenerationRules } from "./Interfaces";

export class ChunkLoader {
  private seed: number;
  private instructions: GenerationInstructions;

  private width: number;
  private height: number;

  private chunks: Map<string, Chunk> = new Map();
  private seeds: Map<string, number> = new Map();

  constructor(instructions: GenerationInstructions) {
    this.seed = instructions.seed || Date.now();
    this.instructions = instructions;

    this.width = instructions.chunks.width;
    this.height = instructions.chunks.height;
  }

  private inRange(x: number, y: number, ranges: Area[]): boolean {
    if (!ranges?.length) return true;
  
    for (const range of ranges) {
      if (x >= range.x && x <= range.x + range.width && y >= range.y && y <= range.y + range.height) {
        return true;
      }
    }
  
    return false;
  }

  private getAdjacencyProbability(chunk: Chunk, x: number, y: number, obj: GenerationRules): number {
    let probability = obj.probability || 0;

    for (const direction in obj.adjacency) {
      for (const directionsObjectName in obj.adjacency[direction]) {
        let adjustProbability = false;
        switch (direction) {
          case 'anywhere':
          case 'above':
            adjustProbability = chunk?.[y - 1]?.[x]?.objects.has(directionsObjectName);
            break;
          case 'below':
            adjustProbability = chunk?.[y + 1]?.[x]?.objects.has(directionsObjectName);
            break;
          case 'left':
            adjustProbability = chunk?.[y]?.[x - 1]?.objects.has(directionsObjectName);
            break;
          case 'right':
            adjustProbability = chunk?.[y]?.[x + 1]?.objects.has(directionsObjectName);
            break;
        }

        if (adjustProbability) {
          const objProbability = obj.adjacency[direction][directionsObjectName] as Commands;
          if (objProbability.override) {
            probability = objProbability.override;
          } else if (objProbability.average) {
            probability += objProbability.average;
            probability /= 2;
          }
        }
      }
    }

    return probability;
  }

  private getChunkId(x: number, y: number) {
    const chunk = {
      x: x - (x % this.width),
      y: y - (y % this.height)
    };

    return `${chunk.x},${chunk.y}`;
  }

  private generateChunk(id: string, chunkSeed: number, worldX: number, worldY: number): Chunk {
    const prng = PRNG.createGenerator('mulberry32', chunkSeed);
    const chunk = new Chunk(id, this.width, this.height);

    for (let y = 0; y < chunk.length; y++) {
      for (let x = 0; x < chunk[y].length; x++) {
        // TODO: Replace with linked list for fast sorting by high -> low probability
        const probabilities = {};

        let totalProbability = 0;
        for (const objectName in this.instructions.generation) {
          const obj = this.instructions.generation[objectName];

          if (!this.inRange(x, y, obj.range)) continue;
          probabilities[objectName] = this.getAdjacencyProbability(chunk, x, y, obj);
          totalProbability += probabilities[objectName];
        }

        const randomNumber = prng.next().value;

        let totalDecimalProbability = 0;
        for (const objectName in probabilities) {
          totalDecimalProbability += probabilities[objectName]/totalProbability;
          if (randomNumber <= totalDecimalProbability) {
            chunk[y][x] = {
              x: worldX + x,
              y: worldY + y,
              objects: new Set([ objectName ])
            };
            break;
          }
        }
      }
    }

    this.chunks.set(id, chunk);
    return chunk;
  }

  public load(x: number, y: number): Chunk {
    const id = this.getChunkId(x, y);

    if (this.chunks.has(id)) {
      return this.chunks.get(id);
    } else if (this.seeds.has(id)) {
      const [ x2, y2 ] = id.split(',');
      return this.generateChunk(id, this.seeds.get(id), Number(x2), Number(y2));
    }

    const prng = PRNG.createGenerator('mulberry32', this.seed);

    for (let i = 0; true; i++) {
      for (let x2 = -(this.width * i); x2 <= (this.width * i); x2 += this.width) {
        for (let y2 = -(this.height * i); y2 <= (this.height * i); y2 += this.height) {
          if (Math.abs(x2) >= this.width * i || Math.abs(y2) >= this.height * i) {
            const chunkSeed = prng.next().value,
                  chunkId = this.getChunkId(x2, y2);
            
            this.seeds.set(chunkId, chunkSeed);

            if (id === chunkId) {
              return this.generateChunk(id, chunkSeed, x2, y2);
            }
          }
        }
      }
    }
  }
}