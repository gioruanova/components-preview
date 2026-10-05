/** First-time visitors see the /benchmark presentation once; after that the tool starts at home. */
const KEY = 'live-preview:benchmark-seen'

export function hasSeenBenchmark(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true // storage blocked: never force the redirect
  }
}

export function markBenchmarkSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // storage blocked: nothing to remember
  }
}
