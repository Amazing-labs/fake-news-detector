export function hasProcessEnv(): boolean {
  return typeof process !== 'undefined' && typeof process.env !== 'undefined'
}

export function readProcessEnv(name: string): string | undefined {
  return hasProcessEnv() ? process.env[name] : undefined
}
