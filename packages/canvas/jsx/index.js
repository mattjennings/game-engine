export * from './components/text.js'

export const h = (tag, props, ...children) => {
  // custom component
  if (typeof tag === 'function') {
    return tag({ ...props, children })
  }

  if (tag === 'Fragment') {
    return children
  }

  throw new Error(`Element tags not supported`)
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
