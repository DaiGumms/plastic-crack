import { Router, Request, Response } from 'express';

import { GameSystemService } from '../../services/gameSystem.service';

const router = Router();
const gameSystemService = new GameSystemService();

/**
 * @route GET /api/v1/game-systems
 * @desc Get all active game systems
 * @access Public
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const gameSystems = await gameSystemService.getActiveSystems();
      res.json(gameSystems);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game systems' });
    }
  }
);

export default router;
