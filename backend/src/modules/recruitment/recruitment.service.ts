import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== VACANCIES ==========
  async createVacancy(data: any) {
    return this.prisma.recruitVacancy.create({
      data: {
        title: data.title,
        departmentId: data.departmentId,
        positionId: data.positionId,
        description: data.description,
        requirements: data.requirements || null,
        status: data.status || 'OPEN',
        openDate: data.openDate ? new Date(data.openDate) : new Date(),
        closeDate: data.closeDate ? new Date(data.closeDate) : null,
      },
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      },
    });
  }

  async findAllVacancies(status?: string) {
    return this.prisma.recruitVacancy.findMany({
      where: status ? { status: status as any } : {},
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        _count: { select: { applicants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneVacancy(id: string) {
    const vacancy = await this.prisma.recruitVacancy.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        applicants: {
          orderBy: { appliedAt: 'desc' },
        },
      },
    });
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} not found`);
    }
    return vacancy;
  }

  // ========== APPLICANTS ==========
  async createApplicant(data: any, cvUrl?: string) {
    return this.prisma.recruitApplicant.create({
      data: {
        vacancyId: data.vacancyId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        cvUrl: cvUrl || data.cvUrl,
        status: 'NEW',
      },
      include: {
        vacancy: { select: { id: true, title: true } },
      },
    });
  }

  async findAllApplicants(vacancyId?: string, status?: string) {
    const where: any = {};
    if (vacancyId) where.vacancyId = vacancyId;
    if (status) where.status = status;

    return this.prisma.recruitApplicant.findMany({
      where,
      include: {
        vacancy: { select: { id: true, title: true } },
        interviews: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOneApplicant(id: string) {
    const applicant = await this.prisma.recruitApplicant.findUnique({
      where: { id },
      include: {
        vacancy: true,
        interviews: true,
      },
    });
    if (!applicant) {
      throw new NotFoundException(`Applicant ${id} not found`);
    }
    return applicant;
  }

  async updateApplicantStatus(id: string, status: string) {
    await this.findOneApplicant(id);
    return this.prisma.recruitApplicant.update({
      where: { id },
      data: { status: status as any },
    });
  }

  // ========== AI SCREENING (Mock) ==========
  async aiScreenApplicant(id: string) {
    const applicant = await this.findOneApplicant(id);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI screening result
    const mockResult = {
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
      extractedSkills: [
        'Vue.js',
        'NestJS',
        'PostgreSQL',
        'TypeScript',
        'Docker',
        'Git',
      ].slice(0, Math.floor(Math.random() * 4) + 3),
      summary: `Kandidat dengan pengalaman ${Math.floor(Math.random() * 5) + 2} tahun di bidang software development. Memiliki kemampuan teknis yang baik dan komunikasi efektif.`,
      recommendation: Math.random() > 0.3 ? 'INTERVIEW' : 'REVIEW',
      processedAt: new Date().toISOString(),
    };

    // Update applicant with parsed CV data
    await this.prisma.recruitApplicant.update({
      where: { id },
      data: {
        parsedCvData: mockResult as any,
        status: 'SCREENING',
      },
    });

    return {
      success: true,
      applicantId: id,
      result: mockResult,
    };
  }

  // ========== INTERVIEWS ==========
  async scheduleInterview(data: any) {
    return this.prisma.recruitInterview.create({
      data: {
        applicantId: data.applicantId,
        interviewerId: data.interviewerId,
        scheduledAt: new Date(data.scheduledAt),
        feedback: data.feedback,
      },
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            vacancy: { select: { title: true } },
          },
        },
      },
    });
  }

  async updateInterview(id: string, data: any) {
    const interview = await this.prisma.recruitInterview.findUnique({
      where: { id },
    });
    if (!interview) {
      throw new NotFoundException(`Interview ${id} not found`);
    }

    return this.prisma.recruitInterview.update({
      where: { id },
      data: {
        score: data.score,
        feedback: data.feedback,
        result: data.result,
      },
    });
  }
}
