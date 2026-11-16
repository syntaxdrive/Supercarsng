# Supercars.ng Security Specification

## 1. Data Invariants
1. **Moderation Gate on Listings**: No non-admin user may create or update a `vehicle_listings` document with `listingStatus == 'published'` or `moderationStatus == 'approved'` or `isFeatured == true`. All dealer and private seller submissions enter `pending`.
2. **Verification Integrity**: Only verified administrators may write or modify `verification_records` or change `dealers.verificationStatus`. Dealers and sellers can never self-verify.
3. **PII Isolation**:
   - `profiles` contain user email/phone and are readable/writable strictly by the owning UID or verified administrators.
   - `dealer_documents` contain sensitive registration/ID references and are readable strictly by the owning UID or verified administrators.
   - `enquiries` contain buyer contact details (`buyerName`, `buyerPhone`, `buyerEmail`) and are readable strictly by the target `sellerId`, the `buyerUid` (if signed in), or verified administrators.
4. **Role Escalation Guard**: Users creating their own `/profiles/{userId}` document may only assign `role` in `['customer', 'dealer', 'private_seller']` (never `'admin'`), and may never modify `role` or `status` on update.
5. **Immutable Audit Logs**: `audit_logs` are append-only by verified administrators and can never be updated or deleted.
6. **Temporal Integrity**: All `createdAt`, `updatedAt`, `verifiedAt`, and `publishedAt` fields on writes must equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Self-Published Listing**: Authenticated dealer attempts `create` on `/vehicle_listings/{id}` with `listingStatus: "published"`, `moderationStatus: "approved"`.
2. **Self-Featured Promotion**: Authenticated dealer attempts `update` on own `/vehicle_listings/{id}` setting `isFeatured: true`.
3. **Self-Verification Forgery**: Authenticated dealer attempts `create` on `/verification_records/{id}` claiming `physical_inspection: "verified"`.
4. **Admin Role Escalation on Profile Create**: Authenticated user attempts `create` on `/profiles/{uid}` with `role: "admin"`.
5. **Admin Role Escalation on Profile Update**: Authenticated user attempts `update` on own `/profiles/{uid}` changing `role` from `"customer"` to `"admin"`.
6. **Unverified Admin Email Spoof**: User token has `email: "oyasordaniel@gmail.com"` with `email_verified: false` attempting admin write on `/articles/{id}`.
7. **PII Scraping on Enquiries**: Unauthenticated or unrelated authenticated user attempts `get` or `list` on `/enquiries`.
8. **Private Document Leak**: Unrelated user attempts `get` or `list` on `/dealer_documents`.
9. **Cross-Owner Listing Hijack**: Dealer A attempts `update` on Dealer B's `/vehicle_listings/{id}`.
10. **Shadow Field Injection**: Authenticated user attempts `create` on `/saved_listings/{id}` including an extra ghost field `isPremium: true`.
11. **ID Poisoning / Resource Exhaustion**: User attempts `create` on `/vehicle_listings/{oversizedId}` with a 500-character invalid ID or 100KB title string.
12. **Audit Log Tampering**: Even an admin attempts `delete` or `update` on `/audit_logs/{id}`.
