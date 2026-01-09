-- Content Automation Database Schema
-- SQLite

-- Test results from various sources
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL CHECK (source IN ('adac', 'autobild', 'tyrereviews', 'tcs', 'eu_label')),
    year INTEGER NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('summer', 'winter', 'allseason')),
    tire_slug TEXT NOT NULL,
    tire_name TEXT NOT NULL,
    position INTEGER,
    rating REAL,
    verdict TEXT,
    category_wins TEXT, -- JSON array
    eu_label_grade TEXT,
    source_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(source, year, test_type, tire_slug)
);

-- Assigned badges
CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tire_slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('winner', 'recommended', 'top3', 'best_category', 'eco')),
    source TEXT NOT NULL,
    year INTEGER NOT NULL,
    test_type TEXT NOT NULL,
    label TEXT NOT NULL,
    priority INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tire_slug, type, source, year)
);

-- Generated content
CREATE TABLE IF NOT EXISTS generated_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tire_slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    key_benefits TEXT, -- JSON array
    seo_title TEXT,
    seo_description TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    strapi_id INTEGER
);

-- Scraping log
CREATE TABLE IF NOT EXISTS scrape_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    items_found INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Publishing log
CREATE TABLE IF NOT EXISTS publish_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tire_slug TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'badge_update')),
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    strapi_id INTEGER,
    error_message TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_results_tire ON test_results(tire_slug);
CREATE INDEX IF NOT EXISTS idx_test_results_source_year ON test_results(source, year);
CREATE INDEX IF NOT EXISTS idx_badges_tire ON badges(tire_slug);
CREATE INDEX IF NOT EXISTS idx_badges_expires ON badges(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_tire ON generated_content(tire_slug);
