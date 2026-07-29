import * as Yup from 'yup';

export const PUBG_ID_REGEX = /^[a-zA-Z0-9]+$/;
export const PUBG_ID_MIN_LENGTH = 1;
export const PUBG_ID_MAX_LENGTH = 20;

export const pubgIdYupSchema = Yup.string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .required('PUBG ID is required!')
    .min(PUBG_ID_MIN_LENGTH, 'PUBG ID is required!')
    .max(PUBG_ID_MAX_LENGTH, `PUBG ID must be at most ${PUBG_ID_MAX_LENGTH} characters`)
    .matches(PUBG_ID_REGEX, 'PUBG ID must contain only letters and numbers');
