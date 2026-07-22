import { HomeScreen } from "../components/HomeScreen";
import { PageHeader, PlaceMark } from "../components/PageHeader";

/**
 * App-shaped home: no marketing hero. Large title, the search bar and its
 * trade rail, then the register — content is the interface.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <PageHeader
        eyebrow={
          <>
            <PlaceMark />
            Ilisan, Ogun State
          </>
        }
        title="Find trusted hands."
        compactTitle="Browse"
        subtitle="Every artisan here has been visited and vetted by the Artiza team."
      />

      <HomeScreen />
    </div>
  );
}
