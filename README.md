
# ETAP Test Case Assessment

A REST API to mock a basic wallet system

## Tech Stack

**Server:** Node, Nest.js

**Database:** PostgreSQL

**ORM:** Prisma

**Payment Provider:** Paystack
## Documentation

[Documentation](https://documenter.getpostman.com/view/21867518/2s9YXbAkmm)


## Running the app

Clone the project

```bash
git clone https://github.com/mahfuz67/wallet-system-etap-test
```

Copy the content of .env.example file to a new file .env and replace the variables with the appropriate values.

To run locally, You must have progresSQL installed and running on your machine or use the connections string of a hosted progresSQL server.

This webhook url should be added to your paystack account to received a webhook event when a payment is made so the user wallet gets updated.
```bash
baseUrl/v1/transactions/paystack/webhook
```

Install dependencies

```bash
yarn install
```

Start the server locally

```bash
yarn run start:migrate:dev
```

Start server with docker

Replace `localhost` in the `DATABASE_URL` environment variable with the name of the postgres container `postgres` 

```bash
# Run in Dev
docker compose -f docker-compose.dev.yml up --build 

# Run Prod
docker compose -f docker-compose.yml up --build

# Kill dev (Remove volumes)
docker compose -f docker-compose.dev.yml down -v

# Kill prod (Remove volumes)
docker compose -f docker-compose.yml down -v
```

