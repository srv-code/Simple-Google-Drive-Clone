const types = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
  FULL_NAME: /^[a-zA-Z ]+$/,
  USERNAME: /^[a-zA-Z0-9.\-_@$]{5,18}$/,

  /* From 4-16 characters,
    with at least a symbol,
    upper and lower case letters
    and a number */
  PASSWORD: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{4,16}$/,
};

const validate = (
  type: 'FULL_NAME' | 'USERNAME' | 'EMAIL' | 'PASSWORD',
  value: string
) => {
  if (!(type in types)) throw new Error(`Invalid type: ${type}`);
  return types[type].test(value);
};

export default validate;
