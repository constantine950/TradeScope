.PHONY: up down logs build migrate seed test shell-db shell-backend

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python -m app.db.seed

test:
	docker compose exec backend pytest tests/ -v

shell-db:
	docker compose exec db psql -U tradescope -d tradescope

shell-backend:
	docker compose exec backend bash

reset-db:
	docker compose down -v
	docker compose up -d db redis
	sleep 5
	make migrate
	make seed