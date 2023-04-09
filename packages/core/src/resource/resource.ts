import { EventEmitter } from 'events'
import { writable } from '../store'

export abstract class Resource {
  public abstract isLoaded: boolean
  public abstract load(): Promise<void>
}

export class ResourceLoader<
  T extends Record<string, Resource> = Record<string, Resource>
> extends EventEmitter {
  private resources: Map<keyof T, T[keyof T]> = new Map()
  progress = writable(0)
  batchSize = 10

  constructor({
    resources,
    batchSize,
  }: {
    batchSize?: number
    resources?: T
  } = {}) {
    super()

    if (batchSize) {
      this.batchSize = batchSize
    }

    if (resources) {
      for (const [key, resource] of Object.entries(resources)) {
        this.resources.set(key as keyof T, resource as T[keyof T])
      }
    }
    this.progress.subscribe((value) => {
      this.emit('progress', value)
    })
  }

  public add(resourceOrKey: string, resource?: Resource): void {
    if (typeof resourceOrKey === 'string') {
      if (resource) {
        this.resources.set(resourceOrKey as any, resource as any)
      } else {
        throw new Error('resource is required when key is provided')
      }
    } else {
      this.resources.set(resourceOrKey as any, resourceOrKey)
    }
  }

  public get<K extends keyof T>(key: K): T[K] | undefined
  public get(key: string): Resource | undefined
  public get(key: Union<keyof T, string> | string): Resource | undefined {
    return this.resources.get(key as keyof T)
  }

  public async load() {
    const resources = Array.from(this.resources.values())
    const queue = resources.filter((resource) => !resource.isLoaded)
    const batches = Math.ceil(queue.length / this.batchSize)

    this.emit('start')

    for (let i = 0; i < batches; i++) {
      const batch = queue.slice(i * this.batchSize, (i + 1) * this.batchSize)
      const promises = batch.map((resource) => resource.load())

      await Promise.all(promises)
      this.progress.set((i + 1) / batches)
    }
    this.emit('complete')
  }
}

// allows for union to be either const or string for better intellisense
interface Nothing {}
type Union<T, U> = T | (U & Nothing)
