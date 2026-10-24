
import { DeveloperCard } from "./components/DeveloperCard";
import "./App.css";

export default function App() {
  return (
    <main>
      <header>
        <p>LAB03 / REACT 19 / SEMANTIC ENGINEERING</p>
        <h1>Engineer & Pro-Gamer Profile</h1>
        <p>
          Accessible component architecture with semantic HTML
          and reusable skills.
        </p>
      </header>

      <DeveloperCard
        fullName="Nguyen Khoi Nguyen"
        role="Software Engineer • Competitive Gamer"
        metrics={{
          projects: 24,
          rankPoints: 2850,
          accessibility: 100,
        }}
        skills={[
          { id: "react", name: "React 19", tier: "Core" },
          { id: "node", name: "Node.js", tier: "Advanced" },
          { id: "gaming", name: "Esports Strategy", tier: "Expert" },
          { id: "cloud", name: "Cloud Systems", tier: "Core" },
        ]}
      />
    </main>
  );
}
