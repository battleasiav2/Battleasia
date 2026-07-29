import { subDays } from 'date-fns';
import { _mock } from 'src/_mock/_mock';

export type DemoGameRow = {
  id: string;
  name: string;
  type: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
};

const gameTypes = ['User can Create Challenge', 'Tournament', 'Solo'];

const buildGameRow = (index: number): DemoGameRow => ({
  id: _mock.id(index),
  name: ['Ludo', 'PUBG MOBILE', 'Free Fire', 'Call of Duty', 'FIFA'][index % 5],
  type: gameTypes[index % gameTypes.length],
  image: _mock.image.cover(index + 5),
  isActive: index % 3 !== 0,
  createdAt: subDays(new Date(), index * 2),
});

export const demoGameRows: DemoGameRow[] = [...Array(3)].map((_, index) => buildGameRow(index));

export const createRandomGameRow = (seed: number): DemoGameRow => {
  const base = buildGameRow(seed % demoGameRows.length);
  return {
    ...base,
    id: `${base.id}-new-${Date.now()}`,
    name: `${base.name} ${seed + 1}`,
    createdAt: new Date(),
  };
};

