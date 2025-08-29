
const cloudinary = require("cloudinary").v2;
// CLOUDINARY_CLOUD_NAME=dfholbhu1
// CLOUDINARY_API_KEY=852976124712942
// CLOUDINARY_API_SECRET=LkHSfKaTI5NYLVfQgV65ynnt250
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const extractpublicId = (url) => url.split("/").pop().split(".")[0];


module.exports = {
    cloudinary,
    extractpublicId
}