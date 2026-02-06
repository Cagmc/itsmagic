import logging

from sqlalchemy.orm import Session

from models import Client
from schemas import ClientCreateDTO, ClientUpdateDTO

logger = logging.getLogger(__name__)


class ClientService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        logger.info("Fetching all clients")
        return self.db.query(Client).order_by(Client.id).all()

    def get_by_id(self, client_id: int):
        logger.info("Fetching client %s", client_id)
        return self.db.query(Client).filter(Client.id == client_id).first()

    def create(self, dto: ClientCreateDTO):
        logger.info("Creating client %s", dto.name)
        client = Client(name=dto.name, email=dto.email)
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def update(self, client_id: int, dto: ClientUpdateDTO):
        logger.info("Updating client %s", client_id)
        client = self.get_by_id(client_id)
        if client is None:
            return None

        data = dto.model_dump(exclude_unset=True)
        if "name" in data:
            client.name = data["name"]
        if "email" in data:
            client.email = data["email"]

        self.db.commit()
        self.db.refresh(client)
        return client

    def delete(self, client_id: int):
        logger.info("Deleting client %s", client_id)
        client = self.get_by_id(client_id)
        if client is None:
            return False
        self.db.delete(client)
        self.db.commit()
        return True
