/**
 * Centralized test configuration.
 * Loads .env from project root so BASE_URL and login credentials are available.
 * Override via .env file or environment variables (e.g. in CI).
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Base URL for the application under test. Defaults to Schatkamer test environment. */
export const BASE_URL =
  process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://schatkamer-tst.beeldengeluid.nl/';
