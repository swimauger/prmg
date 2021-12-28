import { ChunkLoader } from "./ChunkLoader";
import { GenerationInstructions } from "./Interfaces";

export function prmg(instructions: GenerationInstructions): ChunkLoader {
  return new ChunkLoader(instructions);
}
