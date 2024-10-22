# Specify the base image
FROM oven/bun

# Install Google Chrome and ffmpeg
RUN apt-get update && apt-get install -y wget gnupg2 ffmpeg
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update && apt-get install -y google-chrome-stable --no-install-recommends

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lock files to the container
COPY package.json ./

# Install the dependencies
RUN bun install

# Export the path to ffmpeg binary
ENV PATH="/usr/bin/ffmpeg:${PATH}"

# Copy the rest of the application files to the container
COPY . .

# Start the application
CMD ["bun", "start"]
