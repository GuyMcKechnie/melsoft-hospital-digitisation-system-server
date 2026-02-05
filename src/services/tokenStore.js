const crypto = require('crypto');
const supabase = require('../config/supabase');

// Persistent token store backed by Supabase 'tokens' table.
// Table schema:
// CREATE TABLE tokens (
//   token text PRIMARY KEY,
//   user_id uuid REFERENCES users(id) ON DELETE CASCADE,
//   type text,
//   expires_at timestamptz,
//   created_at timestamptz DEFAULT now()
// );

class TokenStore {
    generateToken() {
        return crypto.randomBytes(48).toString('hex');
    }

    async save(token, payload) {
        // payload: { userId, type, expiresAt }
        const row = {
            token,
            user_id: payload.userId,
            type: payload.type,
            expires_at: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
        };
        const { error } = await supabase.from('tokens').insert([row]);
        if (error) {
            // fallback: try upsert (in case of race)
            await supabase.from('tokens').upsert(row);
        }
    }

    async get(token) {
        const { data, error } = await supabase.from('tokens').select('*').eq('token', token).limit(1).single();
        if (error || !data) return null;
        if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
            await this.revoke(token);
            return null;
        }
        return { userId: data.user_id, type: data.type, expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : null };
    }

    async revoke(token) {
        await supabase.from('tokens').delete().eq('token', token);
    }

    async revokeByUserId(userId) {
        await supabase.from('tokens').delete().eq('user_id', userId);
    }
}

module.exports = new TokenStore();
