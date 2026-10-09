
export function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    }
  };
}


export function renderToDOM(vnode) {
  const dom = vnode.type === 'TEXT_ELEMENT'
    ? document.createTextNode(vnode.props.nodeValue)
    : document.createElement(vnode.type);

  Object.keys(vnode.props)
    .filter(key => key !== 'children' && key !== 'nodeValue')
    .forEach(key => {
      if (key.startsWith('on')) {
        const eventType = key.toLowerCase().substring(2);
        dom.addEventListener(eventType, vnode.props[key]);
      } else if (key === 'className') {
        dom.className = vnode.props[key];
      } else {
        dom.setAttribute(key, vnode.props[key]);
      }
    });

  vnode.props.children.forEach(child => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}
