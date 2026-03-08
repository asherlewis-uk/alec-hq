export async function register() {
  if (process.env.NODE_ENV === 'production') {
    console.info('[instrumentation] ALEC.HQ server instrumentation initialized')
  }
}
