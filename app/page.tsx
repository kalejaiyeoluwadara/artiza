import { HomeScreen } from "../components/HomeScreen";
import { HomeGreeting } from "../components/HomeGreeting";

/**
 * App-shaped home: no marketing hero. A greeting and the favourites shortcut,
 * the search bar and its trade rail, then the register — content is the
 * interface.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <HomeGreeting />

      <HomeScreen />
    </div>
  );
}
