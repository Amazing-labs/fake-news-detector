const betterAuthDisableFlag = import.meta.env.BETTER_AUTH_DISABLE === 'true'

if (import.meta.env.PROD && betterAuthDisableFlag) {
  throw new Error('BETTER_AUTH_DISABLE cannot be enabled in production builds.')
}

export const isBetterAuthDisabled = import.meta.env.DEV && betterAuthDisableFlag
