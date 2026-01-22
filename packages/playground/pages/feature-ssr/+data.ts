export interface Data {
  items: { id: number; }[];
  itemCount: number;
  ssrRange: {
    start: number;
    end: number;
    colStart: number;
    colEnd: number;
  };
}

export async function data() {
  const itemCount = 200;
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: i,
  }));
  return {
    items,
    itemCount,
    ssrRange: {
      start: 100,
      end: 115,
      colStart: 50,
      colEnd: 70,
    },
  };
}
