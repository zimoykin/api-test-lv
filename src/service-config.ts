import * as Joi from 'joi';

const schema = {
  MODE: Joi.string().valid('dev', 'prod'),
  PORT: Joi.number().min(3000).max(9000),
  JWT_SECRET: Joi.string().required(),
  DB_CONNECTION: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
};
export const serviceSchema = Joi.object(schema);
export type ConfigVariables = typeof schema;
