import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const command = process.argv.join(' ')
const isMigrationCommand =
  command.includes('migrate') || command.includes('push') || command.includes('deploy')

const PLACEHOLDER_DATABASE_URL =
  'postgresql://placeholder:placeholder@localhost:5432/placeholder'

function resolveDatasourceUrl() {
  if (isMigrationCommand) {
    return env('DIRECT_URL')
  }

  return process.env.DATABASE_URL ?? PLACEHOLDER_DATABASE_URL
}

export default defineConfig({
  schema: './prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolveDatasourceUrl(),
  },
})
