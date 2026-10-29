import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../lib/decorators/Public.Decorator';
import { DashboardService } from './Dashboard.Service';

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
