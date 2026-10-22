
import { useId, useMemo, useState } from "react";
import type { DataGridProps } from "./data-grid-contract";
import "./DataGrid.css";

type SortDirection = "asc" | "desc" | null;

interface SortState<T> {
  key: keyof T | null;
  direction: SortDirection;
}

const PAGE_SIZE = 5;

export function DataGrid<T extends object>({
  data,
  columns,
  ariaLabel,
  onRowSelect,
}: DataGridProps<T>) {
  const searchId = useId();

  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Stage 4A: Filtering
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = item[column.accessorKey];
        return String(value ?? "")
          .toLowerCase()
          .includes(query);
      })
    );
  }, [data, columns, searchQuery]);

  // Stage 4B: Sorting
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const first = a[sort.key!];
      const second = b[sort.key!];

      const comparison = String(first ?? "").localeCompare(
        String(second ?? ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );

      return sort.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [filteredData, sort]);

  // Stage 4C: Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;

  const visibleData = sortedData.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const firstRecord =
    sortedData.length === 0 ? 0 : startIndex + 1;

  const lastRecord = Math.min(
    startIndex + PAGE_SIZE,
    sortedData.length
  );

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleSort(key: keyof T) {
    setSort((previous) => {
      if (previous.key !== key) {
        return { key, direction: "asc" };
      }

      if (previous.direction === "asc") {
        return { key, direction: "desc" };
      }

      return { key: null, direction: null };
    });

    setCurrentPage(1);
  }

  function getAriaSort(
    key: keyof T
  ): "ascending" | "descending" | "none" {
    if (sort.key !== key) return "none";

    return sort.direction === "asc"
      ? "ascending"
      : "descending";
  }

  function getSortIcon(key: keyof T) {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  }

  return (
    <div className="grid-container">
      <div className="grid-toolbar">
        <div className="search-field">
          <label htmlFor={searchId}>
            Search assets
          </label>

          <input
            id={searchId}
            type="search"
            value={searchQuery}
            placeholder="Search ID, device, department..."
            onChange={(event) =>
              handleSearch(event.target.value)
            }
          />
        </div>

        <div className="filter-summary" role="status">
          {sortedData.length} matching records
        </div>
      </div>

      <div className="grid-scroll">
        <table
          className="asset-table"
          aria-label={ariaLabel}
        >
          <thead>
            <tr>
              {columns.map((column) => {
                const key = column.accessorKey;

                return (
                  <th
                    key={String(key)}
                    scope="col"
                    aria-sort={
                      column.sortable
                        ? getAriaSort(key)
                        : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="sort-button"
                        onClick={() => handleSort(key)}
                      >
                        <span>{column.header}</span>

                        <span
                          className="sort-icon"
                          aria-hidden="true"
                        >
                          {getSortIcon(key)}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}

              {onRowSelect && (
                <th scope="col">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onRowSelect ? 1 : 0)
                  }
                  className="empty-state"
                >
                  No matching assets found.
                </td>
              </tr>
            ) : (
              visibleData.map((item, index) => (
                <tr key={startIndex + index}>
                  {columns.map((column) => (
                    <td
                      key={String(column.accessorKey)}
                    >
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
          Showing {firstRecord}–{lastRecord} of{" "}
          {sortedData.length} records
        </span>

        <nav
          className="pagination"
          aria-label="Asset table pagination"
        >
          <button
            type="button"
            className="page-button"
            disabled={safePage === 1}
            onClick={() =>
              setCurrentPage(safePage - 1)
            }
          >
            Previous
          </button>

          <span className="page-indicator">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            className="page-button"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage(safePage + 1)
            }
          >
            Next
          </button>
        </nav>
      </div>

      <p className="sr-only" aria-live="polite">
        Page {safePage} of {totalPages}.
        Showing {visibleData.length} of{" "}
        {sortedData.length} matching records.
      </p>
    </div>
  );
}
