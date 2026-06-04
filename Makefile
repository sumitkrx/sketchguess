.PHONY: dev up down logs seed db-push db-migrate build

dev: up
	@printf "Waiting for Postgres and Redis..."
	@until docker compose exec -T postgres pg_isready -U sketchguess -q \
	    && docker compose exec -T redis redis-cli ping > /dev/null 2>&1; \
	do printf "."; sleep 1; done
	@echo " ready"
	npx turbo run dev

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

seed:
	npm run db:seed -w @sketchguess/server

db-push:
	npm run db:push -w @sketchguess/server

db-migrate:
	npm run db:migrate -w @sketchguess/server

build:
	npx turbo run build
