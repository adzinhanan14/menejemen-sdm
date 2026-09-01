import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Multer configuration for CV upload
const storage = diskStorage({
  destination: './uploads/cvs',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `cv-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('recruitment')
@UseGuards(JwtAuthGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ========== VACANCIES ==========
  @Post('vacancies')
  createVacancy(@Body() data: any) {
    return this.recruitmentService.createVacancy(data);
  }

  @Get('vacancies')
  findAllVacancies(@Query('status') status?: string) {
    return this.recruitmentService.findAllVacancies(status);
  }

  @Get('vacancies/:id')
  findOneVacancy(@Param('id') id: string) {
    return this.recruitmentService.findOneVacancy(id);
  }

  // ========== APPLICANTS ==========
  @Post('applicants')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return callback(new Error('Only PDF and DOC files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async createApplicant(
    @Body() data: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const cvUrl = file ? `/uploads/cvs/${file.filename}` : undefined;
    return this.recruitmentService.createApplicant(data, cvUrl);
  }

  @Get('applicants')
  findAllApplicants(
    @Query('vacancyId') vacancyId?: string,
    @Query('status') status?: string,
  ) {
    return this.recruitmentService.findAllApplicants(vacancyId, status);
  }

  @Get('applicants/:id')
  findOneApplicant(@Param('id') id: string) {
    return this.recruitmentService.findOneApplicant(id);
  }

  @Patch('applicants/:id/status')
  updateApplicantStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.recruitmentService.updateApplicantStatus(id, status);
  }

  // ========== AI SCREENING ==========
  @Post('applicants/:id/ai-screen')
  aiScreenApplicant(@Param('id') id: string) {
    return this.recruitmentService.aiScreenApplicant(id);
  }

  // ========== INTERVIEWS ==========
  @Post('interviews')
  scheduleInterview(@Body() data: any) {
    return this.recruitmentService.scheduleInterview(data);
  }

  @Patch('interviews/:id')
  updateInterview(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateInterview(id, data);
  }
}
