// TODO: expand once the backend Employee model & DTOs are finalized
// (see PRD section 1.4 and backend/src/modules/employee).

export interface Employee {
  id: string;
  nik: string;
  fullName: string;
  email: string;
  departmentId: string | null;
  positionId: string | null;
  employmentStatus: 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'ON_LEAVE';
}
