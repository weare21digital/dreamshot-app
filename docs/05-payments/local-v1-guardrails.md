# Local Payments v1 Guardrails (No Backend Verification)

If you're intentionally starting with local-only payment handling (small app, low fraud concern), use these guardrails so you can migrate to backend verification later without rewriting everything.

## Scope

- StoreKit/Play purchase handled on device
- Entitlements + coins persisted locally
- No server-side receipt verification yet

## Required Guardrails

1. **Idempotency by transaction ID**
   - Never grant coins twice for the same transaction.
   - Keep a local `processedTransactions` set.

2. **Ledger entries for every grant**
   - Append-only local ledger entry:
   - `transactionId`, `productId`, `coins`, `source(purchase|restore)`, `createdAt`
   - Keep this for debugging and future migration.

3. **Finish transaction after local commit path is safe**
   - In local mode, transaction completion and local grant path must be deterministic.
   - If app restarts, idempotency still prevents duplicate grants.

4. **Restore must be idempotent**
   - Restore flow should re-check all purchases, but only apply coins for unseen transactions.

5. **Strict product mapping**
   - Only known SKUs can grant coins/entitlements.
   - Unknown SKU => no grant.

6. **User-visible outcomes**
   - Show clear states: success / already applied / failed / cancelled.

## Recommended Local Storage Keys

- `@coins/balance`
- `@coins/processed-transactions`
- `@coins/ledger`

## Migration-Friendly Design

Build around a single function boundary:

- `grantCoinsOnce({ transactionId, productId, coins, source })`

When you add backend verification later, keep this contract and move idempotency/ledger server-side.

## Current Skeleton Status

Implemented in skeleton:

- local idempotency helper (`grantCoinsOnce`)
- local coin ledger entries
- purchase and restore flows use idempotent grant path
