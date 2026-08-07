import { PageMeta } from 'src/perf';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <PageMeta
        title="BattleAsia | Mobile Esports Tournaments"
        description="Win real rewards playing free mobile tournaments — PUBG Mobile, Free Fire, COD Mobile, Valorant, Mobile Legends."
        path="/dashboard"
        image="https://battleasia.gg/assets/images/hero/hero-pubg-wide.webp"
      />
      <main>
        <HomeView />
      </main>
    </>
  );
}
