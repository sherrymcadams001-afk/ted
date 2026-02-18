-- Migration: Update admin seed password hash from bcrypt to PBKDF2 (edge-compatible)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE users
SET password = '$pbkdf2$100000$80Cbqa91T/iKrnBQqvo2kw==$8zCIYYcpJOF9D/GC1+wqHyvWWN3N4fMfointdBkPGlg='
WHERE id = 'admin-seed-001';
