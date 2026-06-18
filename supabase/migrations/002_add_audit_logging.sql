-- Audit logging system
-- Tracks all changes to critical tables

-- Add audit columns to key tables
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Create index on audit log for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
ON audit_log(table_name, record_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by 
ON audit_log(changed_by, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at 
ON audit_log(changed_at DESC);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by,
    changed_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid(),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to key tables
DROP TRIGGER IF EXISTS posts_audit_trigger ON posts;
CREATE TRIGGER posts_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS comments_audit_trigger ON comments;
CREATE TRIGGER comments_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION audit_trigger();
