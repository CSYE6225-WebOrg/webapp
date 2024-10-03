import bcrypt from "bcrypt";

export async function hashPassword(password) {
  const saltValue = await bcrypt.genSalt(11);
  const hashedPassword = await bcrypt.hash(password, saltValue);
  return hashedPassword;
}

export async function comparePasswords(password, hashedPassword) {
  const compare = await bcrypt.compare(password, hashedPassword);
  return compare;
}
