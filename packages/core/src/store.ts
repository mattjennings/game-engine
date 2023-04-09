export interface Store<T> {
  (): T
  subscribe(subscriber: (value: T) => void): void
  unsubscribe(subscriber: (value: T) => void): void
  get(): T
}

export interface Writable<T> extends Store<T> {
  set(newValue: T | ((value: T) => T)): void
}

export function writable<T>(value: T): Writable<T> {
  const subscribers = new Set<(value: T) => void>()

  function set(newValue: T | ((value: T) => T)) {
    value = isFunction(newValue) ? (newValue as Function)(value) : newValue
    for (const subscriber of subscribers) {
      subscriber(value)
    }
  }

  function subscribe(subscriber: (value: T) => void) {
    subscribers.add(subscriber)
    subscriber(value)
  }

  function unsubscribe(subscriber: (value: T) => void) {
    subscribers.delete(subscriber)
  }

  return Object.assign(() => value, {
    subscribe,
    unsubscribe,
    set,
    get: () => value,
  })
}

export function derived<T, U>(
  stores: Store<T>[],
  callback: (values: T[]) => U
): Store<U> {
  const subscribers = new Set<(value: U) => void>()
  let value: U

  function update() {
    value = callback(stores.map((store) => store()))
    for (const subscriber of subscribers) {
      subscriber(value)
    }
  }

  for (const store of stores) {
    store.subscribe(update)
  }

  function subscribe(subscriber: (value: U) => void) {
    subscribers.add(subscriber)
  }
  function unsubscribe(subscriber: (value: U) => void) {
    subscribers.delete(subscriber)
  }

  return Object.assign(() => value, {
    subscribe,
    unsubscribe,
    get: () => value,
  })
}

const isFunction = (x: unknown): x is Function => typeof x === 'function'
