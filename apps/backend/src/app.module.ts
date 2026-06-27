import { envValidationSchema } from '@config/env.validation';
import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    CoreModule,
  ],
})
export class AppModule {}
