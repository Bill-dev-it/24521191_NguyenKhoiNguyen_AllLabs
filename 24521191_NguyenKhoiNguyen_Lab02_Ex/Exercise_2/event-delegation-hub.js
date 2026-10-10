
export function setupEventDelegation(rootContainer) {
  rootContainer.addEventListener('click', (nativeEvent) => {
    let target = nativeEvent.target;

    while (target && target !== rootContainer) {
      const handler = target.__vnode?.props?.onClick;

      if (typeof handler === 'function') {
        handler(nativeEvent);
        break;
      }

      target = target.parentElement;
    }
  });
}
