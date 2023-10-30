## Installation

```bash
$ yarn install
```

## Running the app

Copy the .env.example file to .env and fill in the values.

Run prisma migrations

```bash
$ yarn prisma:migrate:dev
```

Run app locally

```bash
# development
$ yarn start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running with docker

```bash
# build docker images and run
$ docker-compose up --build
```

<!-- ## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
``` -->

## License

Nest is [MIT licensed](LICENSE).
