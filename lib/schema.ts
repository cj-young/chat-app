import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string()
});
export type LoginCredentials = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(4, "Password must be at least 4 characters long"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
export type SignupCredentials = z.infer<typeof signupSchema>;

export const createNameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(25, "Username cannot be more than 25 characters long")
    .regex(
      /^[a-zA-Z0-9_]*$/,
      "Username may only contain letters, numbers, and underscores"
    ),
  displayName: z
    .string()
    .min(1, "Display name must be at least 1 character long")
    .max(40, "Display name cannot be more than 40 characters long")
});

export type CreateNameInfo = z.infer<typeof createNameSchema>;

export const createChannelSchema = z.object({
  channelType: z.enum(["text", "voice"]),
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters long")
    .max(20, "Channel name cannot be more than 20 characters long")
});

export type CreateChannelInfo = z.infer<typeof createChannelSchema>;

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, "Group name must be at least 2 characters long")
    .max(20, "Group name cannot be more than 20 characters long")
});

export type CreateGroupInfo = z.infer<typeof createGroupSchema>;
