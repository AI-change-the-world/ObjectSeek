import opendal

from common import settings

s3_operator = opendal.Operator(
    "s3",
    endpoint=settings.s3_endpoint_url,
    access_key_id=settings.s3_access_key,
    secret_access_key=settings.s3_secret_key,
    region="us-east-1",
    bucket=settings.s3_bucket_name,
    root="/",
    enable_virtual_host_style="false",
)
