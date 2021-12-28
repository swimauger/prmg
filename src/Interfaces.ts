export interface Size {
  width: number;
  height: number;
}

export interface Coordinates {
  x: number;
  y: number;
  objects?: Set<string>;
}

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Commands {
  override?: number;
  average?: number;
}

export interface ObjectCommands {
  [objectName: string]: Commands;
}

export interface Adjacency {
  anywhere?: ObjectCommands;
  above?: ObjectCommands;
  below?: ObjectCommands;
  left?: ObjectCommands;
  right?: ObjectCommands;
}

export interface GenerationRules {
  probability?: number;
  range?: Area[];
  adjacency?: Adjacency;
}

export interface Generation {
  [objectName: string]: GenerationRules;
}

export interface GenerationInstructions {
  width?: number;
  height?: number;

  seed?: number;

  chunks: Size;
  
  generation: Generation;
}
