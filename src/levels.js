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

function createScrambledFromPermutation(size, permutation) {
  if (permutation.length !== size * size) {
    throw new Error('Permutation must match grid size');
  }
  return toGrid(permutation, size);
}

export const LEVELS = [
  {
    id: 1,
    size: 2,
    minMoves: 2,
    image: 'image/image1.jpg',
    target: createTarget(2),
    scrambled: createScrambledFromPermutation(2, [1, 2, 3, 0]),
  },
  {
    id: 2,
    size: 2,
    minMoves: 3,
    image: 'image/image2.jpg',
    target: createTarget(2),
    scrambled: createScrambledFromPermutation(2, [2, 3, 0, 1]),
  },
  {
    id: 3,
    size: 3,
    minMoves: 5,
    image: 'image/image3.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [1, 2, 5, 3, 4, 7, 0, 6, 8]),
  },
  {
    id: 4,
    size: 3,
    minMoves: 7,
    image: 'image/image4.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [4, 0, 2, 6, 1, 8, 3, 5, 7]),
  },
  {
    id: 5,
    size: 3,
    minMoves: 8,
    image: 'image/image5.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [8, 3, 1, 6, 4, 2, 7, 5, 0]),
  },
  {
    id: 6,
    size: 3,
    minMoves: 9,
    image: 'image/image6.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [5, 7, 2, 8, 0, 4, 6, 1, 3]),
  },
  {
    id: 7,
    size: 4,
    minMoves: 11,
    image: 'image/image7.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [5, 1, 3, 4, 8, 10, 2, 7, 0, 9, 6, 15, 12, 13, 11, 14]),
  },
  {
    id: 8,
    size: 4,
    minMoves: 13,
    image: 'image/image8.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [9, 0, 6, 3, 15, 2, 12, 5, 4, 8, 13, 1, 10, 14, 7, 11]),
  },
  {
    id: 9,
    size: 4,
    minMoves: 14,
    image: 'image/image9.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [11, 4, 1, 7, 14, 6, 9, 0, 13, 2, 12, 5, 10, 15, 8, 3]),
  },
  {
    id: 10,
    size: 4,
    minMoves: 15,
    image: 'image/image10.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [6, 13, 4, 15, 9, 1, 12, 2, 10, 0, 14, 7, 5, 11, 8, 3]),
  },
];
