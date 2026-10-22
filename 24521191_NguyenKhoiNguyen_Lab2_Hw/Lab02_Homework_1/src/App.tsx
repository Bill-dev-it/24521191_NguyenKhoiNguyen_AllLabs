
import { useEffect, useRef, useState } from "react";
import { DataGrid } from "./DataGrid";
import { assetData, assetColumns } from "./asset-data";
import type { ITAsset } from "./asset-data";

export default function App() {
  const [selectedAsset, setSelectedAsset] =
    useState<ITAsset | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeCount = assetData.filter(
    (asset) => asset.status === "Active"
  ).length;

  const maintenanceCount = assetData.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  const inactiveCount = assetData.filter(
    (asset) => asset.status === "Inactive"
  ).length;

  // Synchronize native dialog with React state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedAsset) {
      if (!dialog.open) {
        dialog.showModal();
      }

      closeButtonRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [selectedAsset]);

  function openAssetDetails(asset: ITAsset) {
    setSelectedAsset(asset);
  }

  function closeAssetDetails() {
    setSelectedAsset(null);
  }

  function handleDialogClose() {
    setSelectedAsset(null);
  }

  function getStatusClass(status: ITAsset["status"]) {
    switch (status) {
      case "Active":
        return "status-active";

      case "Maintenance":
        return "status-maintenance";

      case "Inactive":
        return "status-inactive";
    }
  }

  return (
    <main className="dashboard">
      {/* Dashboard header */}
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

        <div className="system-indicator">
          <span
            className="system-dot"
            aria-hidden="true"
          />
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Asset statistics */}
      <section
        className="stats"
        aria-label="Asset overview"
      >
        <article className="stat-card">
          <span>Total Assets</span>
          <strong>{assetData.length}</strong>
          <small>Registered company devices</small>
        </article>

        <article className="stat-card">
          <span>Active Devices</span>
          <strong>{activeCount}</strong>
          <small>Currently operational</small>
        </article>

        <article className="stat-card">
          <span>Under Maintenance</span>
          <strong>{maintenanceCount}</strong>
          <small>Devices requiring service</small>
        </article>

        <article className="stat-card">
          <span>Inactive Devices</span>
          <strong>{inactiveCount}</strong>
          <small>Not currently in operation</small>
        </article>
      </section>

      {/* Asset registry */}
      <section
        className="registry-section"
        aria-labelledby="registry-title"
      >
        <div className="section-heading">
          <div>
            <p className="section-kicker">
              INVENTORY MANAGEMENT
            </p>

            <h2 id="registry-title">
              Asset Inventory
            </h2>

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
          onRowSelect={openAssetDetails}
        />
      </section>

      {/* Accessible native modal dialog */}
      <dialog
        ref={dialogRef}
        className="asset-dialog"
        aria-labelledby="asset-dialog-title"
        aria-describedby="asset-dialog-description"
        onClose={handleDialogClose}
      >
        {selectedAsset && (
          <div className="dialog-content">
            <div className="dialog-header">
              <div>
                <p className="dialog-eyebrow">
                  ASSET INFORMATION
                </p>

                <h2 id="asset-dialog-title">
                  {selectedAsset.device}
                </h2>

                <p id="asset-dialog-description">
                  Detailed information for asset{" "}
                  {selectedAsset.id}.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="dialog-close"
                aria-label="Close asset details"
                onClick={closeAssetDetails}
              >
                ×
              </button>
            </div>

            <div className="dialog-divider" />

            <dl className="asset-details">
              <div className="detail-item">
                <dt>Asset ID</dt>
                <dd>{selectedAsset.id}</dd>
              </div>

              <div className="detail-item">
                <dt>Device Name</dt>
                <dd>{selectedAsset.device}</dd>
              </div>

              <div className="detail-item">
                <dt>Category</dt>
                <dd>{selectedAsset.category}</dd>
              </div>

              <div className="detail-item">
                <dt>Department</dt>
                <dd>{selectedAsset.department}</dd>
              </div>

              <div className="detail-item">
                <dt>Operational Status</dt>
                <dd>
                  <span
                    className={`asset-status ${getStatusClass(
                      selectedAsset.status
                    )}`}
                  >
                    {selectedAsset.status}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="dialog-footer">
              <button
                type="button"
                className="dialog-done"
                onClick={closeAssetDetails}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </dialog>

      <footer className="dashboard-bottom">
        <span>Enterprise Asset Registry</span>
        <span>Accessible Data Grid · WCAG 2.2 AA Target</span>
      </footer>
    </main>
  );
}
