export function readProcessEnv(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env?.[name] : undefined
}
