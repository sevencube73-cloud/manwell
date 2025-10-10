# Backend - Cloudinary image upload

This backend supports uploading up to 3 images per product to Cloudinary using `multer` and `multer-storage-cloudinary`.

Required environment variables (.env):

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- MONGO_URI
- PORT (optional)

Install new dependencies and run:

npm install
npm run dev

API:

- POST /api/products (multipart/form-data) fields: name, price, description, category, stock, images (up to 3 files)
- GET /api/products

Notes:

- Files are uploaded directly to Cloudinary and their URLs are saved on the Product document.
- Product schema stores an `images` array with `{ url, public_id }` objects.
