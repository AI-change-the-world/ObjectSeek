import asyncio

import opendal

s3_operator = opendal.Operator(
    "s3",
    endpoint="http://127.0.0.1:9000",
    access_key_id="FCANIzIkSxHaxXixUj6I",
    secret_access_key="PtpVggqurUK2Ykr49PKhHzMu1EYg9Kt95tSiEZys",
    region="us-east-1",
    bucket="augment",
    root="/",
    enable_virtual_host_style="false",
)


async def main():
    req = await s3_operator.to_async_operator().presign_read(
        "00561f01-6a3b-4761-adea-e86f8335dd3e.png", expire_second=3600
    )
    print(req.method, req.url)


asyncio.run(main())
