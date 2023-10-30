FROM node:16-alpine AS development

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN yarn run build

FROM node:16-alpine

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/dist ./dist
COPY --from=development /app/prisma ./prisma
COPY --from=development /app/tsconfig.json ./tsconfig.json


EXPOSE 5500
CMD [ "yarn", "run", "start:migrate:prod"]

# # Productions
# FROM node:16 AS production

# # Create app directory
# WORKDIR /app

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install app dependencies
# RUN npm install

# COPY . .

# RUN yarn run build

# FROM node:16

# COPY --from=production /app/node_modules ./node_modules
# COPY --from=production /app/package*.json ./
# COPY --from=production /app/dist ./dist
# COPY --from=production /app/prisma ./prisma

# EXPOSE 5500
# CMD [ "yarn", "run", "start:migrate:prod"]
