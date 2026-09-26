import { Module } from '@nestjs/common';

import { GptService } from './Gpt.Service';

@Module({
  providers: [GptService],
  exports: [GptService],
})
export class GptModule {}
