
import { useState } from "react";
import { DataGrid } from "./DataGrid";
import { assetData, assetColumns } from "./asset-data";
import type { ITAsset } from "./asset-data";

export default function App() {
  const [selectedAsset, setSelectedAsset] =
    useState<ITAsset | null>(null);

  const activeCount = assetData.filter(
    (asset) => asset.status === "Active"
  ).length;

  const maintenanceCount = assetData.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            IT OPERATIONS / ASSET REGISTRY
          </p>
          <h1>Enterprise Asset Management</h1>
          <p className="subtitle">
            Centralized inventory and device lifecycle
            monitoring.
          </p>
        </div>

        <span className="environment-label">
          SYSTEM ONLINE
        </span>
      </header>

      <section
        className="stats"
        aria-label="Asset overview"
      >
        <article className="stat-card">
          <span>Total Assets</span>
          <strong>{assetData.length}</strong>
        </article>

        <article className="stat-card">
          <span>Active Devices</span>
          <strong>{activeCount}</strong>
        </article>

        <article className="stat-card">
          <span>Under Maintenance</span>
          <strong>{maintenanceCount}</strong>
        </article>
      </section>

      <section
        className="registry-section"
        aria-labelledby="registry-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="registry-title">Asset Inventory</h2>
            <p>
              Enterprise devices and infrastructure
            </p>
          </div>

          <span className="record-label">
            {assetData.length} REGISTERED
          </span>
        </div>

        <DataGrid<ITAsset>
          data={assetData}
          columns={assetColumns}
          ariaLabel="Enterprise IT asset inventory"
          onRowSelect={setSelectedAsset}
        />
      </section>

      {selectedAsset && (
        <section
          className="selection-panel"
          aria-labelledby="selection-title"
        >
          <h2 id="selection-title">Selected Asset</h2>
          <p>
            <strong>{selectedAsset.id}</strong>
            {" — "}
            {selectedAsset.device}
          </p>
          <p>
            Department: {selectedAsset.department}
          </p>
          <button
            type="button"
            onClick={() => setSelectedAsset(null)}
          >
            Close details
          </button>
        </section>
      )}
    </main>
  );
}
