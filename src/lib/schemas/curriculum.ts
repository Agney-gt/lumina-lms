import { z } from "zod";

const idSchema = z.string().min(1);

export const quizOptionSchema = z.object({
  id: idSchema,
  text: z.string().min(1),
});

export const contentBlockSchema: z.ZodType<import("@/types/curriculum").ContentBlock> =
  z.lazy(() =>
    z.discriminatedUnion("type", [
      z.object({
        id: idSchema,
        type: z.literal("heading"),
        level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
        text: z.string().min(1),
      }),
      z.object({ id: idSchema, type: z.literal("paragraph"), text: z.string().min(1) }),
      z.object({
        id: idSchema,
        type: z.literal("list"),
        ordered: z.boolean(),
        items: z.array(z.string().min(1)).min(1),
      }),
      z.object({
        id: idSchema,
        type: z.literal("math"),
        value: z.string().min(1),
        display: z.boolean().optional(),
      }),
      z.object({
        id: idSchema,
        type: z.literal("image"),
        src: z.string().min(1),
        alt: z.string().min(1),
        caption: z.string().optional(),
      }),
      z.object({
        id: idSchema,
        type: z.literal("worked_example"),
        title: z.string().min(1),
        content: z.array(contentBlockSchema),
      }),
      z.object({ id: idSchema, type: z.literal("key_idea"), text: z.string().min(1) }),
      z.object({
        id: idSchema,
        type: z.literal("callout"),
        variant: z.enum(["info", "tip"]),
        title: z.string().optional(),
        text: z.string().min(1),
      }),
      z.object({
        id: idSchema,
        type: z.literal("quick_check"),
        questionId: idSchema,
        question: z.string().min(1),
        options: z.array(quizOptionSchema).min(2),
        correctOptionId: idSchema,
        explanation: z.string().min(1),
      }),
      z.object({
        id: idSchema,
        type: z.literal("table"),
        headers: z.array(z.string()).min(1),
        rows: z.array(z.array(z.string())),
        caption: z.string().optional(),
      }),
      z.object({
        id: idSchema,
        type: z.literal("diagram"),
        label: z.string().min(1),
        description: z.string().min(1),
      }),
    ])
  );

export const lessonSchema = z.object({
  id: idSchema,
  unitId: idSchema,
  title: z.string().min(1),
  contentModes: z.array(z.enum(["visual", "text"])).min(1),
  sections: z
    .array(
      z.object({
        id: idSchema,
        title: z.string().min(1),
        blocks: z.array(contentBlockSchema).min(1),
      })
    )
    .min(1),
});

export const subjectSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  grade: z.number().int().positive(),
  description: z.string(),
  publisher: z.string().min(1),
  bookId: z.string().optional(),
  book: z.string().optional(),
  parts: z.array(z.string()).min(1),
  order: z.number().int(),
});

export const chapterSchema = z.object({
  id: idSchema,
  subjectId: idSchema,
  title: z.string().min(1),
  chapterNumber: z.number().int().positive(),
  description: z.string(),
  order: z.number().int(),
  pdfId: z.string().optional(),
  pageRange: z
    .object({ start: z.number().int(), end: z.number().int() })
    .optional(),
  prerequisites: z.array(idSchema),
  conceptIds: z.array(idSchema).min(1),
});

export const conceptSchema = z.object({
  id: idSchema,
  chapterId: idSchema,
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int(),
  unitIds: z.array(idSchema).min(1),
  prerequisites: z.array(idSchema),
  textbookPages: z.object({ start: z.number().int(), end: z.number().int() }),
  learningObjectives: z.array(z.string()).min(1),
});

export const unitSchema = z.object({
  id: idSchema,
  conceptId: idSchema,
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int(),
  estimatedDurationMinutes: z.number().int().positive(),
  learningObjectives: z.array(z.string()).min(1),
  lessonId: idSchema,
  activityIds: z.array(idSchema),
  pageReferences: z
    .array(z.object({ start: z.number().int(), end: z.number().int() }))
    .min(1),
  prerequisites: z.array(idSchema),
});

export const questionSchema = z.object({
  id: idSchema,
  type: z.enum(["mcq", "descriptive"]),
  prompt: z.string().min(1),
  options: z.array(quizOptionSchema).optional(),
  correctOptionId: z.string().optional(),
  explanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  marks: z.number().positive(),
  rubricId: z.string().optional(),
  keyTerms: z.array(z.string()).optional(),
  modelAnswer: z.string().optional(),
});

export const quizSchema = z.object({
  id: idSchema,
  unitId: idSchema,
  conceptId: idSchema,
  type: z.enum(["mcq", "descriptive"]),
  title: z.string().min(1),
  instructions: z.string(),
  questions: z.array(questionSchema).min(1),
  timeLimitSeconds: z.number().int().positive().optional(),
  difficulty: z
    .object({
      enabled: z.boolean(),
      startLevel: z.number().int().min(1).max(5),
      minLevel: z.number().int().min(1).max(5),
      maxLevel: z.number().int().min(1).max(5),
    })
    .optional(),
  passingThreshold: z.number().min(0).max(100),
  scoringPolicy: z.object({
    xpPerCorrect: z.number().positive(),
    confidenceMultipliers: z.object({
      guessing: z.number().min(0),
      fairly_sure: z.number().min(0),
      certain: z.number().min(0),
    }),
  }),
  rubricId: z.string().optional(),
});

export const rubricCategorySchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  weight: z.number().positive(),
  hint: z.string(),
});

export const rubricSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  categories: z.array(rubricCategorySchema).min(1),
});

export const pdfMappingSchema = z.object({
  pdfId: idSchema,
  chapterId: idSchema,
  sourceType: z.enum(["local", "hosted"]),
  assetPath: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  totalPages: z.number().int().positive(),
  pageMappings: z
    .array(
      z.object({
        pages: z.object({ start: z.number().int(), end: z.number().int() }),
        label: z.string().min(1),
        unitIds: z.array(idSchema).min(1),
      })
    )
    .min(1),
  version: z.string(),
});

export const manifestSchema = z.object({
  schemaVersion: z.string(),
  contentVersion: z.string(),
  subjectId: idSchema,
  chapterId: idSchema,
  locale: z.string(),
  publisher: z.string(),
  book: z.string(),
  grade: z.number().int(),
  lastUpdated: z.string(),
});
