const { errorMonitor } = require("nodemailer/lib/xoauth2");
const z = require("zod");

const PlayerSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

const input = {
  name: "Pai",
  age: "21",
  email: "pai@gmail.com",
  role: "admin",
};

// const result = PlayerSchema.safeParse(input);

// if (!result.success) {
//   console.log(result.error.flatten());
// } else {
//   console.log("Valid player data: ", result.data);
// }

try {
  const result = PlayerSchema.parse(input);
  console.log("Valid player data: ", result);
} catch (error) {
  console.log(error.issues);
}
