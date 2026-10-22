
import type { DataGridProps } from "./data-grid-contract";
import "./DataGrid.css";

export function DataGrid<T extends object>({
  data,
  columns,
  ariaLabel,
  onRowSelect,
}: DataGridProps<T>) {
  return (
    <div className="grid-container">
      <div className="grid-scroll">
        <table className="asset-table" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessorKey)}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
              {onRowSelect && (
                <th scope="col">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (onRowSelect ? 1 : 0)
                  }
                  className="empty-state"
                >
                  No assets available.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={String(column.accessorKey)}>
                      {String(
                        item[column.accessorKey] ?? ""
                      )}
                    </td>
                  ))}

                  {onRowSelect && (
                    <td>
                      <button
                        type="button"
                        className="row-action"
                        aria-label={`View asset ${String(
                          item[columns[0].accessorKey]
                        )}`}
                        onClick={() => onRowSelect(item)}
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid-footer">
        <span>
          Total records: <strong>{data.length}</strong>
        </span>
        <span>IT Asset Registry</span>
      </div>
    </div>
  );
}
