from celery import Celery

celery_app = Celery(
    "tradescope",
    broker="redis://redis:6379/1",
    backend="redis://redis:6379/2",
)