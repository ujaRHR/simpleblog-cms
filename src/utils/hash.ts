import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!password) {
      reject(new Error("Invalid password "));
      return;
    }
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) {
        reject(new Error("Failed to hashed the password"));
      } else if (!hashed) {
        reject(new Error("Password hashing failed"));
      } else {
        resolve(hashed);
      }
    });
  });
};

export const comparePassword = async (
  password: string,
  hashedpassword: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!password || !hashedpassword) {
      reject(new Error("Invalid hashed password"));
      return;
    }
    bcrypt.compare(password, hashedpassword, (err, result) => {
      if (err) {
        reject(new Error("Failed to compare the password"));
      } else {
        resolve(result as boolean);
      }
    });
  });
};
