import { Zernio } from '@zernio/node';
import dotenv from 'dotenv';

dotenv.config();

const zernio = new Zernio({
  apiKey: 'sk_a8187f23c9be7fc36d425c3447284dba8470d048ef56f1a7ede0462178c9fc0d',
});

export default zernio;
