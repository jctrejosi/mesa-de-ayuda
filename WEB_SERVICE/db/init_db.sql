-- ============================================================
-- DROP AND CREATE DATABASE
-- ============================================================
DROP DATABASE IF EXISTS helpdesk;
CREATE DATABASE helpdesk
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE helpdesk;

-- ============================================================
-- TABLES
-- ============================================================

-- organización
CREATE TABLE company (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    nit VARCHAR(30),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE branch (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    allowed_radius INT DEFAULT 50,
    require_geolocation BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_branch_company (company_id),
    CONSTRAINT fk_branch_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE department (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,

    INDEX idx_department_company (company_id),
    CONSTRAINT fk_department_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `position` (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,

    INDEX idx_position_company (company_id),
    CONSTRAINT fk_position_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- personas
CREATE TABLE person (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_type VARCHAR(10),
    document_number VARCHAR(30) UNIQUE,
    first_name VARCHAR(80) NOT NULL,
    middle_name VARCHAR(80),
    last_name VARCHAR(80) NOT NULL,
    second_last_name VARCHAR(80),
    birth_date DATE,
    gender VARCHAR(20),
    email VARCHAR(150),
    personal_email VARCHAR(150),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(80),
    state VARCHAR(80),
    country VARCHAR(80),
    photo VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE employee (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id BIGINT UNSIGNED NOT NULL,
    employee_code VARCHAR(30) UNIQUE,
    branch_id BIGINT UNSIGNED,
    department_id BIGINT UNSIGNED,
    position_id BIGINT UNSIGNED,
    hire_date DATE,
    termination_date DATE,
    status ENUM('ACTIVE','INACTIVE','VACATION','SUSPENDED') DEFAULT 'ACTIVE',

    INDEX idx_employee_person (person_id),
    INDEX idx_employee_branch (branch_id),
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_position (position_id),

    CONSTRAINT fk_employee_person
        FOREIGN KEY (person_id) REFERENCES person(id),

    CONSTRAINT fk_employee_branch
        FOREIGN KEY (branch_id) REFERENCES branch(id),

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES department(id),

    CONSTRAINT fk_employee_position
        FOREIGN KEY (position_id) REFERENCES `position`(id)
) ENGINE=InnoDB;

-- cuentas
CREATE TABLE account (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','employee') NOT NULL DEFAULT 'employee',
    failed_attempts INT DEFAULT 0,
    locked_until DATETIME,
    last_login DATETIME,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_account_employee (employee_id),
    CONSTRAINT fk_account_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- refresh tokens
CREATE TABLE refresh_token (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_refresh_token_account (account_id),
    INDEX idx_refresh_token_token (token),
    
    CONSTRAINT fk_refresh_token_account
        FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- roles y permisos (opcional)
CREATE TABLE role (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) UNIQUE,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE permission (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) UNIQUE,
    module_name VARCHAR(80),
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE account_role (
    account_id BIGINT UNSIGNED,
    role_id BIGINT UNSIGNED,
    PRIMARY KEY(account_id, role_id),

    CONSTRAINT fk_account_role_account
        FOREIGN KEY(account_id) REFERENCES account(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_account_role_role
        FOREIGN KEY(role_id) REFERENCES role(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE role_permission (
    role_id BIGINT UNSIGNED,
    permission_id BIGINT UNSIGNED,
    PRIMARY KEY(role_id, permission_id),

    CONSTRAINT fk_role_permission_role
        FOREIGN KEY(role_id) REFERENCES role(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY(permission_id) REFERENCES permission(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- asistencia
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    check_type ENUM('ENTRY','EXIT','BREAK_START','BREAK_END') NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    accuracy DOUBLE,
    distance DOUBLE,
    ip VARCHAR(60),
    device VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_att_employee (employee_id),
    INDEX idx_att_branch (branch_id),

    CONSTRAINT fk_att_employee
        FOREIGN KEY(employee_id) REFERENCES employee(id),

    CONSTRAINT fk_att_branch
        FOREIGN KEY(branch_id) REFERENCES branch(id)
) ENGINE=InnoDB;

-- configuración
CREATE TABLE setting (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED NULL,
    setting_key VARCHAR(120) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(30),
    description VARCHAR(255),
    
    UNIQUE KEY uk_setting_company_key (company_id, setting_key),
    INDEX idx_setting_company (company_id),
    
    CONSTRAINT fk_setting_company
        FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- archivos
CREATE TABLE file (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255),
    stored_name VARCHAR(255),
    mime_type VARCHAR(120),
    extension VARCHAR(20),
    size BIGINT,
    checksum VARCHAR(64),
    path VARCHAR(500),
    uploaded_by BIGINT UNSIGNED,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_file_uploaded_by (uploaded_by),

    CONSTRAINT fk_file_account
        FOREIGN KEY(uploaded_by)
        REFERENCES account(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- auditoría
CREATE TABLE audit_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED,
    module_name VARCHAR(100),
    action VARCHAR(100),
    entity_name VARCHAR(100),
    entity_id BIGINT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip VARCHAR(60),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_account (account_id),

    CONSTRAINT fk_audit_account
        FOREIGN KEY(account_id)
        REFERENCES account(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- DATA INSERTION
-- ============================================================

-- 1. company
INSERT INTO company (name, nit, active)
VALUES ('Nexus Technologies S.A.S.', '900.123.456-7', TRUE);
SET @company_id = LAST_INSERT_ID();

-- 2. branch
INSERT INTO branch (
    company_id, name, address, latitude, longitude, allowed_radius,
    require_geolocation, timezone, active
) VALUES (
    @company_id,
    'Sede Principal - Bogotá',
    'Calle 123 # 45-67, Bogotá D.C.',
    4.7110, -74.0721,
    50,
    TRUE,
    'America/Bogota',
    TRUE
);
SET @branch_id = LAST_INSERT_ID();

-- 3. department
INSERT INTO department (company_id, name, description)
VALUES (@company_id, 'Tecnología', 'Departamento de Tecnología y Sistemas');
SET @department_id = LAST_INSERT_ID();

-- 4. position
INSERT INTO `position` (company_id, name, description)
VALUES (@company_id, 'Coordinador de TI', 'Coordinación de infraestructura tecnológica');
SET @position_id = LAST_INSERT_ID();

-- 5. admin user (person + employee + account)
-- Person
INSERT INTO person (
    first_name, last_name, email, document_type, document_number,
    phone, mobile, active
) VALUES (
    'Admin', 'Sistema', 'admin@helpdesk.com',
    'CC', '123456789',
    '555-0001', '555-0001',
    TRUE
);
SET @admin_person_id = LAST_INSERT_ID();

-- Employee
INSERT INTO employee (
    person_id, employee_code, branch_id, department_id, position_id,
    status, hire_date
) VALUES (
    @admin_person_id, 'ADMIN-001', @branch_id, @department_id, @position_id,
    'ACTIVE', CURDATE()
);
SET @admin_employee_id = LAST_INSERT_ID();

-- Account (password: 'Admin123!s')
INSERT INTO account (
    employee_id, username, password_hash, role, active
) VALUES (
    @admin_employee_id,
    'admin',
    '$2b$10$otFSm1LvY.R2GnnjdfApcOLADVmuDcjozCII2cFwPJozbfCsW1uMi',
    'admin',
    TRUE
);

-- 6. employee user (Ana Sofía Ramírez)
-- Person
INSERT INTO person (
    first_name, last_name, email, document_type, document_number,
    phone, mobile, active
) VALUES (
    'Ana Sofía', 'Ramírez', 'ana.ramirez@helpdesk.com',
    'CC', '987654321',
    '555-0002', '555-0002',
    TRUE
);
SET @emp_person_id = LAST_INSERT_ID();

-- Employee
INSERT INTO employee (
    person_id, employee_code, branch_id, department_id, position_id,
    status, hire_date
) VALUES (
    @emp_person_id, 'EMP-001', @branch_id, @department_id, @position_id,
    'ACTIVE', '2024-01-15'
);
SET @emp_employee_id = LAST_INSERT_ID();

-- Account (same password: 'Admin123!s')
INSERT INTO account (
    employee_id, username, password_hash, role, active
) VALUES (
    @emp_employee_id,
    'ana.ramirez',
    '$2b$10$otFSm1LvY.R2GnnjdfApcOLADVmuDcjozCII2cFwPJozbfCsW1uMi',
    'employee',
    TRUE
);

-- 7. attendance records for employee (ana.ramirez)
INSERT INTO attendance (
    employee_id, branch_id, check_type, latitude, longitude,
    accuracy, distance, device, created_at
) VALUES
-- Entrada de hoy (hora actual - 2 horas)
(
    @emp_employee_id, @branch_id, 'ENTRY',
    4.7110, -74.0721,
    15.5, 12.3,
    'Chrome/Windows',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
),
-- Salida de hoy (hora actual - 30 minutos)
(
    @emp_employee_id, @branch_id, 'EXIT',
    4.7110, -74.0721,
    12.8, 8.7,
    'Chrome/Windows',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
),
-- Registro de ayer (entrada)
(
    @emp_employee_id, @branch_id, 'ENTRY',
    4.7110, -74.0721,
    14.2, 10.5,
    'Firefox/Windows',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
-- Registro de ayer (salida)
(
    @emp_employee_id, @branch_id, 'EXIT',
    4.7110, -74.0721,
    11.3, 9.1,
    'Firefox/Windows',
    DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 8 HOUR)
);

-- 8. settings (already present, but we add them again just in case)
INSERT INTO setting (setting_key, setting_value, setting_type, description) VALUES
('attendance', '{"work_start_time": "08:00", "work_end_time": "17:00", "tolerance_minutes": 15, "allow_out_of_hours": false}', 'json', 'Configuración general de asistencia'),
('geolocation', '{"precision_threshold": 50, "max_radius_meters": 500}', 'json', 'Configuración de geolocalización'),
('system', '{"timezone": "America/Bogota", "date_format": "DD/MM/YYYY"}', 'json', 'Configuración del sistema');

-- 9. (Optional) insert some permissions and roles
INSERT INTO role (name, description) VALUES
('admin', 'Administrador del sistema'),
('manager', 'Gerente'),
('employee', 'Empleado');

INSERT INTO permission (code, module_name, description) VALUES
('attendance:view', 'Asistencia', 'Ver registros de asistencia'),
('attendance:create', 'Asistencia', 'Registrar asistencia'),
('attendance:edit', 'Asistencia', 'Editar registros de asistencia'),
('employee:view', 'Empleados', 'Ver empleados'),
('employee:create', 'Empleados', 'Crear empleados');

-- Assign all permissions to admin role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'admin';

-- Assign some permissions to employee role
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'employee'
AND p.code IN ('attendance:view', 'attendance:create');

-- Assign roles to accounts (optional, since we already set role in account table)
INSERT INTO account_role (account_id, role_id)
SELECT a.id, r.id
FROM account a, role r
WHERE a.username = 'admin' AND r.name = 'admin'
UNION
SELECT a.id, r.id
FROM account a, role r
WHERE a.username = 'ana.ramirez' AND r.name = 'employee';

-- ============================================================
-- VERIFICATION QUERIES (optional, not executed)
-- ============================================================
-- SELECT '=== USERS ===' AS '';
-- SELECT a.username, a.role, p.first_name, p.last_name, p.email
-- FROM account a
-- JOIN employee e ON e.id = a.employee_id
-- JOIN person p ON p.id = e.person_id;

-- SELECT '=== ATTENDANCE (last 5) ===' AS '';
-- SELECT e.employee_code, a.check_type, a.created_at
-- FROM attendance a
-- JOIN employee e ON e.id = a.employee_id
-- ORDER BY a.created_at DESC
-- LIMIT 5;