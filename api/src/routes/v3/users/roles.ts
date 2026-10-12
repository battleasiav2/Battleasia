import { Router } from 'express';
import { Role } from '../../../models/Role.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { requirePermission } from '../../../middleware/admin.js';
import { canGrantPermissions } from '../../../utils/admin-role.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';
import { serializeRole } from '../../../utils/serialize.js';

const router = Router();

async function getParentMap(roles: InstanceType<typeof Role>[]) {
  const parentIds = roles
    .map((r) => r.parent?.toString())
    .filter((id): id is string => Boolean(id));
  const parents = await Role.find({ _id: { $in: parentIds } });
  return new Map(parents.map((p) => [p._id.toString(), p]));
}

router.get('/available-parents', requireAuth, requirePermission('users.view'), async (req, res) => {
  try {
    const excludeId = req.query.exclude as string | undefined;
    const filter: Record<string, unknown> = {};
    if (excludeId) filter._id = { $ne: excludeId };

    const roles = await Role.find(filter).sort({ level: 1, name: 1 });
    const results = roles.map((role) => ({
      id: role._id.toString(),
      _id: role._id.toString(),
      name: role.name,
      level: role.level ?? 0,
      permissions: role.permissions || [],
    }));
    return res.json({ status: true, data: results });
  } catch (error) {
    console.error('available parents error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch parent roles' });
  }
});

router.get('/available-children', requireAuth, requirePermission('users.view'), async (_req, res) => {
  try {
    const roles = await Role.find({ type: { $ne: 'admin' } }).sort({ level: 1, name: 1 });
    const results = roles.map((role) => ({
      id: role._id.toString(),
      _id: role._id.toString(),
      name: role.name,
      level: role.level ?? 0,
    }));
    return res.json({ status: true, data: results });
  } catch (error) {
    console.error('available children error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch child roles' });
  }
});

router.get('/:id', requireAuth, requirePermission('users.view'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ status: false, message: 'Role not found' });
    const parentDoc = role.parent ? await Role.findById(role.parent) : null;
    return res.json({ status: true, data: serializeRole(role, parentDoc) });
  } catch (error) {
    console.error('role details error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch role' });
  }
});

router.get('/', requireAuth, requirePermission('users.view'), async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['name', 'description']);

    const [roles, count] = await Promise.all([
      Role.find(filter).sort({ level: 1, name: 1 }).skip(skip).limit(limit),
      Role.countDocuments(filter),
    ]);

    const parentMap = await getParentMap(roles);
    const results = roles.map((role) =>
      serializeRole(role, role.parent ? parentMap.get(role.parent.toString()) : null)
    );

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('roles list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch roles' });
  }
});

async function rejectAdminType(req: AuthedRequest, type: unknown, res: import('express').Response) {
  if (type !== 'admin') return false;
  const actor = await User.findById(req.userId);
  if (actor?.role?.type === 'admin') return false;
  res.status(403).json({ status: false, message: 'Permission denied' });
  return true;
}

function addedPermissionKeys(next: unknown, current: readonly string[] = []): string[] {
  if (!Array.isArray(next)) return [];
  const held = new Set(current);
  return next.map((key) => String(key)).filter((key) => key && !held.has(key));
}

async function rejectUngrantedPermissions(
  req: AuthedRequest,
  keys: readonly string[],
  res: import('express').Response,
) {
  if (keys.length === 0) return false;
  const actor = await User.findById(req.userId).select('role');
  if (!actor || !canGrantPermissions(actor, keys)) {
    res.status(403).json({ status: false, message: 'Permission denied' });
    return true;
  }
  return false;
}

router.post('/', requireAuth, requirePermission('users.edit'), async (req: AuthedRequest, res) => {
  try {
    const { name, description = '', parent = null, permissions = [], type = 'player' } = req.body;
    if (await rejectAdminType(req, type, res)) return;
    if (await rejectUngrantedPermissions(req, addedPermissionKeys(permissions), res)) return;
    if (!name) {
      return res.status(400).json({ status: false, message: 'Role name is required' });
    }

    let level = 0;
    let parentDoc = null;
    if (parent) {
      parentDoc = await Role.findById(parent);
      if (parentDoc) level = (parentDoc.level ?? 0) + 1;
    }

    const role = await Role.create({
      name,
      description,
      type,
      parent: parent || null,
      permissions,
      level,
    });

    return res.status(201).json({ status: true, data: serializeRole(role, parentDoc) });
  } catch (error) {
    console.error('create role error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create role' });
  }
});

router.put('/:id', requireAuth, requirePermission('users.edit'), async (req: AuthedRequest, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }

    const { name, description, parent, permissions, type } = req.body;
    if (await rejectAdminType(req, type, res)) return;
    if (await rejectUngrantedPermissions(req, addedPermissionKeys(permissions, role.permissions || []), res)) return;
    if (name) role.name = name;
    if (typeof description === 'string') role.description = description;
    if (Array.isArray(permissions)) role.permissions = permissions;
    if (type) role.type = type;

    let parentDoc = null;
    if (parent !== undefined) {
      role.parent = parent || null;
      if (parent) {
        parentDoc = await Role.findById(parent);
        role.level = parentDoc ? (parentDoc.level ?? 0) + 1 : 0;
      } else {
        role.level = 0;
      }
    } else if (role.parent) {
      parentDoc = await Role.findById(role.parent);
    }

    await role.save();
    await User.updateMany(
      { roleRef: role._id },
      {
        $set: {
          'role.type': role.type,
          'role.name': role.name,
          'role.permissions': role.permissions || [],
        },
      },
    );
    return res.json({ status: true, data: serializeRole(role, parentDoc) });
  } catch (error) {
    console.error('update role error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update role' });
  }
});

router.delete('/:id', requireAuth, requirePermission('users.edit'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }
    if (role.type === 'admin') {
      return res.status(403).json({ status: false, message: 'Cannot delete admin role' });
    }
    await role.deleteOne();
    return res.json({ status: true, message: 'Role deleted' });
  } catch (error) {
    console.error('delete role error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete role' });
  }
});

export default router;
