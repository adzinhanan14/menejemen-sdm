/**
 * Shared utilities used across multiple service modules.
 *
 * Centralising these here eliminates the duplicate `PaginatedResult`
 * interface that existed in employee.service.ts, and the repeated
 * NotFoundException-throwing pattern scattered across payroll, leave, and
 * recruitment services.
 */
import { NotFoundException } from '@nestjs/common';

// ------------------------------------------------------------------
// Pagination
// ------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ------------------------------------------------------------------
// Guard helpers
// ------------------------------------------------------------------

/**
 * Throws a standardised `NotFoundException` when `entity` is null/undefined.
 *
 * Usage:
 *   const employee = await prisma.employee.findUnique({ where: { id } });
 *   assertFound(employee, `Employee ${id}`);
 */
export function assertFound<T>(
  entity: T | null | undefined,
  label: string,
): asserts entity is T {
  if (entity == null) {
    throw new NotFoundException(`${label} not found`);
  }
}

// ------------------------------------------------------------------
// Date helpers (shared between attendance, payroll)
// ------------------------------------------------------------------

/** Returns midnight UTC for today (used for attendance date comparisons). */
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Count Mon–Fri working days in a date range (inclusive). */
export function countWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
