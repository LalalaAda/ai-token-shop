-- Seed admin data
-- Run: psql -U postgres -d ai_token_shop -f seed-admin.sql

-- Create admin role
INSERT INTO admin_roles (id, name, description, permissions, created_at, updated_at)
VALUES ('default-admin-role', '超级管理员', '拥有所有权限', '{"dashboard":["read"],"products":["create","read","update","delete"]}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO admin_users (id, username, password_hash, nickname, email, role_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'admin', '$2b$10$dmM4tC3YJ5.LEj5VSD.J0OO7BURlzfETtd17rZjaRqYZpTuRm.Qp2', '管理员', 'admin@example.com', 'default-admin-role', 'ACTIVE', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create category
INSERT INTO product_categories (id, name, icon, sort_order, is_visible, created_at, updated_at)
VALUES ('default-category', 'AI账号', 'bot', 0, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample products
INSERT INTO products (id, name, slug, description, category_id, original_price, selling_price, cost_price, stock, available_stock, status, token_type, token_amount, validity_days, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'ChatGPT Plus 账号', 'chatgpt-plus', 'ChatGPT Plus 高品质账号', 'default-category', 99, 99, 50, 100, 100, 'ONLINE', 'ACCOUNT', 1, 30, NOW(), NOW()),
(gen_random_uuid(), 'Claude Pro 会员', 'claude-pro', 'Claude Pro 会员', 'default-category', 128, 128, 70, 50, 50, 'ONLINE', 'ACCOUNT', 1, 30, NOW(), NOW()),
(gen_random_uuid(), 'Midjourney 订阅', 'midjourney', 'Midjourney 订阅', 'default-category', 78, 78, 40, 200, 200, 'ONLINE', 'ACCOUNT', 1, 30, NOW(), NOW()),
(gen_random_uuid(), 'Gemini Advanced', 'gemini-advanced', 'Gemini Advanced', 'default-category', 88, 88, 45, 150, 150, 'ONLINE', 'ACCOUNT', 1, 30, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;