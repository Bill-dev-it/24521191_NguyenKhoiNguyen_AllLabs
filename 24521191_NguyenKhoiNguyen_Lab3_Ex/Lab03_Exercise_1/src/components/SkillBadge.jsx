
export default function SkillBadge({
  name,
  tier = "Core",
}) {
  return (
    <li>
      <strong>{name}</strong>
      <span> — {tier}</span>
    </li>
  );
}
