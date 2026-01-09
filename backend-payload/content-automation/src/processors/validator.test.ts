/**
 * Unit Tests for Content Validator
 */
import { describe, it, expect } from "vitest";
import {
  validateTireContent,
  validateArticleContent,
  validateFAQ,
  validateFAQs,
  generateContentHash,
  TireContentForValidation,
  ArticleContentForValidation,
  FAQForValidation,
} from "./validator.js";

describe("validateTireContent", () => {
  it("should pass valid content", () => {
    const validContent: TireContentForValidation = {
      shortDescription:
        "Bridgestone Turanza 6 - преміальна літня шина для легкових автомобілів та SUV. Забезпечує відмінне зчеплення на мокрій дорозі та низький рівень шуму завдяки технології B-Silent.",
      fullDescription:
        "Bridgestone Turanza 6 представляє нове покоління преміальних літніх шин. Розроблена з використанням інноваційної технології ENLITEN, ця шина забезпечує оптимальний баланс між продуктивністю та екологічністю. Технологія B-Silent значно знижує рівень шуму в салоні, створюючи комфортну атмосферу для водія та пасажирів. Унікальний малюнок протектора забезпечує ефективне відведення води та чудове зчеплення на мокрій дорозі.",
      keyBenefits: [
        "Відмінне зчеплення на мокрій дорозі (EU Label: A)",
        "Низький рівень шуму завдяки B-Silent",
        "Технологія ENLITEN для паливної ефективності",
      ],
      seoTitle: "Bridgestone Turanza 6 - Преміальні літні шини | Україна",
      seoDescription:
        "Bridgestone Turanza 6 - літні шини преміум-класу з відмінним зчепленням на мокрій дорозі та низьким рівнем шуму. Купити з доставкою.",
    };

    const result = validateTireContent(validContent);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.contentHash).toBeDefined();
    expect(result.contentHash).toHaveLength(16);
  });

  it("should fail on missing required fields", () => {
    const invalidContent: TireContentForValidation = {
      shortDescription: "",
      fullDescription: "",
      keyBenefits: [],
    };

    const result = validateTireContent(invalidContent);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("shortDescription"))).toBe(true);
    expect(result.errors.some((e) => e.includes("fullDescription"))).toBe(true);
    expect(result.errors.some((e) => e.includes("keyBenefits"))).toBe(true);
  });

  it("should fail on too short content", () => {
    const shortContent: TireContentForValidation = {
      shortDescription: "Короткий опис",
      fullDescription: "Короткий текст",
      keyBenefits: ["Один"],
      seoTitle: "Заголовок",
      seoDescription: "Опис",
    };

    const result = validateTireContent(shortContent);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("занадто короткий"))).toBe(true);
  });

  it("should warn on too long SEO title", () => {
    const content: TireContentForValidation = {
      shortDescription:
        "Bridgestone Turanza 6 - преміальна літня шина для легкових автомобілів та SUV. Забезпечує відмінне зчеплення на мокрій дорозі.",
      fullDescription:
        "Bridgestone Turanza 6 представляє нове покоління преміальних літніх шин. Розроблена з використанням інноваційної технології ENLITEN, ця шина забезпечує оптимальний баланс між продуктивністю та екологічністю. Технологія B-Silent значно знижує рівень шуму в салоні, створюючи комфортну атмосферу для водія та пасажирів.",
      keyBenefits: [
        "Відмінне зчеплення на мокрій дорозі",
        "Низький рівень шуму",
      ],
      seoTitle:
        "Це дуже довгий SEO заголовок який перевищує максимальну довжину в 70 символів і має викликати попередження у валідаторі",
      seoDescription:
        "Bridgestone Turanza 6 - літні шини преміум-класу з відмінним зчепленням на мокрій дорозі та низьким рівнем шуму. Купити.",
    };

    const result = validateTireContent(content);

    expect(result.warnings.some((w) => w.includes("seoTitle") && w.includes("занадто довгий"))).toBe(
      true
    );
  });

  it("should warn on non-Ukrainian content", () => {
    const englishContent: TireContentForValidation = {
      shortDescription:
        "Bridgestone Turanza 6 is a premium summer tire for passenger cars and SUVs. Provides excellent wet grip and low noise levels thanks to B-Silent technology.",
      fullDescription:
        "Bridgestone Turanza 6 represents a new generation of premium summer tires. Developed using innovative ENLITEN technology, this tire provides optimal balance between performance and environmental friendliness. B-Silent technology significantly reduces cabin noise, creating a comfortable atmosphere for driver and passengers. The unique tread pattern ensures effective water evacuation and excellent wet grip.",
      keyBenefits: [
        "Excellent wet grip (EU Label: A)",
        "Low noise thanks to B-Silent",
        "ENLITEN technology for fuel efficiency",
      ],
      seoTitle: "Bridgestone Turanza 6 - Premium Summer Tyres",
      seoDescription:
        "Bridgestone Turanza 6 - premium summer tyres with excellent wet grip and low noise. Buy with delivery.",
    };

    const result = validateTireContent(englishContent);

    expect(result.warnings.some((w) => w.includes("не українською"))).toBe(true);
  });
});

describe("validateArticleContent", () => {
  it("should pass valid article content", () => {
    const validArticle: ArticleContentForValidation = {
      title: "Як обрати літні шини для свого автомобіля",
      body: "Вибір літніх шин - важливе рішення для кожного автовласника. Правильно підібрані шини забезпечують безпеку та комфорт під час їзди. У цій статті ми розглянемо основні критерії вибору літніх шин. Перш за все, зверніть увагу на розмір шин, який рекомендований виробником вашого автомобіля. Далі важливо врахувати умови експлуатації: міські дороги чи автобани, сухий клімат чи часті дощі. Якість шин визначається їх зчепленням з дорогою, гальмівними характеристиками та рівнем шуму. Також слід звернути увагу на індекси швидкості та навантаження. Рекомендуємо обирати шини від перевірених виробників, таких як Bridgestone, які забезпечують високу якість та безпеку.",
      previewText:
        "Детальний гід з вибору літніх шин: на що звернути увагу, які бренди обрати та як заощадити без втрати якості.",
    };

    const result = validateArticleContent(validArticle);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail on empty article body", () => {
    const invalidArticle: ArticleContentForValidation = {
      title: "Тестова стаття для перевірки валідації",
      body: "",
      previewText: "Короткий опис статті для перегляду та попереднього ознайомлення",
    };

    const result = validateArticleContent(invalidArticle);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("body"))).toBe(true);
  });
});

describe("validateFAQ", () => {
  it("should pass valid FAQ", () => {
    const validFaq: FAQForValidation = {
      question: "Для яких автомобілів підходить Bridgestone Turanza 6?",
      answer:
        "Bridgestone Turanza 6 підходить для широкого спектру легкових автомобілів та SUV. Вона особливо рекомендована для автомобілів преміум-класу.",
    };

    const result = validateFAQ(validFaq);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should warn if question does not end with ?", () => {
    const faqWithoutMark: FAQForValidation = {
      question: "Для яких автомобілів підходить ця шина",
      answer:
        "Bridgestone Turanza 6 підходить для широкого спектру легкових автомобілів та SUV.",
    };

    const result = validateFAQ(faqWithoutMark);

    expect(result.warnings.some((w) => w.includes("знаком питання"))).toBe(true);
  });

  it("should fail on empty question or answer", () => {
    const emptyFaq: FAQForValidation = {
      question: "",
      answer: "",
    };

    const result = validateFAQ(emptyFaq);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateFAQs", () => {
  it("should validate multiple FAQs", () => {
    const faqs: FAQForValidation[] = [
      {
        question: "Для яких автомобілів підходить Bridgestone Turanza 6?",
        answer: "Bridgestone Turanza 6 підходить для широкого спектру легкових автомобілів.",
      },
      {
        question: "Чи можна використовувати ці шини взимку?",
        answer: "Ні, Turanza 6 - це літні шини. Для зими рекомендуємо Blizzak серію.",
      },
    ];

    const result = validateFAQs(faqs);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail on empty FAQ array", () => {
    const result = validateFAQs([]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("порожній"))).toBe(true);
  });
});

describe("generateContentHash", () => {
  it("should generate consistent hash for same content", () => {
    const content = "Test content for hashing";

    const hash1 = generateContentHash(content);
    const hash2 = generateContentHash(content);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(16);
  });

  it("should generate different hash for different content", () => {
    const hash1 = generateContentHash("Content A");
    const hash2 = generateContentHash("Content B");

    expect(hash1).not.toBe(hash2);
  });
});
