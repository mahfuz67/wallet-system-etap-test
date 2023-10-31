
FROM node:16-alpine AS production

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN yarn install

# Copy the rest of the app source code
COPY . .

# Build the app
RUN yarn run build


FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy node modules and package files
COPY --from=production /app/node_modules ./node_modules
COPY --from=production /app/package*.json ./
COPY --from=production /app/yarn.lock ./

# Copy the built app and other necessary files
COPY --from=production /app/dist ./dist
COPY --from=production /app/prisma ./prisma
COPY --from=production /app/tsconfig.json ./tsconfig.json

# Expose the port your app will run on
EXPOSE 5500

# Run the app
CMD [ "yarn", "run", "start:migrate:prod"]
