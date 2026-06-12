const z = require("zod");

const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required and must be between 2 and 50 characters")
    .max(50),
  phone: z
    .string()
    .min(
      10,
      "Phone number is required and must be between 10 and 15 characters",
    )
    .max(15),
  address: z
    .string()
    .min(5, "Address is required and must be between 5 and 100 characters")
    .max(100),
});

module.exports = { userSchema };
