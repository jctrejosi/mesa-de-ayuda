DROP DATABASE IF EXISTS helpdesk;
CREATE DATABASE helpdesk
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE helpdesk;

-- ===========================
-- organización
-- ===========================

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

-- ===========================
-- personas
-- ===========================

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

-- ===========================
-- cuentas
-- ===========================

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

-- ===========================
-- refresh tokens
-- ===========================

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

-- ===========================
-- roles y permisos (opcional, para futuro)
-- ===========================

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

-- ===========================
-- asistencia
-- ===========================

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

-- ===========================
-- configuración
-- ===========================

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

-- ===========================
-- archivos
-- ===========================

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

-- ===========================
-- auditoría
-- ===========================

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

-- ===========================
-- datos iniciales (admin por defecto)
-- ===========================

-- NOTA: La contraseña es 'Admin123!s' (hash bcrypt)
INSERT INTO person (first_name, last_name, email, active) 
VALUES ('Admin', 'Sistema', 'admin@helpdesk.com', TRUE);

INSERT INTO employee (person_id, employee_code, status) 
VALUES (LAST_INSERT_ID(), 'ADMIN-001', 'ACTIVE');

INSERT INTO account (employee_id, username, password_hash, role, active) 
VALUES (
    LAST_INSERT_ID(), 
    'admin', 
    '$2b$10$otFSm1LvY.R2GnnjdfApcOLADVmuDcjozCII2cFwPJozbfCsW1uMi', 
    'admin', 
    TRUE
);

-- ===========================
-- configuraciones iniciales
-- ===========================

INSERT INTO setting (setting_key, setting_value, setting_type, description) VALUES 
('attendance', '{"work_start_time": "08:00", "work_end_time": "17:00", "tolerance_minutes": 15, "allow_out_of_hours": false}', 'json', 'Configuración general de asistencia'),
('geolocation', '{"precision_threshold": 50, "max_radius_meters": 500}', 'json', 'Configuración de geolocalización'),
('system', '{"timezone": "America/Lima", "date_format": "DD/MM/YYYY"}', 'json', 'Configuración del sistema');