import { setupEventDelegation } from './event-delegation-hub.js';

export const stateStore = [];

export let cursor = 0;

export function resetCursor() {
  cursor = 0;
}


let triggerRender = () => {};

export function setRenderer(renderFn) {
  triggerRender = renderFn;
}

export function useState(initialValue) {
  const currentCursor = cursor;

  if (stateStore[currentCursor] === undefined) {
    stateStore[currentCursor] = initialValue;
  }

  const setState = (nextValue) => {
    const previousValue = stateStore[currentCursor];

    const resolvedValue =
      typeof nextValue === 'function'
        ? nextValue(previousValue)
        : nextValue;

    if (!Object.is(previousValue, resolvedValue)) {
      stateStore[currentCursor] = resolvedValue;
      triggerRender();
    }
  };

  cursor++;

  return [stateStore[currentCursor], setState];
}



let rootContainer = null;
let application = null;

function createDOM(vnode) {
  if (typeof vnode !== 'object' || vnode === null) {
    return document.createTextNode(String(vnode));
  }

  const dom = document.createElement(vnode.type);
  dom.__vnode = vnode;

  const { children = [], ...props } = vnode.props || {};

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      dom.className = value;
    } else if (!key.startsWith('on')) {
      dom.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    dom.appendChild(createDOM(child));
  });

  return dom;
}

export function renderApp(appFn, root) {
  application = appFn;
  rootContainer = root;

  setupEventDelegation(rootContainer);

  setRenderer(() => {
    resetCursor();
    const vnode = application();
    rootContainer.replaceChildren(createDOM(vnode));
  });

  resetCursor();
  rootContainer.replaceChildren(createDOM(application()));
}
