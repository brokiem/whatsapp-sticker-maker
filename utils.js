/**
 * Converts a readable stream to a buffer.
 *
 * @param {ReadableStream} readableStream
 * @returns {Promise<Buffer>}
 */
export function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const reader = readableStream.getReader();
    const chunks = [];

    function read() {
      reader.read().then(({done, value}) => {
        if (done) {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        } else {
          chunks.push(value);
          return read();
        }
      }).catch(error => {
        reject(error);
      });
    }

    read();
  });
}

export function getUptime() {
  let totalSeconds = process.uptime();
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return hours + "h, " + minutes + "m and " + seconds.toFixed(0) + "s";
}
