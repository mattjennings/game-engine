export interface Store<T> {
  subscribe(subscriber: (value: T) => void): void
  unsubscribe(subscriber: (value: T) => void): void
  get(): T
}

export interface Writable<T> extends Store<T> {
  set(newValue: T | ((value: T) => T)): void
}

export function writable<T>(value: T): Writable<T> {
  const subscribers = new Set<(value: T) => void>()

  return {
    subscribe(subscriber) {
      subscribers.add(subscriber)
    },
    unsubscribe(subscriber) {
      subscribers.delete(subscriber)
    },
    set(newValue) {
      value = isFunction(newValue) ? newValue(value) : newValue

      for (const subscriber of subscribers) {
        subscriber(value)
      }
    },
    get() {
      return value
    },
  }
}

export function derived<T, U>(
  stores: Store<T>[],
  callback: (values: T[]) => U
): Store<U> {
  const subscribers = new Set<(value: U) => void>()
  let value: U

  function update() {
    value = callback(stores.map((store) => store.get()))
    for (const subscriber of subscribers) {
      subscriber(value)
    }
  }

  for (const store of stores) {
    store.subscribe(update)
  }

  return {
    subscribe(subscriber) {
      subscribers.add(subscriber)
    },
    unsubscribe(subscriber) {
      subscribers.delete(subscriber)
    },
    get() {
      return value
    },
  }
}

const isFunction = (x: unknown): x is Function => typeof x === 'function'
