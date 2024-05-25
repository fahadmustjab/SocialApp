import Joi, { ObjectSchema } from 'joi';

const addImageSchema: ObjectSchema = Joi.object({
  image: Joi.string().required(),
});


export { addImageSchema };
