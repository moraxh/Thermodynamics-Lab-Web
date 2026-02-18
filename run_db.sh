docker run -d \
  --name thermodynamics_lab_web_db_dev \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=thermodynamics_lab_web_db_dev \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
