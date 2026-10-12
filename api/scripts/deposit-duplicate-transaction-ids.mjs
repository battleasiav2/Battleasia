/**
 * Read-only preflight for the unique DepositHistory.transaction_id index.
 *
 * Usage, from the api directory, only when an operator chooses a database:
 *   node scripts/deposit-duplicate-transaction-ids.mjs --uri "mongodb://host/dbname"
 *
 * Prints transaction_id values stored on more than one deposit, with ids and statuses.
 * It does not update, delete, or merge deposits.
 * If any group is printed, do not deploy the unique index until those rows are resolved by hand.
 *
 * This script does not read api/.env and does not connect unless --uri is provided.
 *
 * Older APK builds that omit shop_item_id or Idempotency-Key cannot submit deposits.
 * They receive HTTP 400. The client update is an app build that sends the catalog pack id
 * as shop_item_id and an Idempotency-Key header. The server requirement stays in place.
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
  const groups = await mongoose.connection.db.collection('deposithistories').aggregate([
    {
      $group: {
        _id: '$transaction_id',
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
