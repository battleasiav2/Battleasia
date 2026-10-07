import { Router } from 'express';
import { CouponError, quoteCoupon } from '../../../utils/shop-coupon.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';

const router = Router();

router.post('/apply', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const code = String(req.body?.code || '');
    const coinAmount = Number(req.body?.coin_amount);
    const quote = await quoteCoupon(code, coinAmount);
    return res.json({ status: true, data: quote });
  } catch (error) {
    if (error instanceof CouponError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('apply coupon error:', error);
    return res.status(500).json({ status: false, message: 'Could not apply coupon' });
  }
});

export default router;
