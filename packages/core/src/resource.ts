export abstract class Resource<T> {
  public abstract load(): Promise<T>
  public abstract unload(): Promise<void>

  public abstract get(): T | undefined
  public abstract isLoaded: boolean

  public abstract onLoaded(callback: (resource: T) => void): void
  public abstract onUnloaded(callback: () => void): void
}
