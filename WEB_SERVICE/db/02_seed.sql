-- ============================================================
-- DATA INSERTION - SOLO USUARIO ADMIN
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

-- 6. settings
INSERT INTO setting (setting_key, setting_value, setting_type, description) VALUES
('attendance', '{"work_start_time": "08:00", "work_end_time": "17:00", "tolerance_minutes": 15, "allow_out_of_hours": false}', 'json', 'Configuración general de asistencia'),
('geolocation', '{"precision_threshold": 50, "max_radius_meters": 500}', 'json', 'Configuración de geolocalización'),
('system', '{"timezone": "America/Bogota", "date_format": "DD/MM/YYYY"}', 'json', 'Configuración del sistema');

-- 7. roles y permisos (opcional, solo si necesitas la estructura)
INSERT IGNORE INTO role (name, description) VALUES
('admin', 'Administrador del sistema'),
('manager', 'Gerente'),
('employee', 'Empleado');

INSERT IGNORE INTO permission (code, module_name, description) VALUES
('attendance:view', 'Asistencia', 'Ver registros de asistencia'),
('attendance:create', 'Asistencia', 'Registrar asistencia'),
('attendance:edit', 'Asistencia', 'Editar registros de asistencia'),
('employee:view', 'Empleados', 'Ver empleados'),
('employee:create', 'Empleados', 'Crear empleados');

-- Asignar permisos al admin
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r, permission p
WHERE r.name = 'admin';

-- Asignar rol admin a la cuenta admin
INSERT IGNORE INTO account_role (account_id, role_id)
SELECT a.id, r.id
FROM account a, role r
WHERE a.username = 'admin' AND r.name = 'admin';

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- SELECT '=== USUARIO ADMIN CREADO ===' AS '';
-- SELECT a.username, a.role, p.first_name, p.last_name, p.email
-- FROM account a
-- JOIN employee e ON e.id = a.employee_id
-- JOIN person p ON p.id = e.person_id
-- WHERE a.username = 'admin';