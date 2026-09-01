import { env } from 'node:process';

export const PORT = Number(env.PLAYGROUND_E2E_PORT ?? 5179);
export const BASE_URL = `http://127.0.0.1:${ PORT }`;
