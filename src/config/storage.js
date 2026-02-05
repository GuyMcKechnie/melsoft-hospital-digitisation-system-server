const supabase = require('./supabase');

async function uploadFile(bucket, path, fileBuffer, contentType) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, fileBuffer, { contentType, upsert: false });
    if (error) throw error;
    return data;
}

function getPublicUrl(bucket, path) {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

module.exports = { uploadFile, getPublicUrl };
