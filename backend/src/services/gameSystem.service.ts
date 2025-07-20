/**
 * Game System Service
 * Handles all game system-related business logic and database operations
 */

import { PrismaClient, GameSystem, Faction } from '../generated/prisma';

export class GameSystemService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all active game systems
   */
  async getActiveSystems(): Promise<GameSystem[]> {
    return this.prisma.gameSystem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  /**
   * Get game system by ID
   */
  async getSystemById(id: string): Promise<GameSystem | null> {
    return this.prisma.gameSystem.findUnique({
      where: { id },
    });
  }

  /**
   * Get game system by short name
   */
  async getSystemByShortName(shortName: string): Promise<GameSystem | null> {
    return this.prisma.gameSystem.findUnique({
      where: { shortName },
    });
  }

  /**
   * Get factions for a specific game system
   */
  async getFactionsByGameSystem(gameSystemId: string): Promise<Faction[]> {
    return this.prisma.faction.findMany({
      where: {
        gameSystemId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
