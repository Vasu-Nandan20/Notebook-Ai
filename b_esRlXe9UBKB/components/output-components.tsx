'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  RotateCcw,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { OutputType, Flashcard, QuizQuestion, MindMapNode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface OutputComponentsProps {
  type: OutputType
  content: string
}

// Mock data for demonstrations
const mockMindMap: MindMapNode = {
  id: '1',
  label: 'Main Topic',
  children: [
    {
      id: '2',
      label: 'Concept A',
      children: [
        { id: '5', label: 'Detail 1' },
        { id: '6', label: 'Detail 2' },
      ],
    },
    {
      id: '3',
      label: 'Concept B',
      children: [
        { id: '7', label: 'Detail 3' },
        { id: '8', label: 'Detail 4' },
      ],
    },
    {
      id: '4',
      label: 'Concept C',
      children: [{ id: '9', label: 'Detail 5' }],
    },
  ],
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is machine learning?',
    back: 'A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.',
    difficulty: 'easy',
  },
  {
    id: '2',
    front: 'What are the three types of machine learning?',
    back: '1. Supervised Learning\n2. Unsupervised Learning\n3. Reinforcement Learning',
    difficulty: 'medium',
  },
  {
    id: '3',
    front: 'What is overfitting?',
    back: 'When a model learns the training data too well, including noise, and performs poorly on new, unseen data.',
    difficulty: 'hard',
  },
]

const mockQuiz: QuizQuestion[] = [
  {
    id: '1',
    question: 'Which type of learning uses labeled data?',
    options: [
      'Unsupervised Learning',
      'Supervised Learning',
      'Reinforcement Learning',
      'Semi-supervised Learning',
    ],
    correctIndex: 1,
    explanation:
      'Supervised learning uses labeled training data to learn a mapping function.',
  },
  {
    id: '2',
    question: 'What is the main goal of clustering algorithms?',
    options: [
      'Predict a continuous value',
      'Classify into known categories',
      'Group similar data points together',
      'Generate new data',
    ],
    correctIndex: 2,
    explanation:
      'Clustering algorithms aim to find natural groupings in unlabeled data.',
  },
]

const mockTableData = {
  headers: ['Algorithm', 'Type', 'Use Case', 'Complexity'],
  rows: [
    ['Linear Regression', 'Supervised', 'Prediction', 'Low'],
    ['K-Means', 'Unsupervised', 'Clustering', 'Medium'],
    ['Random Forest', 'Supervised', 'Classification', 'High'],
    ['Neural Network', 'Deep Learning', 'Various', 'Very High'],
  ],
}

export function OutputComponents({ type, content }: OutputComponentsProps) {
  switch (type) {
    case 'mindmap':
      return <MindMapOutput data={mockMindMap} />
    case 'table':
      return <TableOutput data={mockTableData} />
    case 'flashcards':
      return <FlashcardsOutput cards={mockFlashcards} />
    case 'quiz':
      return <QuizOutput questions={mockQuiz} />
    default:
      return null
  }
}

function MindMapOutput({ data }: { data: MindMapNode }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['1', '2', '3', '4'])
  )

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <div key={node.id} className={cn('select-none', level > 0 && 'ml-6')}>
        <div
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent',
            level === 0 && 'bg-primary/10 font-semibold'
          )}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )
          ) : (
            <div className="size-4" />
          )}
          <span
            className={cn(
              'text-sm',
              level === 0 && 'text-base',
              level === 1 && 'font-medium'
            )}
          >
            {node.label}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-muted">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Mind Map</CardTitle>
        <Button variant="ghost" size="sm">
          <Download className="mr-1 size-3" />
          Export
        </Button>
      </CardHeader>
      <CardContent>{renderNode(data)}</CardContent>
    </Card>
  )
}

function TableOutput({
  data,
}: {
  data: { headers: string[]; rows: string[][] }
}) {
  const handleCopy = () => {
    const text = [data.headers.join('\t'), ...data.rows.map((r) => r.join('\t'))].join(
      '\n'
    )
    navigator.clipboard.writeText(text)
    toast.success('Table copied to clipboard')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Visual Table</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="mr-1 size-3" />
            Copy
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="mr-1 size-3" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {data.headers.map((header, i) => (
                  <TableHead key={i}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function FlashcardsOutput({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set())

  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const toggleMastered = () => {
    setMasteredCards((prev) => {
      const next = new Set(prev)
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id)
      } else {
        next.add(currentCard.id)
      }
      return next
    })
  }

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Flashcards</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {masteredCards.size}/{cards.length} mastered
          </span>
          <Progress
            value={(masteredCards.size / cards.length) * 100}
            className="w-20"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'relative mx-auto min-h-[200px] cursor-pointer rounded-xl border-2 p-6 transition-all duration-300',
            isFlipped ? 'bg-primary/5' : 'bg-card',
            masteredCards.has(currentCard.id) && 'border-green-500'
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute right-3 top-3 flex gap-2">
            {currentCard.difficulty && (
              <Badge className={difficultyColors[currentCard.difficulty]}>
                {currentCard.difficulty}
              </Badge>
            )}
            {masteredCards.has(currentCard.id) && (
              <Badge className="bg-green-500/10 text-green-600">
                <Check className="mr-1 size-3" />
                Mastered
              </Badge>
            )}
          </div>
          <div className="flex min-h-[150px] items-center justify-center text-center">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {isFlipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-lg font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Click to flip
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {cards.length}
            </span>
            <Button variant="outline" size="sm" onClick={toggleMastered}>
              {masteredCards.has(currentCard.id) ? (
                <>
                  <X className="mr-1 size-3" />
                  Unmark
                </>
              ) : (
                <>
                  <Check className="mr-1 size-3" />
                  Mark Mastered
                </>
              )}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleNext}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function QuizOutput({ questions }: { questions: QuizQuestion[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(
    new Map()
  )
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentIndex]
  const selectedAnswer = selectedAnswers.get(currentQuestion.id)
  const isAnswered = selectedAnswer !== undefined
  const isCorrect = selectedAnswer === currentQuestion.correctIndex

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswers((prev) => new Map(prev).set(currentQuestion.id, index))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswers(new Map())
    setShowResults(false)
  }

  const score = Array.from(selectedAnswers.entries()).filter(
    ([id, answer]) =>
      questions.find((q) => q.id === id)?.correctIndex === answer
  ).length

  if (showResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <p className="text-4xl font-bold text-primary">
              {score}/{questions.length}
            </p>
            <p className="text-muted-foreground">
              {score === questions.length
                ? 'Perfect score!'
                : score >= questions.length / 2
                  ? 'Good job!'
                  : 'Keep practicing!'}
            </p>
          </div>
          <Progress
            value={(score / questions.length) * 100}
            className="mb-4 h-3"
          />
          <Button onClick={handleRestart}>
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Quiz</CardTitle>
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-lg font-medium">{currentQuestion.question}</p>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                'cursor-pointer rounded-lg border p-3 transition-colors',
                !isAnswered && 'hover:bg-accent',
                isAnswered && index === currentQuestion.correctIndex && 'border-green-500 bg-green-500/10',
                isAnswered && selectedAnswer === index && !isCorrect && 'border-red-500 bg-red-500/10',
                !isAnswered && selectedAnswer === index && 'border-primary bg-primary/10'
              )}
              onClick={() => handleSelectAnswer(index)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-sm',
                    isAnswered && index === currentQuestion.correctIndex && 'border-green-500 bg-green-500 text-white',
                    isAnswered && selectedAnswer === index && !isCorrect && 'border-red-500 bg-red-500 text-white'
                  )}
                >
                  {isAnswered && index === currentQuestion.correctIndex ? (
                    <Check className="size-4" />
                  ) : isAnswered && selectedAnswer === index && !isCorrect ? (
                    <X className="size-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
        {isAnswered && currentQuestion.explanation && (
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Explanation: </span>
              {currentQuestion.explanation}
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={handleNext} disabled={!isAnswered}>
            {currentIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-1 size-4" />
              </>
            ) : (
              'See Results'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExportMenu() {
  const handleExport = (format: 'pdf' | 'word' | 'ppt') => {
    toast.info(`Exporting to ${format.toUpperCase()}...`)
    // This would integrate with backend export APIs
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
        <FileText className="mr-1 size-3" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('word')}>
        <FileText className="mr-1 size-3" />
        Word
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('ppt')}>
        <FileText className="mr-1 size-3" />
        PPT
      </Button>
    </div>
  )
}
