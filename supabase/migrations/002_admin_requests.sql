-- Create admin_requests table
CREATE TABLE IF NOT EXISTS admin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requestedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewedBy UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewedAt TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_requests_user_id ON admin_requests(userId);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_requested_at ON admin_requests(requestedAt);

-- Enable RLS
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own admin requests
CREATE POLICY "Users can view own admin requests" ON admin_requests
  FOR SELECT USING (auth.uid() = userId);

-- Users can create their own admin requests
CREATE POLICY "Users can create own admin requests" ON admin_requests
  FOR INSERT WITH CHECK (auth.uid() = userId);

-- Admins can view all admin requests
CREATE POLICY "Admins can view all admin requests" ON admin_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Admins can update admin requests
CREATE POLICY "Admins can update admin requests" ON admin_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_admin_requests_updated_at
  BEFORE UPDATE ON admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_requests_updated_at();








