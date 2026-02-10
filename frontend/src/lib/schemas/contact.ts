import { z } from "zod";

/**
 * Shared Zod schema for contact form validation.
 * Used on both frontend (client-side) and can be reused on backend.
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я повинно містити щонайменше 2 символи")
    .max(100, "Ім'я не може перевищувати 100 символів")
    .trim(),
  phone: z
    .string()
    .min(10, "Введіть коректний номер телефону")
    .max(20, "Номер телефону завеликий")
    .regex(
      /^[+]?[\d\s()-]+$/,
      "Номер телефону може містити тільки цифри, +, пробіли, дужки та дефіси",
    ),
  email: z
    .string()
    .email("Введіть коректну адресу електронної пошти")
    .max(254, "Email не може перевищувати 254 символи"),
  subject: z
    .string()
    .max(200, "Тема не може перевищувати 200 символів")
    .optional()
    .default(""),
  message: z
    .string()
    .min(10, "Повідомлення повинно містити щонайменше 10 символів")
    .max(5000, "Повідомлення не може перевищувати 5000 символів")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Validate contact form data and return structured errors.
 * Returns null if data is valid, or an object with field-level error messages.
 */
export function validateContactForm(
  data: unknown,
): Record<string, string> | null {
  const result = contactFormSchema.safeParse(data);
  if (result.success) return null;

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
