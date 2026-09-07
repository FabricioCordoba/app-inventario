import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1757265600000 implements MigrationInterface {
  name = 'InitialSchema1757265600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE jerarquias (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        nivel SMALLINT UNSIGNED NOT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_jerarquias_nombre (nombre),
        UNIQUE KEY UQ_jerarquias_nivel (nivel),
        KEY IDX_jerarquias_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE usuarios (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        jerarquia_id BIGINT UNSIGNED NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        ultimo_acceso DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_usuarios_email (email),
        KEY IDX_usuarios_jerarquia_id (jerarquia_id),
        KEY IDX_usuarios_activo (activo),
        CONSTRAINT FK_usuarios_jerarquia FOREIGN KEY (jerarquia_id) REFERENCES jerarquias (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE roles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        codigo VARCHAR(50) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_roles_codigo (codigo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE permisos (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        codigo VARCHAR(80) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        modulo VARCHAR(50) NOT NULL,
        descripcion VARCHAR(255) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_permisos_codigo (codigo),
        KEY IDX_permisos_modulo (modulo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE rol_permisos (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        rol_id BIGINT UNSIGNED NOT NULL,
        permiso_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_rol_permisos (rol_id, permiso_id),
        KEY IDX_rol_permisos_permiso_id (permiso_id),
        CONSTRAINT FK_rol_permisos_rol FOREIGN KEY (rol_id) REFERENCES roles (id),
        CONSTRAINT FK_rol_permisos_permiso FOREIGN KEY (permiso_id) REFERENCES permisos (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE usuario_roles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id BIGINT UNSIGNED NOT NULL,
        rol_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_usuario_roles (usuario_id, rol_id),
        KEY IDX_usuario_roles_rol_id (rol_id),
        CONSTRAINT FK_usuario_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
        CONSTRAINT FK_usuario_roles_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE unidades (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        numero VARCHAR(20) NOT NULL,
        tipo VARCHAR(80) NOT NULL,
        marca VARCHAR(80) NULL,
        modelo VARCHAR(80) NULL,
        anio SMALLINT UNSIGNED NULL,
        dominio VARCHAR(20) NULL,
        estado ENUM('ACTIVA','FUERA_DE_SERVICIO','MANTENIMIENTO','BAJA') NOT NULL,
        observaciones TEXT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_unidades_numero (numero),
        KEY IDX_unidades_estado (estado),
        KEY IDX_unidades_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE sectores (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        unidad_id BIGINT UNSIGNED NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NULL,
        orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_sectores_unidad_nombre (unidad_id, nombre),
        KEY IDX_sectores_unidad_orden (unidad_id, orden),
        KEY IDX_sectores_activo (activo),
        CONSTRAINT FK_sectores_unidad FOREIGN KEY (unidad_id) REFERENCES unidades (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE materiales (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NULL,
        tipo_control ENUM('CANTIDAD','CAPACIDAD','PRESION') NOT NULL,
        unidad_medida ENUM('UNIDADES','LITROS','PSI') NOT NULL,
        requiere_instancias TINYINT(1) NOT NULL DEFAULT 0,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_materiales_nombre (nombre),
        KEY IDX_materiales_tipo_control (tipo_control),
        KEY IDX_materiales_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE unidad_materiales (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        unidad_id BIGINT UNSIGNED NOT NULL,
        material_id BIGINT UNSIGNED NOT NULL,
        sector_id BIGINT UNSIGNED NOT NULL,
        cantidad_requerida DECIMAL(10,2) NOT NULL DEFAULT 0,
        valor_nominal DECIMAL(12,3) NULL,
        valor_minimo DECIMAL(12,3) NULL,
        observaciones TEXT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_unidad_materiales (unidad_id, material_id, sector_id),
        KEY IDX_unidad_materiales_unidad_id (unidad_id),
        KEY IDX_unidad_materiales_sector_id (sector_id),
        KEY IDX_unidad_materiales_material_id (material_id),
        KEY IDX_unidad_materiales_activo (activo),
        CONSTRAINT FK_unidad_materiales_unidad FOREIGN KEY (unidad_id) REFERENCES unidades (id),
        CONSTRAINT FK_unidad_materiales_material FOREIGN KEY (material_id) REFERENCES materiales (id),
        CONSTRAINT FK_unidad_materiales_sector FOREIGN KEY (sector_id) REFERENCES sectores (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE unidad_material_instancias (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        unidad_material_id BIGINT UNSIGNED NOT NULL,
        identificador VARCHAR(50) NOT NULL,
        numero_serie VARCHAR(100) NULL,
        observaciones TEXT NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_unidad_material_instancias (unidad_material_id, identificador),
        KEY IDX_unidad_material_instancias_um_id (unidad_material_id),
        KEY IDX_unidad_material_instancias_activo (activo),
        CONSTRAINT FK_unidad_material_instancias_um FOREIGN KEY (unidad_material_id) REFERENCES unidad_materiales (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE inventarios (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        unidad_id BIGINT UNSIGNED NOT NULL,
        responsable_id BIGINT UNSIGNED NOT NULL,
        fecha_inicio DATETIME(3) NOT NULL,
        fecha_cierre DATETIME(3) NULL,
        estado ENUM('EN_PROCESO','CERRADO','CANCELADO') NOT NULL,
        observaciones_generales TEXT NULL,
        confirmado_at DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY IDX_inventarios_unidad_fecha (unidad_id, fecha_inicio),
        KEY IDX_inventarios_estado (estado),
        KEY IDX_inventarios_responsable_id (responsable_id),
        KEY IDX_inventarios_fecha_cierre (fecha_cierre),
        CONSTRAINT FK_inventarios_unidad FOREIGN KEY (unidad_id) REFERENCES unidades (id),
        CONSTRAINT FK_inventarios_responsable FOREIGN KEY (responsable_id) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE inventario_participantes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        inventario_id BIGINT UNSIGNED NOT NULL,
        usuario_id BIGINT UNSIGNED NOT NULL,
        es_responsable TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_inventario_participantes (inventario_id, usuario_id),
        KEY IDX_inventario_participantes_usuario_id (usuario_id),
        CONSTRAINT FK_inventario_participantes_inventario FOREIGN KEY (inventario_id) REFERENCES inventarios (id),
        CONSTRAINT FK_inventario_participantes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE inventario_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        inventario_id BIGINT UNSIGNED NOT NULL,
        unidad_material_id BIGINT UNSIGNED NULL,
        material_id BIGINT UNSIGNED NOT NULL,
        sector_id BIGINT UNSIGNED NOT NULL,
        material_nombre VARCHAR(150) NOT NULL,
        sector_nombre VARCHAR(100) NOT NULL,
        tipo_control ENUM('CANTIDAD','CAPACIDAD','PRESION') NOT NULL,
        cantidad_requerida DECIMAL(10,2) NULL,
        cantidad_encontrada DECIMAL(10,2) NULL,
        valor_nominal DECIMAL(12,3) NULL,
        valor_medido DECIMAL(12,3) NULL,
        valor_minimo DECIMAL(12,3) NULL,
        unidad_medida ENUM('UNIDADES','LITROS','PSI') NOT NULL,
        estado ENUM('OK','OBSERVACION','FUERA_DE_SERVICIO','FALTANTE','MANTENIMIENTO') NOT NULL,
        observacion TEXT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY IDX_inventario_items_inventario_id (inventario_id),
        KEY IDX_inventario_items_material_id (material_id),
        KEY IDX_inventario_items_sector_id (sector_id),
        KEY IDX_inventario_items_estado (estado),
        UNIQUE KEY UQ_inventario_items_um (inventario_id, unidad_material_id),
        CONSTRAINT FK_inventario_items_inventario FOREIGN KEY (inventario_id) REFERENCES inventarios (id),
        CONSTRAINT FK_inventario_items_unidad_material FOREIGN KEY (unidad_material_id) REFERENCES unidad_materiales (id),
        CONSTRAINT FK_inventario_items_material FOREIGN KEY (material_id) REFERENCES materiales (id),
        CONSTRAINT FK_inventario_items_sector FOREIGN KEY (sector_id) REFERENCES sectores (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE inventario_item_instancias (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        inventario_item_id BIGINT UNSIGNED NOT NULL,
        unidad_material_instancia_id BIGINT UNSIGNED NULL,
        identificador VARCHAR(50) NOT NULL,
        numero_serie VARCHAR(100) NULL,
        valor_medido DECIMAL(12,3) NULL,
        estado ENUM('OK','OBSERVACION','FUERA_DE_SERVICIO','FALTANTE','MANTENIMIENTO') NOT NULL,
        observacion TEXT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY IDX_inventario_item_instancias_item_id (inventario_item_id),
        UNIQUE KEY UQ_inventario_item_instancias (inventario_item_id, identificador),
        CONSTRAINT FK_inventario_item_instancias_item FOREIGN KEY (inventario_item_id) REFERENCES inventario_items (id),
        CONSTRAINT FK_inventario_item_instancias_umi FOREIGN KEY (unidad_material_instancia_id) REFERENCES unidad_material_instancias (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE novedades (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        inventario_id BIGINT UNSIGNED NULL,
        unidad_id BIGINT UNSIGNED NOT NULL,
        sector_id BIGINT UNSIGNED NULL,
        material_id BIGINT UNSIGNED NULL,
        descripcion TEXT NOT NULL,
        registrado_por_id BIGINT UNSIGNED NOT NULL,
        estado ENUM('PENDIENTE','RESUELTO') NOT NULL,
        fecha_registro DATETIME(3) NOT NULL,
        fecha_resolucion DATETIME(3) NULL,
        resuelto_por_id BIGINT UNSIGNED NULL,
        observacion_resolucion TEXT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY IDX_novedades_unidad_id (unidad_id),
        KEY IDX_novedades_inventario_id (inventario_id),
        KEY IDX_novedades_estado (estado),
        KEY IDX_novedades_fecha_registro (fecha_registro),
        CONSTRAINT FK_novedades_inventario FOREIGN KEY (inventario_id) REFERENCES inventarios (id),
        CONSTRAINT FK_novedades_unidad FOREIGN KEY (unidad_id) REFERENCES unidades (id),
        CONSTRAINT FK_novedades_sector FOREIGN KEY (sector_id) REFERENCES sectores (id),
        CONSTRAINT FK_novedades_material FOREIGN KEY (material_id) REFERENCES materiales (id),
        CONSTRAINT FK_novedades_registrado_por FOREIGN KEY (registrado_por_id) REFERENCES usuarios (id),
        CONSTRAINT FK_novedades_resuelto_por FOREIGN KEY (resuelto_por_id) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE auditoria (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id BIGINT UNSIGNED NULL,
        accion VARCHAR(80) NOT NULL,
        entidad VARCHAR(80) NOT NULL,
        entidad_id BIGINT UNSIGNED NULL,
        descripcion TEXT NULL,
        metadata_json JSON NULL,
        ip VARCHAR(45) NULL,
        user_agent VARCHAR(512) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY IDX_auditoria_usuario_id (usuario_id),
        KEY IDX_auditoria_accion (accion),
        KEY IDX_auditoria_entidad (entidad, entidad_id),
        KEY IDX_auditoria_created_at (created_at),
        CONSTRAINT FK_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS auditoria');
    await queryRunner.query('DROP TABLE IF EXISTS novedades');
    await queryRunner.query('DROP TABLE IF EXISTS inventario_item_instancias');
    await queryRunner.query('DROP TABLE IF EXISTS inventario_items');
    await queryRunner.query('DROP TABLE IF EXISTS inventario_participantes');
    await queryRunner.query('DROP TABLE IF EXISTS inventarios');
    await queryRunner.query('DROP TABLE IF EXISTS unidad_material_instancias');
    await queryRunner.query('DROP TABLE IF EXISTS unidad_materiales');
    await queryRunner.query('DROP TABLE IF EXISTS materiales');
    await queryRunner.query('DROP TABLE IF EXISTS sectores');
    await queryRunner.query('DROP TABLE IF EXISTS unidades');
    await queryRunner.query('DROP TABLE IF EXISTS usuario_roles');
    await queryRunner.query('DROP TABLE IF EXISTS rol_permisos');
    await queryRunner.query('DROP TABLE IF EXISTS permisos');
    await queryRunner.query('DROP TABLE IF EXISTS roles');
    await queryRunner.query('DROP TABLE IF EXISTS usuarios');
    await queryRunner.query('DROP TABLE IF EXISTS jerarquias');
  }
}
