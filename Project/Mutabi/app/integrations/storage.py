import os
import uuid

import boto3
from botocore.exceptions import ClientError


class S3StorageClient:
    """Amazon S3 client for uploading and deleting media files."""

    def __init__(self):
        self._client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
        )
        self._bucket = os.getenv("S3_BUCKET_NAME")

    def upload(self, file_obj, folder: str, content_type: str) -> str:
        ext_map = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/quicktime': 'mov',
            'video/webm': 'webm',
        }
        ext = ext_map.get(content_type, 'bin')
        key = f"{folder}/{uuid.uuid4()}.{ext}"
        try:
            self._client.upload_fileobj(
                file_obj,
                self._bucket,
                key,
                ExtraArgs={"ContentType": content_type},
            )
        except ClientError as e:
            raise RuntimeError(f"S3 upload failed: {e}") from e
        return f"https://{self._bucket}.s3.eu-west-1.amazonaws.com/{key}"

    def delete(self, object_key: str) -> None:
        """Delete a file from S3 using its object key.

        Args:
            object_key: The key (path) of the file inside the bucket,
                        as previously returned by upload().

        Raises:
            RuntimeError: If the S3 request fails for any reason.
        """
        try:
            self._client.delete_object(Bucket=self._bucket, Key=object_key)
        except ClientError as e:
            raise RuntimeError(f"S3 delete failed: {e}") from e
