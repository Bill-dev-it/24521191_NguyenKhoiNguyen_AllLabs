
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
