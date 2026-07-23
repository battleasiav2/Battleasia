import { Router } from 'express';
import itemsRoutes from './items.js';
import coinsRoutes from './coins.js';
import ordersRoutes from './orders.js';

const router = Router();

router.use('/items', itemsRoutes);
router.use('/coins', coinsRoutes);
router.use('/orders', ordersRoutes);

export default router;
