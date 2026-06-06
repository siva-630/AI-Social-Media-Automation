import { Zernio } from '@zernio/node';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ZERNIO_API_KEY) {
  throw new Error("ZERNIO_API_KEY environment variable is required");
}

const zernio = new Zernio({
  apiKey: process.env.ZERNIO_API_KEY,
});

export default zernio;
