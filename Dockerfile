# Specify the base image
FROM node:19

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Start the application
CMD ["yarn", "start"]
