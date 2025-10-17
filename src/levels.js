function createTarget(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => row * size + col),
  );
}

function toGrid(flat, size) {
  const grid = [];
  for (let row = 0; row < size; row += 1) {
    grid.push(flat.slice(row * size, (row + 1) * size));
  }
  return grid;
}

function createScrambled(size, swaps) {
  const flat = Array.from({ length: size * size }, (_, index) => index);
  for (const [a, b] of swaps) {
    const temp = flat[a];
    flat[a] = flat[b];
    flat[b] = temp;
  }
  return toGrid(flat, size);
}

export const LEVELS = [
  {
    id: 1,
    size: 2,
    target: createTarget(2),
    scrambled: createScrambled(2, [
      [0, 1],
      [2, 3],
    ]),
  },
  {
    id: 2,
    size: 3,
    target: createTarget(3),
    scrambled: createScrambled(3, [
      [0, 1],
      [4, 5],
      [7, 8],
      [2, 4],
    ]),
  },
  {
    id: 3,
    size: 4,
    target: createTarget(4),
    scrambled: createScrambled(4, [
      [0, 5],
      [1, 4],
      [2, 10],
      [6, 9],
      [7, 13],
    ]),
  },
  {
    id: 4,
    size: 5,
    target: createTarget(5),
    scrambled: createScrambled(5, [
      [0, 24],
      [1, 6],
      [5, 10],
      [7, 17],
      [12, 18],
      [19, 23],
    ]),
  },
];
