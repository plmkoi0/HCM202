import artifactsJson from '../data/artifacts.json'
import quizJson from '../data/quiz.json'
import sourcesJson from '../data/sources.json'
import teamJson from '../data/team.json'
import type { Artifact, QuizData, SourcesData, TeamData } from '../types'

export const artifacts = artifactsJson as Artifact[]
export const quiz = quizJson as QuizData
export const sources = sourcesJson as SourcesData
export const team = teamJson as TeamData

export const isTodo = (s: string | undefined | null) => !s || s.trim().startsWith('TODO')
