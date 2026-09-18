-- ============================================
-- CERTIFY DATABASE SCHEMA
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student'
        CHECK (role IN ('admin', 'issuer', 'student')),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,

    certificate_id VARCHAR(100) UNIQUE NOT NULL,

    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,

    course VARCHAR(255) NOT NULL,
    duration VARCHAR(100),

    certificate_type VARCHAR(100) NOT NULL,

    organization VARCHAR(255) NOT NULL,
    issuer VARCHAR(150) NOT NULL,

    issue_date DATE NOT NULL,
    expiry_date DATE,

    description TEXT,
    grade_score VARCHAR(100),
    skills_achievements TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'valid'
        CHECK (status IN ('valid', 'revoked', 'expired', 'invalid')),

    hash VARCHAR(64) NOT NULL,

    qr_code TEXT,
    pdf_path TEXT,

    template VARCHAR(100),

    revoked_reason TEXT,
    revoked_date TIMESTAMP,
    revoked_by INTEGER REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_history (
    id SERIAL PRIMARY KEY,

    certificate_id INTEGER REFERENCES certificates(id)
        ON DELETE CASCADE,

    result VARCHAR(100) NOT NULL,
    status VARCHAR(20),

    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DEFAULT CERTIFICATE TEMPLATES
-- ============================================

INSERT INTO templates (name, description)
VALUES
    ('Academic', 'Professional academic certificate template'),
    ('Corporate', 'Professional corporate certificate template'),
    ('Minimal', 'Clean minimal certificate template'),
    ('Achievement', 'Achievement-focused certificate template')
ON CONFLICT (name) DO NOTHING;


UPDATE users
SET role = 'issuer'
WHERE email = '94pavank@gmail.com';


SELECT email, LENGTH(password) AS password_length
FROM public.users
WHERE email = '94pavank@gmail.com';

SELECT id, name, email, role, status
FROM public.users
ORDER BY id;

UPDATE public.users
SET role = 'issuer'
WHERE email = 'saipawankummari@gmail.com';

SELECT id, name, email, role, status
FROM public.users
ORDER BY id;

SELECT id, name, email, role, status
FROM users
WHERE LOWER(email) = LOWER('kummarianjali1405@gmail.com');

SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'certificates'
ORDER BY ordinal_position;