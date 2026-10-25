import { useId, useState } from "react";
import { PUBG_VN_SQUADS } from "./data/squads";
import { PubgMatchTelemetry } from "./components/PubgMatchTelemetry";
import "./App.css";

export default function App() {
  const [squadId, setSquadId] = useState("te");
  const selectorId = useId();

  return (
    <main className="appShell">
      <div className="dashboard">
        <div className="squadSelector">
          <label htmlFor={selectorId}>Select PVS Squad</label>

          <select
            id={selectorId}
            value={squadId}
            onChange={(event) => setSquadId(event.target.value)}
          >
            {PUBG_VN_SQUADS.map((squad) => (
              <option key={squad.id} value={squad.id}>
                {squad.name}
              </option>
            ))}
          </select>
        </div>

        <PubgMatchTelemetry squadId={squadId} />
      </div>
    </main>
  );
}
