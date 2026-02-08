import logging

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy.orm import Session

from db import Base, get_db, init_engine
from schemas import ClientCreateDTO, ClientUpdateDTO, ClientViewModel
from services import ClientService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = init_engine()
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized and tables ensured")
    yield
    logger.info("Shutting down database connection pool")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_client_service(db: Session = Depends(get_db)):
    return ClientService(db)


@app.get("/api/heartbeat")
def heartbeat():
    return Response(status_code=200)


@app.get("/api/hello")
def hello(name: str = Query(...)):
    return f"Hello dear {name}!"


@app.get("/api/clients", response_model=list[ClientViewModel])
def list_clients(service: ClientService = Depends(get_client_service)):
    return service.get_all()


@app.get("/api/clients/{client_id}", response_model=ClientViewModel)
def get_client(client_id: int, service: ClientService = Depends(get_client_service)):
    client = service.get_by_id(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@app.post("/api/clients", response_model=ClientViewModel, status_code=status.HTTP_201_CREATED)
def create_client(
    dto: ClientCreateDTO,
    service: ClientService = Depends(get_client_service),
):
    return service.create(dto)


@app.put("/api/clients/{client_id}", response_model=ClientViewModel)
def update_client(
    client_id: int,
    dto: ClientUpdateDTO,
    service: ClientService = Depends(get_client_service),
):
    client = service.update(client_id, dto)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@app.delete("/api/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, service: ClientService = Depends(get_client_service)):
    deleted = service.delete(client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Client not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        scalar_proxy_url="https://proxy.scalar.com",
    )


if __name__ == "__main__":
    import os
    import uvicorn

    connection_string = os.environ.get("DbConn", "--")
    logger.info("Connecting to database: %s", connection_string)

    port = int(os.environ.get("PORT", "8000"))
    logger.info("Starting server on port: %s", port)

    uvicorn.run(app, host="localhost", port=port)
