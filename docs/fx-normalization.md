# FX normalization for volume metrics

## Canonical currency

All platform volume metrics are normalized to **USD**. Trade rows store the local fiat amount (`fiat_amount`, `fiat_currency`) unchanged; volume KPIs read a persisted USD equivalent.

## FX source

Rates live in the `fx_rates` table:

| Column        | Description                                      |
|---------------|--------------------------------------------------|
| `currency`    | ISO-like fiat code (PK)                          |
| `rate_to_usd` | Multiplier: `fiat_amount * rate_to_usd` → USD   |
| `as_of`       | Timestamp of the rate snapshot                   |
| `updated_at`  | Last row update time                             |

The table is seeded at migration time with approximate rates. Operations updates them on a schedule via SQL `UPDATE`. An external FX provider can replace that update path later without changing read logic.

RLS allows public `SELECT`; writes are service-role only (no insert/update policies for clients).

## As-of semantics

When a trade first reaches `status = 'completed'` and `fiat_amount_usd` is still null, a `BEFORE INSERT OR UPDATE` trigger on `trades`:

1. Looks up `fx_rates` for `NEW.fiat_currency`.
2. If a rate exists, sets `fx_rate_to_usd`, `fx_rate_as_of`, and `fiat_amount_usd = ROUND(fiat_amount * rate_to_usd, 2)`.
3. If no rate exists, leaves the USD columns null (the write is never blocked).

That snapshot is **persisted per trade** and does not change when `fx_rates` is updated later. Backfilled rows used the rates present at migration time.

## Volume metrics affected

| Metric / field              | Source after normalization        |
|-----------------------------|-----------------------------------|
| `users.total_volume`        | Sum of persisted USD per trade    |
| `merchants.volume_traded`   | Same (seller-side recompute)      |
| Reputation volume input     | `summarizeTrades().volume` (USD)  |
| Client `volume_30d` KPI     | Sum of trade USD amounts (30d)    |
| Client volume time series   | Daily USD totals                  |

Count metrics (completed / disputed / cancelled) are unchanged; they still gate on valid local `fiat_amount`.

## Read preference (app layer)

For each completed trade when summing volume:

1. Use `fiat_amount_usd` when it is a finite positive number.
2. Else, if `fiat_currency === 'USD'`, use `fiat_amount`.
3. Else, contribute **0** to volume.

This matches the DB trigger output and keeps mixed-currency totals comparable.

## Idempotency

- **Trigger**: runs only when `NEW.status = 'completed'` and `NEW.fiat_amount_usd IS NULL`.
- **Backfill**: `UPDATE … WHERE fiat_amount_usd IS NULL`.
- **Stats recompute**: reads persisted values only; re-running `StatsService.recomputeForUser` or `recomputeAll` is stable.

## Updating rates

```sql
UPDATE fx_rates
SET
  rate_to_usd = 0.00197,
  as_of = NOW(),
  updated_at = NOW()
WHERE currency = 'CRC';
```

New completed trades pick up the updated rate. Past completed trades keep their stored `fx_rate_to_usd` / `fx_rate_as_of` / `fiat_amount_usd`.
