# Fix stale role after account role switch

## Implementation
- Add a server-backed role refresh action to the shared role context.
- After a confirmed onboarding role switch, await that refresh before navigating to the new dashboard.
- Keep the existing dashboard authorization gate and invitation-only Who's Who behavior unchanged.

## Verification
- Run the focused typecheck and relevant tests/build diagnostics.
- Confirm a role switch resolves to the Service Provider dashboard without the wrong-account gate.
