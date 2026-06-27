import { InternalApiKeyGuard } from '@common/guards/internal-api-key.guard';
import { envValidationSchema } from '@config/env.validation';
import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    CoreModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: InternalApiKeyGuard }],
})
export class AppModule {}
