/**
 * Read-only preflight before relying on one open withdrawal per player.
 *
 * Usage, from the api directory, only when an operator chooses a database:
 *   node scripts/withdrawal-open-duplicates.mjs --uri "mongodb://host/dbname"
 *
 * Prints players who already have more than one withdrawal in pending or processing.
 * Those are the open statuses: funds stay reserved until the request is completed or rejected.
 * The script does not update, delete, or merge withdrawals.
 * If any group is printed, resolve those rows by hand before expecting the unique open-slot index
 * to cover historical data. New submissions still cannot create a second open request.
 *
 * This script does not read api/.env and does not connect unless --uri is provided.
 */
import mongoose from 'mongoose';

const flag = process.argv.indexOf('--uri');
const uri = flag >= 0 ? process.argv[flag + 1] : '';

if (!uri) {
  console.error('Pass --uri. This script does not load .env and does not change data.');
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8_000 });
try {
  const groups = await mongoose.connection.db.collection('withdrawalhistories').aggregate([
    { $match: { status: { $in: ['pending', 'processing'] } } },
    {
      $group: {
        _id: { $toString: '$userId' },
        count: { $sum: 1 },
        ids: { $push: { $toString: '$_id' } },
        statuses: { $push: '$status' },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.log(JSON.stringify({ duplicateGroups: groups.length, groups }, null, 2));
  if (groups.length > 0) process.exitCode = 2;
} finally {
  await mongoose.disconnect();
}
