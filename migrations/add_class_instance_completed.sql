-- Migration: Add completed field to class_instances for attendance tracking
ALTER TABLE class_instances ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
