import {
  chapterSchema,
  conceptSchema,
  lessonSchema,
  manifestSchema,
  pdfMappingSchema,
  quizSchema,
  rubricSchema,
  subjectSchema,
  unitSchema,
} from "@/lib/schemas/curriculum";
import { CURRICULUM } from "@/lib/content/registry";
import type {
  AppConfig,
  Chapter,
  Concept,
  Lesson,
  PdfMapping,
  Quiz,
  Rubric,
  Subject,
  Unit,
} from "@/types/curriculum";

let validated = false;

function validateAll() {
  if (validated) return;
  const results = [
    ["manifest", manifestSchema.safeParse(CURRICULUM.manifest)],
    ...CURRICULUM.subjects.map(
      (s) => [`subject:${s.id}`, subjectSchema.safeParse(s)] as const
    ),
    ...CURRICULUM.chapters.map(
      (c) => [`chapter:${c.id}`, chapterSchema.safeParse(c)] as const
    ),
    ...CURRICULUM.concepts.map(
      (c) => [`concept:${c.id}`, conceptSchema.safeParse(c)] as const
    ),
    ...CURRICULUM.units.map(
      (u) => [`unit:${u.id}`, unitSchema.safeParse(u)] as const
    ),
    ...CURRICULUM.lessons.map(
      (l) => [`lesson:${l.id}`, lessonSchema.safeParse(l)] as const
    ),
    ...CURRICULUM.quizzes.map(
      (q) => [`quiz:${q.id}`, quizSchema.safeParse(q)] as const
    ),
    ...CURRICULUM.rubrics.map(
      (r) => [`rubric:${r.id}`, rubricSchema.safeParse(r)] as const
    ),
    ...CURRICULUM.pdfMappings.map(
      (p) => [`pdf:${p.pdfId}`, pdfMappingSchema.safeParse(p)] as const
    ),
  ] as const;

  const errors = results
    .filter(([, r]) => !r.success)
    .map(([name, r]) => {
      const issues = r.success ? [] : r.error.issues;
      return `${name}: ${issues
        .map((i) => `${i.path.join(".")} — ${i.message}`)
        .join("; ")}`;
    });

  if (errors.length > 0) {
    throw new Error(
      `Invalid curriculum content:\n${errors.join("\n")}`
    );
  }
  validated = true;
}

export function getAppConfig(): AppConfig {
  validateAll();
  return CURRICULUM.config;
}

export function getSubjects(): Subject[] {
  validateAll();
  return [...CURRICULUM.subjects].sort((a, b) => a.order - b.order);
}

export function getSubject(subjectId: string): Subject | undefined {
  return getSubjects().find((s) => s.id === subjectId);
}

export function getChaptersForSubject(subjectId: string): Chapter[] {
  validateAll();
  return CURRICULUM.chapters
    .filter((c) => c.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}

export function getChapter(chapterId: string): Chapter | undefined {
  validateAll();
  return CURRICULUM.chapters.find((c) => c.id === chapterId);
}

export function getConceptsForChapter(chapterId: string): Concept[] {
  return CURRICULUM.concepts
    .filter((c) => c.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}

export function getConcept(conceptId: string): Concept | undefined {
  validateAll();
  return CURRICULUM.concepts.find((c) => c.id === conceptId);
}

export function getUnitsForConcept(conceptId: string): Unit[] {
  return CURRICULUM.units
    .filter((u) => u.conceptId === conceptId)
    .sort((a, b) => a.order - b.order);
}

export function getUnit(unitId: string): Unit | undefined {
  validateAll();
  return CURRICULUM.units.find((u) => u.id === unitId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  validateAll();
  return CURRICULUM.lessons.find((l) => l.id === lessonId);
}

export function getLessonForUnit(unitId: string): Lesson | undefined {
  const unit = getUnit(unitId);
  return unit ? getLesson(unit.lessonId) : undefined;
}

export function getQuiz(quizId: string): Quiz | undefined {
  validateAll();
  return CURRICULUM.quizzes.find((q) => q.id === quizId);
}

export function getQuizzesForConcept(conceptId: string): Quiz[] {
  return CURRICULUM.quizzes.filter((q) => q.conceptId === conceptId);
}

export function getQuizzesForUnit(unitId: string): Quiz[] {
  return CURRICULUM.quizzes.filter((q) => q.unitId === unitId);
}

export function getAllQuizzes(): Quiz[] {
  validateAll();
  return CURRICULUM.quizzes;
}

export function getRubric(rubricId: string): Rubric | undefined {
  validateAll();
  return CURRICULUM.rubrics.find((r) => r.id === rubricId);
}

export function getPdfMapping(pdfId: string): PdfMapping | undefined {
  validateAll();
  return CURRICULUM.pdfMappings.find((p) => p.pdfId === pdfId);
}

export function getPdfMappingForChapter(
  chapterId: string
): PdfMapping | undefined {
  return CURRICULUM.pdfMappings.find((p) => p.chapterId === chapterId);
}

export function getManifest() {
  validateAll();
  return CURRICULUM.manifest;
}

export function getCurriculumStats(chapterId: string) {
  const concepts = getConceptsForChapter(chapterId);
  const unitCount = concepts.reduce(
    (sum, c) => sum + c.unitIds.length,
    0
  );
  return { conceptCount: concepts.length, unitCount };
}
