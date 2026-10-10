
import { useRef, useState } from 'react';
import type { ViewState } from './state-machine';
import './App.css';

type Item = {
  id: number;
  name: string;
};

const demoItems: Item[] = [
  { id: 1, name: 'Review PR' },
  { id: 2, name: 'Verify AST' }
];

let requestAttempt = 0;

function fetchData(): Promise<Item[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      requestAttempt++;

      if (requestAttempt === 1) {
        reject(new Error('Unable to connect to the data source.'));
      } else {
        resolve(demoItems);
      }
    }, 1500);
  });
}

function App() {
  const [state, setState] = useState<ViewState<Item[]>>({
    status: 'IDLE'
  });

  const requestId = useRef(0);

  async function loadData() {
    const currentRequest = ++requestId.current;
    console.log('Started request:', currentRequest);
    setState({ status: 'LOADING' });


    try {
      const items = await fetchData();

      if (currentRequest !== requestId.current) return;

      
      setState({
        status: 'SUCCESS',
        data: items
      });
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      
      setState({
        status: 'ERROR',
        error: err instanceof Error
          ? err.message
          : 'Unable to load data.'
      });
    }
  }

  return (
    <main className="data-feed">
      <h1>Resilient Data Feed</h1>
      <p>Current state: {state.status}</p>

      

      {state.status === 'IDLE' && (
        <button onClick={loadData}>Load Data</button>
      )}

      {state.status === 'LOADING' && (
        <section aria-label="Loading data" aria-busy="true">
          <p role="status">Loading data...</p>
          <div className="skeleton" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </section>
      )}

      {state.status === 'SUCCESS' && (
        <section aria-label="Loaded data">
          <h2>Loaded Items</h2>
          <ul>
            {state.data.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          <button onClick={loadData}>Reload Data</button>
        </section>
      )}

      {state.status === 'ERROR' && (
        <section aria-label="Connection error">
          <p role="alert">{state.error}</p>
          <button onClick={loadData}>
            Retry Connection
          </button>
        </section>
      )}
    </main>
  );
}

export default App;
