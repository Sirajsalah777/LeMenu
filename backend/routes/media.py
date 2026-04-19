from fastapi import APIRouter, UploadFile, File
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

router = APIRouter(prefix="/media", tags=["media"])

@router.post("/upload/photo")
async def upload_photo(file: UploadFile = File(...)):
    # Cloudinary upload natively supports FastAPI file-like objects
    result = cloudinary.uploader.upload(
        file.file, 
        resource_type="image", 
        folder="menu3d/photos"
    )
    return {"url": result.get("secure_url")}

@router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(
        file.file, 
        resource_type="video", 
        folder="menu3d/videos"
    )
    return {"url": result.get("secure_url")}

@router.post("/upload/model")
async def upload_model(file: UploadFile = File(...)):
    # Raw resource type is mandatory for GLB/GLTF models
    result = cloudinary.uploader.upload(
        file.file, 
        resource_type="raw", 
        folder="menu3d/models",
        public_id=file.filename
    )
    return {"url": result.get("secure_url")}
