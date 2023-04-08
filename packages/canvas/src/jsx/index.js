// @ts-nocheck

import { Text } from '../components/text'
import { Sprite } from '../components/sprite'

export const h = (tag, props, ...children) => {
  // custom component
  if (typeof tag === 'function') {
    return tag({ ...props, children })
  }

  if (tag === 'Fragment') {
    return children
  }

  switch (tag) {
    case 'text':
      return new Text({ ...props, children })
    case 'sprite':
      return new Sprite({ ...props, children })
  }

  throw new Error(`Element tag not supported: ${tag}`)
}

export const Fragment = 'Fragment'

export function createContext(defaultValue) {
  let currentValue = defaultValue
  const ctx = {
    Provider: ({ value, children }) => {
      ctx.value = value
      return children()
    },
    value: currentValue,
  }

  return ctx
}

export function useContext(context) {
  return context.value
}
