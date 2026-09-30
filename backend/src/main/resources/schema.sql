-- ===================================================================
-- Asset Management System - MySQL Relational Schema
-- ===================================================================

CREATE TABLE IF NOT EXISTS bases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    base_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_base FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_type_id BIGINT NOT NULL,
    base_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_assets_base_equipment UNIQUE (base_id, equipment_type_id),
    CONSTRAINT fk_assets_base FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE,
    CONSTRAINT fk_assets_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id) ON DELETE CASCADE,
    CONSTRAINT chk_assets_quantity CHECK (quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL,
    reference_number VARCHAR(80) NOT NULL UNIQUE,
    created_by VARCHAR(80) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_base FOREIGN KEY (base_id) REFERENCES bases(id),
    CONSTRAINT fk_purchases_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    CONSTRAINT chk_purchases_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_base_id BIGINT NOT NULL,
    to_base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL,
    reference_number VARCHAR(80) NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    created_by VARCHAR(80) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transfers_from_base FOREIGN KEY (from_base_id) REFERENCES bases(id),
    CONSTRAINT fk_transfers_to_base FOREIGN KEY (to_base_id) REFERENCES bases(id),
    CONSTRAINT fk_transfers_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    CONSTRAINT chk_transfers_quantity CHECK (quantity > 0),
    CONSTRAINT chk_transfers_distinct_bases CHECK (from_base_id <> to_base_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    personnel_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    assignment_date DATE NOT NULL,
    assigned_by VARCHAR(80) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_base FOREIGN KEY (base_id) REFERENCES bases(id),
    CONSTRAINT fk_assignments_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    CONSTRAINT chk_assignments_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS expenditures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    expenditure_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    recorded_by VARCHAR(80) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenditures_base FOREIGN KEY (base_id) REFERENCES bases(id),
    CONSTRAINT fk_expenditures_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    CONSTRAINT chk_expenditures_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(80),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description TEXT,
    ip_address VARCHAR(50),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_timestamp (timestamp),
    INDEX idx_audit_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
