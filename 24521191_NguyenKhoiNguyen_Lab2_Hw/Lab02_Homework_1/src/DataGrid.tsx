
import {
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DataGridProps,
} from "./data-grid-contract";
import "./DataGrid.css";

type SortDirection = "asc" | "desc" | null;

interface SortState<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface CellPosition {
  row: number;
  col: number;
}

const PAGE_SIZE = 5;

export function DataGrid<T extends object>({
  data,
  columns,
  ariaLabel,
  onRowSelect,
}: DataGridProps<T>) {
  const searchId = useId();
  const instructionsId = useId();

  const tableRef = useRef<HTMLTableElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [focusedCell, setFocusedCell] =
    useState<CellPosition>({ row: 0, col: 0 });

  const [selectedItem, setSelectedItem] =
    useState<T | null>(null);

  const [announcement, setAnnouncement] =
    useState("");

  // 1. FILTERING
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data;

    return data.filter((item) =>
      columns.some((column) =>
        String(item[column.accessorKey] ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [data, columns, searchQuery]);

  // 2. SORTING
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) {
      return filteredData;
    }

    const key = sort.key;

    return [...filteredData].sort((a, b) => {
      const result = String(a[key] ?? "").localeCompare(
        String(b[key] ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" }
      );

      return sort.direction === "asc"
        ? result
        : -result;
    });
  }, [filteredData, sort]);

  // 3. PAGINATION
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
    sortedData.length > 0 ? startIndex + 1 : 0;

  const lastRecord = Math.min(
    startIndex + PAGE_SIZE,
    sortedData.length
  );

  const columnCount = columns.length;

  const safeFocusedCell: CellPosition = {
    row: Math.min(
      focusedCell.row,
      Math.max(visibleData.length - 1, 0)
    ),
    col: Math.min(
      focusedCell.col,
      Math.max(columnCount - 1, 0)
    ),
  };

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
    setFocusedCell({ row: 0, col: 0 });
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
    setFocusedCell({ row: 0, col: 0 });
  }

  function getAriaSort(key: keyof T) {
    if (sort.key !== key) return "none" as const;

    return sort.direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  }

  function getSortIcon(key: keyof T) {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  }

  function changePage(nextPage: number) {
    setCurrentPage(nextPage);
    setFocusedCell({ row: 0, col: 0 });
    setAnnouncement(
      `Page ${nextPage} of ${totalPages}`
    );
  }

  // 4. ROVING TABINDEX
  function moveFocus(row: number, col: number) {
    const nextRow = Math.max(
      0,
      Math.min(row, visibleData.length - 1)
    );

    const nextCol = Math.max(
      0,
      Math.min(col, columnCount - 1)
    );

    const cell = tableRef.current?.querySelector<
      HTMLTableCellElement
    >(
      `[data-cell="${nextRow}-${nextCol}"]`
    );

    if (cell) {
      setFocusedCell({
        row: nextRow,
        col: nextCol,
      });

      cell.focus();
    }
  }

  // 5. KEYBOARD INTERACTION
  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number,
    item: T
  ) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(rowIndex, colIndex + 1);
        break;

      case "ArrowLeft":
        event.preventDefault();
        moveFocus(rowIndex, colIndex - 1);
        break;

      case "ArrowDown":
        event.preventDefault();
        moveFocus(rowIndex + 1, colIndex);
        break;

      case "ArrowUp":
        event.preventDefault();
        moveFocus(rowIndex - 1, colIndex);
        break;

      case "Enter":
        event.preventDefault();
        if (onRowSelect) {
          onRowSelect(item);
          setAnnouncement("Asset details opened");
        }
        break;

      case " ":
        event.preventDefault();
        setSelectedItem((previous) =>
          previous === item ? null : item
        );

        setAnnouncement(
          selectedItem === item
            ? "Row deselected"
            : "Row selected"
        );
        break;

      default:
        break;
    }
  }

  return (
    <div className="grid-container">
      <p id={instructionsId} className="sr-only">
        Use arrow keys to navigate grid cells.
        Press Enter to open asset details.
        Press Space to select or deselect a row.
      </p>

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
          ref={tableRef}
          role="grid"
          className="asset-table"
          aria-label={ariaLabel}
          aria-describedby={instructionsId}
          aria-multiselectable="false"
          aria-colcount={
            columnCount + (onRowSelect ? 1 : 0)
          }
          aria-rowcount={sortedData.length + 1}
        >
          <thead>
            <tr role="row" aria-rowindex={1}>
              {columns.map((column) => (
                <th
                  key={String(column.accessorKey)}
                  role="columnheader"
                  scope="col"
                  aria-sort={
                    column.sortable
                      ? getAriaSort(column.accessorKey)
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="sort-button"
                      onClick={() =>
                        handleSort(column.accessorKey)
                      }
                    >
                      <span>{column.header}</span>
                      <span
                        className="sort-icon"
                        aria-hidden="true"
                      >
                        {getSortIcon(column.accessorKey)}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}

              {onRowSelect && (
                <th role="columnheader" scope="col">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {visibleData.length === 0 ? (
              <tr role="row">
                <td
                  role="gridcell"
                  colSpan={
                    columnCount + (onRowSelect ? 1 : 0)
                  }
                  className="empty-state"
                  tabIndex={0}
                >
                  No matching assets found.
                </td>
              </tr>
            ) : (
              visibleData.map((item, rowIndex) => {
                const isSelected =
                  selectedItem === item;

                return (
                  <tr
                    key={String(
                      item[columns[0].accessorKey]
                    )}
                    role="row"
                    aria-rowindex={
                      startIndex + rowIndex + 2
                    }
                    aria-selected={isSelected}
                    className={
                      isSelected ? "selected-row" : ""
                    }
                  >
                    {columns.map((column, colIndex) => {
                      const isFocused =
                        safeFocusedCell.row === rowIndex &&
                        safeFocusedCell.col === colIndex;

                      return (
                        <td
                          key={String(column.accessorKey)}
                          role="gridcell"
                          data-cell={`${rowIndex}-${colIndex}`}
                          tabIndex={isFocused ? 0 : -1}
                          onFocus={() =>
                            setFocusedCell({
                              row: rowIndex,
                              col: colIndex,
                            })
                          }
                          onKeyDown={(event) =>
                            handleCellKeyDown(
                              event,
                              rowIndex,
                              colIndex,
                              item
                            )
                          }
                        >
                          {String(
                            item[column.accessorKey] ?? ""
                          )}
                        </td>
                      );
                    })}

                    {onRowSelect && (
                      <td role="gridcell">
                        <button
                          type="button"
                          className="row-action"
                          aria-label={`View asset ${String(
                            item[columns[0].accessorKey]
                          )}`}
                          onClick={() =>
                            onRowSelect(item)
                          }
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
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
              changePage(safePage - 1)
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
              changePage(safePage + 1)
            }
          >
            Next
          </button>
        </nav>
      </div>

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </div>
  );
}
