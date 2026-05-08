// infrastructure/repositories/
import type { AuthoritySource as PrismaAuthoritySourceRow } from '@prisma/client'
import {
  AuthoritySource,
  type SourceType,
} from '../../../domain/entities/AuthoritySource'
import type { IAuthoritySourceRepository } from '../../../domain/repositories/IAuthoritySourceRepository'
import { prisma } from '../../config/database'

export class PrismaAuthoritySourceRepository implements IAuthoritySourceRepository {
  async save(authoritySource: AuthoritySource): Promise<void> {
    await prisma.authoritySource.create({
      data: {
        id: authoritySource.id,
        name: authoritySource.name,
        type: authoritySource.type,
        createdAt: authoritySource.createdAt,
      },
    })
  }

  async saveMany(authoritySources: AuthoritySource[]): Promise<void> {
    if (authoritySources.length === 0) return

    await prisma.authoritySource.createMany({
      data: authoritySources.map((authoritySource) => ({
        id: authoritySource.id,
        name: authoritySource.name,
        type: authoritySource.type,
        createdAt: authoritySource.createdAt,
      })),
    })
  }

  async findById(id: string): Promise<AuthoritySource | null> {
    const row = await prisma.authoritySource.findUnique({
      where: {
        id,
      },
    })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<AuthoritySource[]> {
    const rows = await prisma.authoritySource.findMany()
    return rows.map((row) => this.toDomain(row))
  }

  async findByType(type: SourceType): Promise<AuthoritySource[]> {
    const rows = await prisma.authoritySource.findMany({
      where: {
        type,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async delete(id: string): Promise<void> {
    await prisma.authoritySource.delete({
      where: {
        id,
      },
    })
  }

  private toDomain(row: PrismaAuthoritySourceRow): AuthoritySource {
    return new AuthoritySource(
      row.id,
      row.name,
      row.type as SourceType,
      row.createdAt,
    )
  }
}
