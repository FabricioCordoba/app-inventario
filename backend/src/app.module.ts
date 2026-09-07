import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { entities } from './database/entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HierarchiesModule } from './hierarchies/hierarchies.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UnitsModule } from './units/units.module';
import { SectorsModule } from './sectors/sectors.module';
import { MaterialsModule } from './materials/materials.module';
import { UnitMaterialsModule } from './unit-materials/unit-materials.module';
import { UnitMaterialInstancesModule } from './unit-material-instances/unit-material-instances.module';
import { InventoriesModule } from './inventories/inventories.module';
import { InventoryParticipantsModule } from './inventory-participants/inventory-participants.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { InventoryItemInstancesModule } from './inventory-item-instances/inventory-item-instances.module';
import { NoveltiesModule } from './novelties/novelties.module';
import { AuditModule } from './audit/audit.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities,
        synchronize: false,
        timezone: 'Z',
      }),
    }),
    AuthModule,
    UsersModule,
    HierarchiesModule,
    RolesModule,
    PermissionsModule,
    UnitsModule,
    SectorsModule,
    MaterialsModule,
    UnitMaterialsModule,
    UnitMaterialInstancesModule,
    InventoriesModule,
    InventoryParticipantsModule,
    InventoryItemsModule,
    InventoryItemInstancesModule,
    NoveltiesModule,
    AuditModule,
    ReportsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
