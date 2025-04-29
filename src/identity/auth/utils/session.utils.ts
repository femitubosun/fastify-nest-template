export function makeSessionKey(identifier: string): string {
  return `session:${identifier}`;
}
