// Manual reconciliation sweep (dry-run by default).
// bun run sweep | sweep --apply | sweep --apply --force
import { prisma } from '../infrastructure/config/database'
import { createAppDependencies } from '../interfaces/createAppDependencies'

async function main() {
  const dependencies = createAppDependencies()
  const dryRun = !process.argv.includes('--apply')
  const force = process.argv.includes('--force')
  const report = await dependencies.storageMaintenanceService.sweepOrphans({
    dryRun,
    force,
  })
  console.log('Sweep report:', report)
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
