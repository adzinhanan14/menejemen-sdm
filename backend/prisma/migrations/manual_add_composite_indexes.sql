-- Migration: add_composite_indexes
-- Generated manually for production deployment when DB is not available locally.
-- Apply with: npx prisma migrate deploy
-- OR directly: psql $DATABASE_URL -f this_file.sql

-- ── Composite index: attendance_logs (employee_id, date) ────────────────
-- Speeds up check-in lookup ("has this employee checked in today?")
CREATE INDEX CONCURRENTLY IF NOT EXISTS "attendance_logs_employee_id_date_idx"
  ON "attendance_logs" ("employee_id", "date");

-- ── Index: attendance_logs (status) ─────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS "attendance_logs_status_idx"
  ON "attendance_logs" ("status");

-- ── Composite index: leave_applications (employee_id, status) ───────────
-- Speeds up leave quota queries ("how many APPROVED leaves for this employee?")
CREATE INDEX CONCURRENTLY IF NOT EXISTS "leave_applications_employee_id_status_idx"
  ON "leave_applications" ("employee_id", "status");

-- ── Index: leave_applications (leave_type_id) ───────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS "leave_applications_leave_type_id_idx"
  ON "leave_applications" ("leave_type_id");

-- ── Composite index: payroll_details (batch_id, employee_id) ────────────
-- Speeds up batch → employee payroll detail lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payroll_details_batch_id_employee_id_idx"
  ON "payroll_details" ("batch_id", "employee_id");
