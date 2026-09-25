import bcrypt from "bcrypt";

export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(plain, salt);
  return { salt, password };
};
