
import { Fragment, useId, useState } from "react";
import SkillBadge from "./SkillBadge";
import styles from "./DeveloperCard.module.css";

export function DeveloperCard({
  fullName = "Nguyen Khoi Nguyen",
  role = "Senior Systems Architect • UIT SS3T",
  avatarUrl =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240",
  metrics = {
    commits: 512,
    downNodes: 0,
    allyScore: 100,
  },
  skills = [
    { id: "sk-1", name: "React 19 Fiber", tier: "Core" },
    { id: "sk-2", name: "TypeScript", tier: "Advanced" },
    { id: "sk-3", name: "Cloud Architecture", tier: "Expert" },
  ],
}) {
  const headingId = useId();
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "DP";

  return (
    <article
      className={styles.card}
      aria-labelledby={headingId}
    >
      <header className={styles.header}>
        {avatarFailed || !avatarUrl ? (
          <span
            className={styles.avatarFallback}
            aria-label={`${fullName} avatar fallback`}
            role="img"
          >
            {initials}
          </span>
        ) : (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={`${fullName} profile avatar`}
            width="64"
            height="64"
            onError={() => setAvatarFailed(true)}
          />
        )}

        <hgroup>
          <h2 id={headingId}>{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <section aria-label="Developer skills">
        <h3>Engineered Skills</h3>
        <ul
          className={styles.skills}
          aria-label="Engineered Skills"
        >
          {skills.map((skill) => (
            <SkillBadge
              key={skill.id}
              name={skill.name}
              tier={skill.tier}
            />
          ))}
        </ul>
      </section>
    </article>
  );
}
