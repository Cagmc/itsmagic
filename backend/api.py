from fastapi import FastAPI, Query
from fastapi.responses import Response
from scalar_fastapi import get_scalar_api_reference

app = FastAPI()

@app.get("/api/heartbeat")
def heartbeat():
    return Response(status_code=200)


@app.get("/api/hello")
def hello(name: str = Query(...)):
    return f"Hello dear {name}!"


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        # Your OpenAPI document
        openapi_url=app.openapi_url,
        # Avoid CORS issues (optional)
        scalar_proxy_url="https://proxy.scalar.com",
    )


if __name__ == "__main__":
    import uvicorn
    import os

    connectionString = os.environ.get("DbConn", "--")
    print(f">>> Connecting to database: {connectionString}")

    port = int(os.environ.get("PORT", "8000"))
    print(f">>> Starting server on port: {port}")

    uvicorn.run(app, host="localhost", port=port)
