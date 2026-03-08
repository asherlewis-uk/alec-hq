CREATE OR REPLACE FUNCTION increment_failed_attempt(
  p_ip_hash TEXT,
  p_window_minutes INT,
  p_block_minutes INT,
  p_max_attempts INT
) RETURNS TABLE(attempt_count INT, is_blocked BOOLEAN, blocked_until TIMESTAMPTZ) AS $$
  INSERT INTO auth_attempts (ip_hash, attempt_count, window_start, blocked_until, updated_at)
  VALUES (p_ip_hash, 1, now(), NULL, now())
  ON CONFLICT (ip_hash) DO UPDATE SET
    attempt_count = CASE
      WHEN now() - auth_attempts.window_start > (p_window_minutes || ' minutes')::interval THEN 1
      ELSE auth_attempts.attempt_count + 1
    END,
    window_start = CASE
      WHEN now() - auth_attempts.window_start > (p_window_minutes || ' minutes')::interval THEN now()
      ELSE auth_attempts.window_start
    END,
    blocked_until = CASE
      WHEN (CASE
        WHEN now() - auth_attempts.window_start > (p_window_minutes || ' minutes')::interval THEN 1
        ELSE auth_attempts.attempt_count + 1
      END) >= p_max_attempts
      THEN now() + (p_block_minutes || ' minutes')::interval
      ELSE auth_attempts.blocked_until
    END,
    updated_at = now()
  RETURNING auth_attempts.attempt_count,
    (auth_attempts.attempt_count >= p_max_attempts) AS is_blocked,
    auth_attempts.blocked_until;
$$ LANGUAGE sql;
