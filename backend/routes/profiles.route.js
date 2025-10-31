import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLAUDINARY_API_CLOUD_NAME,
  api_key: process.env.CLAUDINARY_API_KEY,
  api_secret: process.env.CLAUDINARY_API_SECRET,
});

app.get('/profiles/sign-upload', (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.v2.utils.api_sign_request(
    { timestamp },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({ timestamp, signature, cloudName: process.env.CLOUDINARY_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});
