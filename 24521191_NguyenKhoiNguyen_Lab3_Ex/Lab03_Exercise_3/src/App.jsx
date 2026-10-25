import { PubgMatchTelemetry } from "./components/PubgMatchTelemetry";
import "./App.css";

export default function App() {
  return (
    <main className="appShell">
      <PubgMatchTelemetry squadId="te" />
    </main>
  );
}
