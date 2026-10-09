
// Checkpoint 1 Verification Test Suite:
import { createElement, renderToDOM } from './mini-react.js';

const vApp = createElement('main', { id: 'root-view', role: 'main' },
  createElement('header', { className: 'hero' },
    createElement('h1', null, 'Mini React Engine'),
    createElement('p', null, '<img onerror=alert(1)> Safe Text')
  ),
  createElement('button', { onClick: () => console.log('Ping') }, 'Click')
);

const root = document.getElementById('app');
root.replaceChildren(renderToDOM(vApp));
console.assert(root.querySelector('button') !== null, 'Mount Failed');
