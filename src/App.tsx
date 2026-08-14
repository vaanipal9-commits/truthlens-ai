// Thin TS entry that delegates to the JSX app (per project rules: source files are .jsx).
// @ts-ignore - JSX file, no types needed
import AppRoot from "./app/AppRoot.jsx";

export default function App() {
  return <AppRoot />;
}
