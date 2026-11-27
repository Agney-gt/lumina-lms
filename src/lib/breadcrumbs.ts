export interface Crumb {
  label: string;
  href?: string;
}

export const MODULE_PATHS = {
  home: "/home",
  lessons: "/lessons",
  quizzes: "/quizzes",
  progress: "/progress",
  pdf: "/chapter-pdf",
  subjects: "/subjects",
} as const;

export function subjectCrumb(subjectName: string, grade: number): Crumb {
  return { label: `${subjectName} (Grade ${grade})`, href: `/subjects/maths-grade-8` };
}

export function lessonsChapterCrumbs(chapterTitle: string): Crumb[] {
  return [
    { label: "Maths", href: MODULE_PATHS.lessons },
    { label: chapterTitle },
  ];
}
