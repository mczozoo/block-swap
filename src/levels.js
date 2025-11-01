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

function validatePermutation(permutation, totalTiles) {
  if (permutation.length !== totalTiles) {
    throw new Error('Permutation must match grid size');
  }
  const seen = new Array(totalTiles).fill(false);
  for (let index = 0; index < permutation.length; index += 1) {
    const value = permutation[index];
    if (!Number.isInteger(value) || value < 0 || value >= totalTiles) {
      throw new Error('Permutation indices must be within the grid range');
    }
    if (seen[value]) {
      throw new Error('Permutation must be bijective');
    }
    seen[value] = true;
  }
}

function applyPermutation(state, permutation) {
  const next = new Array(state.length);
  for (let index = 0; index < permutation.length; index += 1) {
    next[index] = state[permutation[index]];
  }
  return next;
}

function createScrambledFromPermutation(size, permutation) {
  const totalTiles = size * size;
  if (!Array.isArray(permutation) || permutation.length === 0) {
    throw new Error('Permutation must be a non-empty array');
  }

  if (Array.isArray(permutation[0])) {
    let state = Array.from({ length: totalTiles }, (_, index) => index);
    for (const step of permutation) {
      validatePermutation(step, totalTiles);
      state = applyPermutation(state, step);
    }
    return toGrid(state, size);
  }

  validatePermutation(permutation, totalTiles);
  return toGrid(permutation, size);
}

export const LEVELS = [
  {
    id: 1,
    size: 2,
    minMoves: 3,
    image: 'image/image1.jpg',
    target: createTarget(2),
    scrambled: createScrambledFromPermutation(2, [
      [1, 0, 2, 3],
      [0, 1, 3, 2],
      [3, 1, 2, 0],
    ]),
  },
  {
    id: 2,
    size: 2,
    minMoves: 3,
    image: 'image/image2.jpg',
    target: createTarget(2),
    scrambled: createScrambledFromPermutation(2, [
      [1, 0, 2, 3],
      [0, 3, 2, 1],
      [2, 1, 0, 3],
    ]),
  },
  {
    id: 3,
    size: 3,
    minMoves: 5,
    image: 'image/image3.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [
      [4, 1, 2, 3, 0, 5, 6, 7, 8],
      [0, 2, 3, 1, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 7, 6, 8],
      [0, 1, 2, 6, 4, 5, 3, 7, 8],
      [3, 1, 2, 0, 4, 5, 6, 7, 8],
    ]),
  },
  {
    id: 4,
    size: 3,
    minMoves: 7,
    image: 'image/image4.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [
      [1, 0, 2, 3, 4, 5, 6, 7, 8],
      [0, 2, 1, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 7, 6, 8],
      [0, 4, 2, 3, 1, 5, 6, 7, 8],
      [0, 1, 5, 3, 4, 2, 6, 7, 8],
      [0, 1, 2, 3, 8, 5, 6, 7, 4],
      [5, 1, 2, 3, 4, 0, 6, 7, 8],
    ]),
  },
  {
    id: 5,
    size: 3,
    minMoves: 8,
    image: 'image/image5.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [
      [4, 1, 2, 3, 0, 5, 6, 7, 8],
      [0, 5, 2, 3, 4, 1, 6, 7, 8],
      [0, 1, 6, 3, 4, 5, 2, 7, 8],
      [0, 1, 2, 7, 4, 5, 6, 3, 8],
      [0, 1, 2, 3, 8, 5, 6, 7, 4],
      [2, 1, 0, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 8, 7, 6],
      [8, 1, 2, 3, 4, 5, 6, 7, 0],
    ]),
  },
  {
    id: 6,
    size: 3,
    minMoves: 9,
    image: 'image/image6.jpg',
    target: createTarget(3),
    scrambled: createScrambledFromPermutation(3, [
      [8, 1, 2, 3, 4, 5, 6, 7, 0],
      [0, 7, 2, 3, 4, 5, 6, 1, 8],
      [0, 1, 6, 3, 4, 5, 2, 7, 8],
      [0, 1, 2, 5, 4, 3, 6, 7, 8],
      [4, 1, 2, 3, 0, 5, 6, 7, 8],
      [0, 1, 2, 3, 8, 5, 6, 7, 4],
      [0, 2, 1, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 7, 6, 8],
      [0, 1, 2, 4, 3, 5, 6, 7, 8],
    ]),
  },
  {
    id: 7,
    size: 4,
    minMoves: 12,
    image: 'image/image7.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [
      5, 2, 7, 3, 4, 9, 0, 6, 8, 1, 10, 15, 12, 13, 11, 14,
    ]),
  },
  {
    id: 8,
    size: 4,
    minMoves: 13,
    image: 'image/image8.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [
      [15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
      [0, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 15],
      [0, 1, 13, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 2, 14, 15],
      [0, 1, 2, 12, 4, 5, 6, 7, 8, 9, 10, 11, 3, 13, 14, 15],
      [0, 1, 2, 3, 11, 5, 6, 7, 8, 9, 10, 4, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 10, 6, 7, 8, 9, 5, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 9, 7, 8, 6, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 11, 12, 13, 14, 15],
      [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 7, 6, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 9, 8, 10, 11, 12, 13, 14, 15],
    ]),
  },
  {
    id: 9,
    size: 4,
    minMoves: 14,
    image: 'image/image9.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [
      [5, 1, 2, 3, 4, 0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 6, 2, 3, 4, 5, 1, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 7, 3, 4, 5, 6, 2, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 4, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 13, 9, 10, 11, 12, 8, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 14, 10, 11, 12, 13, 9, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 11, 12, 13, 14, 10],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 11, 13, 14, 15],
      [15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
      [0, 1, 2, 3, 4, 10, 6, 7, 8, 9, 5, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 11, 7, 8, 9, 10, 6, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 12, 8, 9, 10, 11, 7, 13, 14, 15],
      [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 13, 15],
    ]),
  },
  {
    id: 10,
    size: 4,
    minMoves: 15,
    image: 'image/image10.jpg',
    target: createTarget(4),
    scrambled: createScrambledFromPermutation(4, [
      [4, 1, 2, 3, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 5, 2, 3, 4, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 6, 3, 4, 5, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 7, 4, 5, 6, 3, 8, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 8, 5, 6, 7, 4, 9, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 9, 6, 7, 8, 5, 10, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 10, 7, 8, 9, 6, 11, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 11, 8, 9, 10, 7, 12, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 12, 9, 10, 11, 8, 13, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 13, 10, 11, 12, 9, 14, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 11, 12, 13, 10, 15],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 12, 13, 14, 11],
      [15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
      [0, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 15],
      [0, 1, 13, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 2, 14, 15],
    ]),
  },
];
