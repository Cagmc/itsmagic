import logging
import os
import urllib.parse

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

Base = declarative_base()

engine = None
SessionLocal = None


def _parse_conn_str(conn_str: str) -> str:
    if conn_str.lower().startswith("postgresql://") or conn_str.lower().startswith("postgres://"):
        return conn_str

    parts = {}
    for chunk in conn_str.split(";"):
        chunk = chunk.strip()
        if not chunk or "=" not in chunk:
            continue
        key, value = chunk.split("=", 1)
        parts[key.strip().lower()] = value.strip()

    host = parts.get("host")
    port = parts.get("port")
    username = parts.get("username") or parts.get("user")
    password = parts.get("password", "")
    database = parts.get("database")

    if not host or not username or not database:
        return conn_str

    pwd = urllib.parse.quote_plus(password)
    port_part = f":{port}" if port else ""
    return f"postgresql+psycopg2://{username}:{pwd}@{host}{port_part}/{database}"


def _create_engine(conn_str: str):
    return create_engine(_parse_conn_str(conn_str), pool_pre_ping=True)


def _create_database(conn_str: str) -> None:
    url = make_url(conn_str)
    if not url.database:
        return

    target_db = url.database
    admin_url = url.set(database="postgres")
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": target_db},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{target_db}"'))
                logger.info("Created database %s", target_db)
    finally:
        admin_engine.dispose()


def ensure_database(conn_str: str) -> None:
    test_engine = None
    try:
        test_engine = _create_engine(conn_str)
        with test_engine.connect():
            return
    except OperationalError as exc:
        if "does not exist" in str(exc).lower():
            _create_database(conn_str)
        else:
            raise
    finally:
        if test_engine is not None:
            test_engine.dispose()


def init_engine():
    global engine, SessionLocal

    conn_str = os.environ.get("DbConn")
    if not conn_str:
        raise RuntimeError("DbConn env var not set")

    ensure_database(conn_str)
    engine = _create_engine(conn_str)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return engine


def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not initialized")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
