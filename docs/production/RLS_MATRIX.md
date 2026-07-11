# MATISA MASTER RLS MATRIX

Summary of Row-Level Security policies across Matisa systems:
- All tables enforce strict RLS.
- Owners have read/write/delete permissions on their own content.
- Unauthenticated users have no access to private, draft, cancelled, or invite-only records.
- Blocked users and banned users are excluded at database and Edge Function layers.
