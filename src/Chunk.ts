import { Coordinates } from "./Interfaces";

export class Chunk extends Array<Array<Coordinates>> {
  public id: string;

  constructor(id: string, width: number, height: number) {
    super(height);
    this.id = id;

    for (let y = 0; y < height; y++) {
      Object.defineProperty(this, y, {
        value: Array(width),
        writable: false
      });
    }
  }
}
