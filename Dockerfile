# Specify the base image
FROM oven/bun

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install the dependencies
RUN bun install

# Copy the rest of the application files to the container
COPY . .

# Start the application
CMD ["bun", "run", "index.ts"]
