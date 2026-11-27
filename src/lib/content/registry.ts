import type {
  AppConfig,
  Chapter,
  Concept,
  Lesson,
  PdfMapping,
  Question,
  Quiz,
  Rubric,
  Subject,
  Unit,
} from "@/types/curriculum";

import appConfigJson from "@/content/config/app-config.json";
import mathsManifest from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/manifest.json";
import mathsSubject from "@/content/curriculum/mathematics/grade-8/ganita-prakash/subject.json";
import numberPlayChapter from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/chapter.json";
import numberPlayConcepts from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/concepts.json";
import parityUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/parity.json";
import remaindersUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/remainders.json";
import divisibilityUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/divisibility-rules.json";
import shortcutsUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/shortcuts.json";
import digitalRootsUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/digital-roots.json";
import cryptarithmsUnits from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/units/cryptarithms.json";
import parityQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/parity.json";
import remaindersQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/remainders.json";
import divisibilityQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/divisibility-rules.json";
import shortcutsQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/shortcuts.json";
import digitalRootsQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/digital-roots.json";
import cryptarithmsQuizzes from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/quizzes/cryptarithms.json";
import mathsRubrics from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/rubrics/descriptive-default.json";
import mathsPdfMappings from "@/content/curriculum/mathematics/grade-8/ganita-prakash/number-play/pdf-mappings.json";
import scienceSubject from "@/content/curriculum/science/grade-8/curiosity/subject.json";

type UnitFile = { conceptId: string; units: (Unit & { lesson: Lesson })[] };
type QuizFile = { quizzes: Quiz[] };

const unitFiles: UnitFile[] = [
  parityUnits,
  remaindersUnits,
  divisibilityUnits,
  shortcutsUnits,
  digitalRootsUnits,
  cryptarithmsUnits,
] as unknown as UnitFile[];

const quizFiles: QuizFile[] = [
  parityQuizzes,
  remaindersQuizzes,
  divisibilityQuizzes,
  shortcutsQuizzes,
  digitalRootsQuizzes,
  cryptarithmsQuizzes,
] as unknown as QuizFile[];

const unitRecords: Unit[] = [];
const lessonRecords: Lesson[] = [];
for (const file of unitFiles) {
  for (const { lesson: lesson, ...unit } of file.units) {
    unitRecords.push(unit);
    lessonRecords.push(lesson);
  }
}

const quizRecords: Quiz[] = quizFiles.flatMap((f) => f.quizzes);

export const CURRICULUM = {
  manifest: mathsManifest,
  subjects: [mathsSubject, scienceSubject] as unknown as Subject[],
  chapters: [numberPlayChapter] as unknown as Chapter[],
  concepts: numberPlayConcepts.concepts as unknown as Concept[],
  units: unitRecords,
  lessons: lessonRecords,
  quizzes: quizRecords,
  rubrics: (mathsRubrics.rubrics) as unknown as Rubric[],
  pdfMappings: [mathsPdfMappings] as unknown as PdfMapping[],
  config: appConfigJson as unknown as AppConfig,
};

export function findQuestion(
  quiz: Quiz,
  questionId: string
): Question | undefined {
  return quiz.questions.find((q) => q.id === questionId);
}
