-- Create Database
CREATE DATABASE IF NOT EXISTS mindcare_india;
USE mindcare_india;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    
    -- Accessibility preferences
    preferred_language ENUM('English', 'Hindi', 'Kannada') DEFAULT 'English',
    font_size INT DEFAULT 100,
    color_theme ENUM('Normal', 'HighContrast', 'Dark') DEFAULT 'Normal',
    voice_enabled BOOLEAN DEFAULT FALSE,
    
    -- Location
    state VARCHAR(50),
    district VARCHAR(50),
    pincode VARCHAR(10),
    
    -- Disability status
    disability_status ENUM('None', 'Mobility', 'Visual', 'Hearing', 'Multiple') DEFAULT 'None',
    disability_details TEXT,
    
    -- Account info
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    account_status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    
    INDEX idx_email (email),
    INDEX idx_disability (disability_status)
);

-- 2. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status ENUM('In Progress', 'Completed', 'Abandoned') DEFAULT 'In Progress',
    
    -- ML Prediction
    predicted_status VARCHAR(50),
    prediction_confidence DECIMAL(5,2),
    risk_level ENUM('Low', 'Moderate', 'High', 'Critical'),
    risk_factors JSON,
    recommendations JSON,
    
    -- Intervention
    requires_intervention BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (predicted_status)
);

-- 3. Assessment Responses Table (27 features)
CREATE TABLE IF NOT EXISTS assessment_responses (
    response_id INT PRIMARY KEY AUTO_INCREMENT,
    assessment_id INT NOT NULL,
    
    -- All 27 features
    age INT,
    gender VARCHAR(20),
    education_level VARCHAR(50),
    sleep_hours DECIMAL(3,1),
    sleep_quality DECIMAL(3,1),
    physical_disability VARCHAR(10),
    disability_adjustment INT,
    chronic_illness VARCHAR(10),
    diet_quality VARCHAR(20),
    exercise_freq INT,
    screen_time DECIMAL(3,1),
    substance_use VARCHAR(20),
    stress_level INT,
    anxiety_level INT,
    depression_symptoms INT,
    self_esteem INT,
    coping_skills INT,
    life_satisfaction INT,
    life_purpose INT,
    family_support INT,
    social_isolation INT,
    loneliness_frequency INT,
    relationship_quality INT,
    work_study_pressure VARCHAR(20),
    weekly_work_study_hours INT,
    financial_stress INT,
    access_therapy VARCHAR(10),
    
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE CASCADE,
    INDEX idx_assessment (assessment_id)
);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Super Admin', 'State Admin', 'District Admin') NOT NULL,
    assigned_region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Alerts Table (Crisis Management)
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_id INT,
    alert_type ENUM('Suicide Risk', 'Severe Depression', 'Crisis') NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    alert_message TEXT,
    status ENUM('New', 'Acknowledged', 'Resolved') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE SET NULL,
    INDEX idx_status (status, severity)
);

-- Insert default admin user
-- Password is: admin123 (hashed with bcrypt)
INSERT INTO admin_users (username, email, password_hash, full_name, role, assigned_region)
VALUES (
    'admin',
    'admin@mindcare.in',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'System Administrator',
    'Super Admin',
    'All India'
);

-- Display success message
SELECT 'Database setup completed successfully!' AS Status;
SELECT 'Total tables created: 5' AS Info;
