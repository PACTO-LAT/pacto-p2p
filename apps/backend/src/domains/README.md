# domains/ — bounded contexts

Each subfolder is a business context (DDD bounded context) that groups related
feature-modules and exposes them through a single aggregator module
(`<context>/<context>.module.ts`). `app.module.ts` imports only the aggregator.

Empty in phase 1 (#135). Populated by:
- platform (merchant/user stats + reputation) → phase 2 (#136)
- escrow indexing → phase 4 (#138)
- notifications → phase 5 (#139)

Add a feature: create it under the right context and register it in that
context's aggregator — `app.module.ts` does not change.
