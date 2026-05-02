"""
S3StorageClient
===============
Wraps the boto3 Amazon S3 SDK behind a minimal interface so that the rest of
the application never has to deal with AWS-specific details.

Responsibilities
----------------
- Upload binary media (images, videos) to the configured S3 bucket.
- Return a public HTTPS URL that is then persisted in the database
  (doctor_media_url on exercises, parent_media_url on exercise feedback).
- Delete a previously uploaded file when a record is removed.

Environment variables required
------------------------------
AWS_ACCESS_KEY   — AWS access key ID.
AWS_SECRET_KEY   — AWS secret access key.
S3_BUCKET        — Name of the target S3 bucket.

Supported folders (logical prefixes inside the bucket)
------------------------------------------------------
'exercises'  — Instructional videos/images uploaded by doctors.
'feedback'   — Performance videos/images uploaded by parents.
"""

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
        self._bucket = os.getenv("S3_BUCKET")

    def upload(self, file_obj, folder: str, content_type: str) -> str:
        """Upload a file object to S3 and return its public URL.

        A UUID-based key is generated automatically to avoid name collisions.

        Args:
            file_obj:     File-like object (e.g. from Flask request.files).
            folder:       Logical folder inside the bucket ('exercises' or 'feedback').
            content_type: MIME type of the file — 'image/jpeg' or 'video/mp4'.

        Returns:
            Full public S3 URL of the uploaded file.

        Raises:
            RuntimeError: If the S3 request fails for any reason.
        """
        key = f"{folder}/{uuid.uuid4()}"
        try:
            self._client.upload_fileobj(
                file_obj,
                self._bucket,
                key,
                ExtraArgs={"ContentType": content_type},
            )
        except ClientError as e:
            raise RuntimeError(f"S3 upload failed: {e}") from e
        return f"https://{self._bucket}.s3.amazonaws.com/{key}"

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
