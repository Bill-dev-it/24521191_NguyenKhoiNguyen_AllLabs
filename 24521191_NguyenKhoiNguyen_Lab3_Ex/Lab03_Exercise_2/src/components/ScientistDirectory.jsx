
import { useState } from "react";
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
  const [people] = useState(initialData);

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

      <ul className={styles.list}>
        {people.map((person) => (
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
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
