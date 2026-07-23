import { z as zod } from 'zod';

export const PUBG_ID_REGEX = /^[a-zA-Z0-9]+$/;
export const PUBG_ID_MIN_LENGTH = 1;
export const PUBG_ID_MAX_LENGTH = 20;

export const pubgIdZodSchema = zod
    .string()
    .trim()
    .min(PUBG_ID_MIN_LENGTH, { message: 'PUBG ID is required!' })
    .max(PUBG_ID_MAX_LENGTH, {
        message: `PUBG ID must be at most ${PUBG_ID_MAX_LENGTH} characters`,
    })
    .regex(PUBG_ID_REGEX, {
        message: 'PUBG ID must contain only letters and numbers',
    });
