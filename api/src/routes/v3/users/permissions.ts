import { Router } from 'express';
import { ALL_PERMISSIONS } from '../../../constants/permissions.js';
import { requireAuth } from '../../../middleware/auth.js';
import { safeQueryString } from '../../../utils/query-filter.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const category = safeQueryString(req.query.category);
  const permissions = category
    ? ALL_PERMISSIONS.filter((p) => p.category === category)
    : ALL_PERMISSIONS;

  return res.json({
    status: true,
    data: permissions.map((p) => ({
      key: p.key,
      value: p.key,
      label: p.label,
      category: p.category,
    })),
  });
});

export default router;
