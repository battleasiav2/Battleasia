Deposit approved / rejected, withdrawal complete / reject, match starting.

Server sends these via sendOpsEmail() in api/src/utils/mail.ts (Aurora HTML wrap).
Triggered from payment-notifications.ts after in-app notify.
SMTP still uses existing AUTH mail transport. Fail-open: in-app notify still lands if mail fails.
