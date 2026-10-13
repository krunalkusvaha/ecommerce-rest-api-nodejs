const { executeQuery } = require("./base.repository");

const createSession = async ({
  userId,
  tokenHash,
  deviceName,
  deviceType,
  ipAddress,
  userAgent,
  expiresAt,
}) => {
  const result = await executeQuery(
    `
      INSERT INTO user_sessions
      (
        user_id,
        token_hash,
        device_name,
        device_type,
        ip_address,
        user_agent,
        last_activity_at,
        expires_at,
        is_active,
        created_at,
        updated_at
      )
      VALUES
      (?, ?, ?, ?, ?, ?, NOW(), ?, true, NOW(), NOW())
    `,
    [
      userId,
      tokenHash,
      deviceName || null,
      deviceType || null,
      ipAddress || null,
      userAgent || null,
      expiresAt,
    ]
  );

  return result.insertId;
};

const findActiveSessionByTokenHash =
  async (tokenHash) => {
    const result = await executeQuery(
      `
        SELECT
          id,
          user_id,
          token_hash,
          device_name,
          device_type,
          ip_address,
          user_agent,
          last_activity_at,
          expires_at,
          revoked_at,
          is_active
        FROM user_sessions
        WHERE token_hash = ?
          AND is_active = true
          AND revoked_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
      `,
      [tokenHash]
    );

    return result[0] || null;
  };

const updateLastActivity =
  async (sessionId) => {
    const result = await executeQuery(
      `
        UPDATE user_sessions
        SET
          last_activity_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
          AND is_active = true
          AND revoked_at IS NULL
      `,
      [sessionId]
    );

    return result.affectedRows > 0;
  };

const revokeSession = async (
  sessionId
) => {
  const result = await executeQuery(
    `
      UPDATE user_sessions
      SET
        is_active = false,
        revoked_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `,
    [sessionId]
  );

  return result.affectedRows > 0;
};

module.exports = {
  createSession,
  findActiveSessionByTokenHash,
  updateLastActivity,
  revokeSession,
};