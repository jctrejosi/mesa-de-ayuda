-- ============================================================
-- SELECT DATABASE
-- ============================================================
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
DROP DATABASE IF EXISTS helpdesk;
CREATE DATABASE helpdesk

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
-- TABLA: ventas mensuales
-- ============================================================
CREATE TABLE sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    month_year DATE NOT NULL, -- primer día del mes (ej: '2024-01-01')
    month_name VARCHAR(20) NOT NULL, -- 'Enero', 'Febrero', ...
    total DECIMAL(15,2) NOT NULL, -- monto total de ventas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_sales_month_year (month_year)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: inventario de productos
-- ============================================================
CREATE TABLE inventory (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Código interno del producto
    plu VARCHAR(20), -- PLU
    ean VARCHAR(50), -- EAN
    nombre VARCHAR(255) NOT NULL,
    precio_venta DECIMAL(15,2) NOT NULL, -- Precio de venta unitario
    saldo INT NOT NULL DEFAULT 0, -- stock disponible
    imagen VARCHAR(255), -- nombre del archivo de imagen
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_plu (plu),
    INDEX idx_ean (ean)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA OPCIONAL: registros de carga de archivos (auditoría)
-- ============================================================
CREATE TABLE data_upload_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL, -- nombre del archivo cargado
    file_type ENUM('sales','inventory') NOT NULL,
    rows_loaded INT DEFAULT 0,
    uploaded_by BIGINT UNSIGNED, -- referencia a account.id, si se quiere
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB;

