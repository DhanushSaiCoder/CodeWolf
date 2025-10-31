async function uploadProfilePic(file) {
    // 1️⃣ Get Cloudinary signature + credentials from your backend
    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/sign-upload');
    const data = await res.json();
    
    // 2️⃣ Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', data.apiKey);
    formData.append('timestamp', data.timestamp);
    formData.append('signature', data.signature);
    formData.append('folder', 'profile_pics');
    formData.append('upload_preset', 'codeWolf');


    // 3️⃣ Upload directly to Cloudinary
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    const uploadData = await uploadRes.json();
    return uploadData.secure_url; // ✅ Your Cloudinary-hosted image URL
}

module.exports = uploadProfilePic