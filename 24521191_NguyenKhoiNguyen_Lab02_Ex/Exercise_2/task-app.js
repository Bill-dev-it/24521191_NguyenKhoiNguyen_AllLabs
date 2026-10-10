
import { useState } from './reactive-engine.js';

function h(type, props = {}, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.flat()
    }
  };
}

export function TaskApp() {
  const [tasks, setTasks] = useState([
    'Review PR',
    'Verify AST'
  ]);
  const [filter, setFilter] = useState('ALL');

  const visibleTasks =
    filter === 'ALL'
      ? tasks
      : tasks.filter(task => task.includes(filter));

  return h('main', { className: 'app-container' },
    h('header', {},
      h('h1', {}, 'Reactive Task Manager'),
      h('h2', {}, `Tasks: ${tasks.length}`)
    ),
    h('section', { 'aria-label': 'Task controls' },
      h('button', {
        onClick: () =>
          setTasks(previous => [
            ...previous,
            `Task ${Date.now()}`
          ])
      }, 'Add Task')
    ),
    h('section', { 'aria-label': 'Task filters' },
      ...['ALL', 'Review', 'Verify'].map(option =>
        h('button', {
          onClick: () => setFilter(option),
          'aria-pressed': String(filter === option)
        }, option)
      )
    ),
    h('section', { 'aria-label': 'Task list' },
      h('ul', {},
        ...visibleTasks.map(task =>
          h('li', {}, task)
        )
      )
    )
  );
}
