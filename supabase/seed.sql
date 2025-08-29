-- Seed data for football tournament

-- Insert admin profile
INSERT INTO profiles (id, username, fullName, university, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Tournament Admin', 'University of Technology', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Insert teams
INSERT INTO teams (id, name, university, group_label) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Tech Titans', 'University of Technology', 'A'),
('550e8400-e29b-41d4-a716-446655440003', 'Digital Dragons', 'Digital University', 'A'),
('550e8400-e29b-41d4-a716-446655440004', 'Code Crushers', 'Coding Institute', 'B'),
('550e8400-e29b-41d4-a716-446655440005', 'Byte Busters', 'Byte University', 'B')
ON CONFLICT (name) DO NOTHING;

-- Insert player profiles
INSERT INTO profiles (id, username, fullName, university, role) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'john_doe', 'John Doe', 'University of Technology', 'PLAYER'),
('550e8400-e29b-41d4-a716-446655440007', 'jane_smith', 'Jane Smith', 'Digital University', 'PLAYER'),
('550e8400-e29b-41d4-a716-446655440008', 'bob_wilson', 'Bob Wilson', 'Coding Institute', 'PLAYER'),
('550e8400-e29b-41d4-a716-446655440009', 'alice_brown', 'Alice Brown', 'Byte University', 'PLAYER')
ON CONFLICT (username) DO NOTHING;

-- Insert players
INSERT INTO players (id, profile_id, team_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (profile_id) DO NOTHING;

-- Insert matches
INSERT INTO matches (id, home_team_id, away_team_id, starts_at, venue, status, home_score, away_score, group_label) VALUES
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', NOW() + INTERVAL '1 day', 'Main Stadium', 'UPCOMING', 0, 0, 'A'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', NOW() + INTERVAL '2 days', 'Training Ground', 'UPCOMING', 0, 0, 'B'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 hours', 'Main Stadium', 'DONE', 2, 1, 'A')
ON CONFLICT DO NOTHING;

-- Insert goals for the completed match
INSERT INTO goals (id, match_id, player_id, minute, own_goal) VALUES
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440010', 15, false),
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440010', 67, false),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', 89, false)
ON CONFLICT DO NOTHING;

