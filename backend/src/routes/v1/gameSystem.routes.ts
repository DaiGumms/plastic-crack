import { Router, Request, Response } from 'express';

import { GameSystemService } from '../../services/gameSystem.service';

const router = Router();
const gameSystemService = new GameSystemService();

/**
 * @route GET /api/v1/game-systems
 * @desc Get all active game systems
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const gameSystems = await gameSystemService.getActiveSystems();
    res.json(gameSystems);
  } catch {
    res.status(500).json({ error: 'Failed to fetch game systems' });
  }
});

/**
 * @route GET /api/v1/game-systems/:gameSystemId/factions
 * @desc Get factions for a specific game system
 * @access Public
 */
router.get('/:gameSystemId/factions', async (req: Request, res: Response) => {
  try {
    const { gameSystemId } = req.params;
    const factions =
      await gameSystemService.getFactionsByGameSystem(gameSystemId);
    res.json(factions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch factions' });
  }
});

export default router;
