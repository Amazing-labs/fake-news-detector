const betterAuthDisableFlag =
  import.meta.env.VITE_BETTER_AUTH_DISABLE === 'true'
const allowProductionBypass =
  import.meta.env.VITE_BETTER_AUTH_ALLOW_PRODUCTION_BYPASS === 'true'

export const isBetterAuthDisabled =
  betterAuthDisableFlag && (!import.meta.env.PROD || allowProductionBypass)
