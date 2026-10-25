
import { useId, useRef, useState } from "react";
import { SMART_PEOPLE } from "../data/scientists";
import styles from "./ScientistDirectory.module.css";

/**
 * Lab03 Exercise 2 — Scientist Directory
 *
 * Inheritance from Lab02 Exercise 2:
 * - Dynamic list rendering
 * - Reactive state management
 * - Immutable state principles
 *
 * React 19 replaces the custom Lab02 state engine.
 *
 * Stage 1: Data foundation and stable list identities.
 * Stage 2: Search, IQ filtering, and sorting.
 * Stage 3: Delete, reset, and live status.
 */
export function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
    const [people, setPeople] = useState(initialData);
    const resetButtonRef = useRef(null);

    const [query, setQuery] = useState("");
    const [minIq, setMinIq] = useState(0);
    const [minIqDraft, setMinIqDraft] = useState("0");
    const [sortBy, setSortBy] = useState("iq-desc");

    const searchId = useId();
    const minIqId = useId();
    const sortId = useId();

    
/**
 * Checkpoint 2D — Derived Search, Filter & Sort
 *
 * Lab02 inheritance:
 * visibleTasks was derived directly from state.
 *
 * Lab03 extension:
 * Search -> Numeric IQ Filter -> Immutable Sorting.
 *
 * No useEffect, no redundant derived state.
 */
    const normalizedQuery = query.trim().toLowerCase();

    const visiblePeople = people
    .filter(
        (person) =>
        person.name.toLowerCase().includes(normalizedQuery) &&
        person.iq >= minIq
    )
    .toSorted((a, b) => {
        switch (sortBy) {
        case "iq-asc":
            return a.iq - b.iq;

        case "age-desc":
            return b.age - a.age;

        case "age-asc":
            return a.age - b.age;

        case "iq-desc":
        default:
            return b.iq - a.iq;
        }
    });


    /**
     * Stage 3 — Immutable Delete and Full Reset
     *
     * Lab02 inheritance:
     * - Functional state updates
     * - Immutable collection transformations
     * - Stable identity during reconciliation
     */

    // Delete by persistent ID; do not mutate the source array.
    const handleDelete = (id) => {
    setPeople((previous) =>
        previous.filter((person) => person.id !== id)
    );

    // Move focus to a persistent control before unmounting
    // the Delete button that was activated.
    resetButtonRef.current?.focus();
    };

    // Restore the full original dataset, including sp-7.
    const handleReset = () => {
    setPeople([...initialData]);
    setQuery("");
    setMinIq(0);
    setMinIqDraft("0");
    setSortBy("iq-desc");
    };



  return (
    <section
      className={styles.directory}
      aria-labelledby="directory-title"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Lab03 / Exercise 2</p>
        <h1 id="directory-title">
          Scientist & Pioneer Directory
        </h1>
        <p className={styles.description}>
          Explore notable scientists and pioneers through
          a React 19 directory.
        </p>
      </header>
    
        <form
        className={styles.controls}
        role="search"
        onSubmit={(event) => event.preventDefault()}
        >
        <div className={styles.field}>
            <label htmlFor={searchId}>Search Scientist</label>
            <input
            id={searchId}
            type="search"
            placeholder="Search by name..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            />
        </div>

        <div className={styles.field}>
            <label htmlFor={minIqId}>Minimum IQ</label>
            
        <input
        id={minIqId}
        type="number"
        min="0"
        step="1"
        value={minIqDraft}
        onChange={(event) => {
            const rawValue = event.target.value;
            const numericValue = event.target.valueAsNumber;

            setMinIqDraft(rawValue);

            setMinIq(
            Number.isNaN(numericValue)
                ? 0
                : Math.max(0, numericValue)
            );
        }}
        />

        </div>

        <div className={styles.field}>
            <label htmlFor={sortId}>Sort By</label>
            <select
            id={sortId}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            >
            <option value="iq-desc">IQ: High to Low</option>
            <option value="iq-asc">IQ: Low to High</option>
            <option value="age-desc">Age: Oldest First</option>
            <option value="age-asc">Age: Youngest First</option>
            </select>
        </div>
        </form>


        <div className={styles.toolbar}>
        <output
            className={styles.status}
            role="status"
            aria-live="polite"
        >
            Found {visiblePeople.length} pioneers
        </output>

        <button
            ref={resetButtonRef}
            className={styles.resetButton}
            type="button"
            onClick={handleReset}
        >
            Reset Directory
        </button>
        </div>


      <ul className={styles.list}>
        {visiblePeople.map((person) => (
          <li key={person.id} className={styles.item}>
            <article className={styles.card}>
              <h2 className={styles.name}>{person.name}</h2>

              <dl className={styles.metrics}>
                <div className={styles.metric}>
                  <dt>Age</dt>
                  <dd>{person.age}</dd>
                </div>

                <div className={styles.metric}>
                  <dt>IQ</dt>
                  <dd>{person.iq}</dd>
                </div>
              </dl>

              
                <button
                type="button"
                className={styles.deleteButton}
                aria-label={`Delete ${person.name}`}
                onClick={() => handleDelete(person.id)}
                >
                Delete
                </button>

            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
