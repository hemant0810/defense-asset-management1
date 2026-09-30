# Database Setup - Defense Asset Ops

## Database Engine
- **Supported Databases:** MySQL 8.x, MariaDB 10+, or In-Memory H2
- **Default Database Name:** `asset_management_db`
- **Default Port:** `3306`

## How to Initialize MySQL
1. Connect to MySQL Server:
   ```bash
   mysql -u root -p
   ```
2. Create Database and Tables:
   ```sql
   CREATE DATABASE IF NOT EXISTS asset_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE asset_management_db;
   SOURCE schema.sql;
   ```

## Default Test Users & Passwords (Bcrypt Hashed)
- **ADMIN:** `admin` / `admin123` (Role: ADMIN)
- **BASE COMMANDER:** `commander_alpha` / `commander123` (Role: BASE_COMMANDER, Base: Fort Alpha HQ)
- **LOGISTICS OFFICER:** `logistics_officer` / `logistics123` (Role: LOGISTICS_OFFICER, Base: Fort Alpha HQ)

*Note: The Spring Boot backend automatically seeds all required bases, equipment types, user accounts, and sample transactions on first startup if the database is empty.*
