import { runInPrismaTransaction } from '../../infrastructure/config/database'
import {
  createFactCheckingService,
  type FactCheckingServiceRepositoryDependencies,
} from './createFactCheckingService'

export function createTransactionalFactCheckingService(
  dependencies: FactCheckingServiceRepositoryDependencies,
) {
  return createFactCheckingService(
    dependencies,
    undefined,
    runInPrismaTransaction,
  )
}
