"use client"

import { useMemo, useState } from "react"
import { CircleCheck, FileText, Info, Loader2, Sparkles, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type Stage = "input" | "parsing" | "review"

const MOCK_HISTORY = [
  {
    id: "doc-1",
    name: "Fintech Wallet MVP",
    uploadedAt: "Today • 09:42",
    status: "Processed",
  },
  {
    id: "doc-2",
    name: "Marketplace MVP",
    uploadedAt: "Yesterday • 16:12",
    status: "Processed",
  },
]
type StoryStatus = "To Do" | "In Progress" | "Done"
type StoryRecord = {
  id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  points: number
  tags: string[]
  type: typeof STORY_TYPES[number]
  status: StoryStatus
  sprint: string | null
}

const MOCK_STORIES: StoryRecord[] = [
  {
    id: "story-1",
    title: "As a new user I want to register with email or social login",
    description:
      "Capture user registration flows supporting email OTP verification and optional Google login. Ensure onboarding collects role selection.",
    acceptanceCriteria: [
      "Email sign-up issues verification email",
      "Google OAuth callback creates linked profile",
      "Registration captures preferred workspace role",
    ],
    points: 5,
    tags: ["UI", "Backend"],
    type: "Backend",
    status: "In Progress",
    sprint: "Sprint 08",
  },
  {
    id: "story-2",
    title: "As a PM I want parsed MVP features surfaced for review",
    description:
      "Display extracted features grouped by theme in a review queue with approve/merge/discard actions.",
    acceptanceCriteria: [
      "Feature cards include origin paragraph reference",
      "Approve sends story to backlog",
      "Discard removes feature from queue",
    ],
    points: 3,
    tags: ["UI", "Bot-Automatable"],
    type: "UI",
    status: "To Do",
    sprint: "Sprint 08",
  },
  {
    id: "story-3",
    title: "As an engineer I want automated smoke tests",
    description:
      "Bot executes regression suite after merges and reports to Slack with failure snapshots.",
    acceptanceCriteria: [
      "Bot runs smoke tests within 5 minutes of merge",
      "Failures post summary and artifact link to #release channel",
      "Retries happen automatically once",
    ],
    points: 8,
    tags: ["automation", "quality"],
    type: "Bot-automatable",
    status: "To Do",
    sprint: null,
  },
]

const STATUSES: Array<"To Do" | "In Progress" | "Done"> = ["To Do", "In Progress", "Done"]
const STORY_TYPES = ["UI", "Backend", "Bot-automatable"] as const

export default function MvpIntakePage() {
  const [language, setLanguage] = useState("en")
  const [activeTab, setActiveTab] = useState("drafts")
  const [stage, setStage] = useState<Stage>("input")
  const [stepError, setStepError] = useState<string | null>(null)

  const storyCount = useMemo(() => MOCK_STORIES.length, [])

  const steps: Array<{
    label: string
    description: string
    value: Stage
  }> = [
    {
      label: "Submit document",
      description: "Paste the MVP brief or upload a file, then kick off parsing.",
      value: "input",
    },
    {
      label: "Track parsing",
      description: "Monitor AI processing and wait for story generation to finish.",
      value: "parsing",
    },
    {
      label: "Review stories",
      description: "Edit, tag, and approve generated stories before exporting.",
      value: "review",
    },
  ]

  const currentStepIndex = steps.findIndex((step) => step.value === stage)

  const handleSubmitForParsing = () => {
    if (stage !== "input") return
    setStepError(null)
    setStage("parsing")
  }

  const handleMarkParsingComplete = () => {
    if (stage !== "parsing") return
    setStepError(null)
    setStage("review")
  }

  const handleStepSelect = (targetStage: Stage, index: number) => {
    if (index > currentStepIndex) {
      setStepError("Complete the current step before moving forward.")
      return
    }
    setStepError(null)
    setStage(targetStage)
  }

  const storyMetrics = useMemo(() => {
    const total = MOCK_STORIES.length
    const byStatus = STATUSES.reduce<Record<"To Do" | "In Progress" | "Done", number>>(
      (acc, status) => {
        acc[status] = MOCK_STORIES.filter((story) => story.status === status).length
        return acc
      },
      { "To Do": 0, "In Progress": 0, Done: 0 }
    )
    const byType = STORY_TYPES.reduce<Record<string, number>>((acc, type) => {
      acc[type] = MOCK_STORIES.filter((story) => story.type === type).length
      return acc
    }, {})
    const unassigned = MOCK_STORIES.filter((story) => !story.sprint).length

    return { total, byStatus, byType, unassigned }
  }, [])

  return (
    <main className="space-y-8 pb-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.primary/60)_theme(colors.slate.900/80)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full border border-primary/60 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
            MVP Intake
          </Badge>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Document input & parsing workflow
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          Convert MVP briefs into ready-to-play user stories
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Follow the guided flow to submit MVP documentation, monitor parsing status, and polish the generated story drafts before committing them to your backlog.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isDone = currentStepIndex > index
            const isActive = currentStepIndex === index
            const isLocked = currentStepIndex < index
            return (
              <button
                type="button"
                key={step.value}
                className={cn(
                  "w-full rounded-2xl border bg-slate-900/70 p-4 text-left shadow-inner transition",
                  isActive
                    ? "border-primary/60 shadow-primary/10"
                    : "border-slate-800/70 shadow-slate-950/40",
                  isLocked && "cursor-not-allowed opacity-60"
                )}
                onClick={() => handleStepSelect(step.value, index)}
                disabled={isLocked}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                      isDone
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                        : isActive
                        ? "border-primary/60 bg-primary/20 text-primary-foreground"
                        : "border-slate-700 bg-slate-800/80 text-slate-300"
                    )}
                  >
                    {isDone ? <CircleCheck className="size-4" /> : index + 1}
                  </span>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {step.description}
                </p>
              </button>
            )
          })}
        </div>
        {stepError ? (
          <p className="text-xs text-rose-400">{stepError}</p>
        ) : null}
      </section>

      {stage === "input" && (
        <Card className="border border-slate-800/70 bg-slate-900/75 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-4">
            <CardTitle className="text-white">Document input</CardTitle>
            <CardDescription className="text-slate-300">
              Paste MVP content or upload a file to kick off parsing. Validation ensures supported formats and required fields.
            </CardDescription>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-800/50 p-1">
                <TabsTrigger
                  value="drafts"
                  className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Paste MVP draft
                </TabsTrigger>
                <TabsTrigger
                  value="uploads"
                  className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Upload file
                </TabsTrigger>
              </TabsList>
              <TabsContent value="drafts" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mvp-text" className="text-slate-200">
                    MVP document text
                  </Label>
                  <textarea
                    id="mvp-text"
                    rows={10}
                    placeholder="Paste executive summary, success criteria, feature outline..."
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </TabsContent>
              <TabsContent value="uploads" className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-slate-300">
                  <UploadCloud className="mb-3 size-8 text-white" />
                  <p className="text-sm text-white">Drag & drop your MVP document</p>
                  <p className="text-xs text-slate-400">
                    Supported formats: .txt, .docx, .pdf (max 10 MB)
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                  >
                    Browse files
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-slate-200">
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="border-slate-800/80 bg-slate-950/60 text-slate-100">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Choose the source language so the parser can apply the correct NLP model.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <FileText className="size-4" />
                  <span>Document guidelines</span>
                </div>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Capture objectives, personas, and key features in separate paragraphs.</li>
                  <li>Explicitly note edge cases or compliance requirements.</li>
                  <li>Highlight priorities using headings (“Must Have”, “Nice to Have”).</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <Sparkles className="size-4 text-primary" />
                  <span>Accelerate your first run</span>
                </div>
                <p className="mb-3">
                  Try a curated brief or let the parser summarize your pasted content before submitting.
                  You can always replace it with your own document later.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900"
                  >
                    Load sample brief
                  </Button>
                  <Button
                    variant="outline"
                    className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900"
                  >
                    Summarize pasted text
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="text-xs text-slate-400">
              Tip: Re-run parsing on historical documents to compare outputs after model updates.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              >
                Clear draft
              </Button>
              <Button
                className="shadow-lg shadow-primary/25"
                onClick={handleSubmitForParsing}
              >
                Submit for parsing
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {stage === "parsing" && (
        <Card className="border border-slate-800/70 bg-slate-900/75 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Loader2 className="size-5 animate-spin text-white" />
              Parsing in progress
            </CardTitle>
            <CardDescription className="text-slate-300">
              We&apos;re generating structured stories from your document. You can monitor the pipeline or cancel to upload a new version.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-200">
            <div className="space-y-3">
              {[
                { label: "Extracting features", status: "Complete" },
                { label: "Generating stories", status: "In progress" },
                { label: "Enriching acceptance criteria", status: "Pending" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2 text-xs"
                >
                  <span className="text-slate-300">{step.label}</span>
                  <span
                    className={cn(
                      "text-xs",
                      step.status === "Complete"
                        ? "text-emerald-400"
                        : step.status === "In progress"
                        ? "text-primary"
                        : "text-slate-500"
                    )}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-800/80" />
            <p className="text-xs text-slate-400">
              Estimated time remaining: <span className="text-white">~45 seconds</span>
            </p>
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
              <p className="flex items-center gap-2 text-white">
                <Info className="size-3" />
                Keep this window open to watch real-time updates or pause/cancel any time.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              Pause
            </Button>
            <Button
              variant="secondary"
              className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              onClick={handleMarkParsingComplete}
            >
              Mark parsing complete
            </Button>
            <Button
              variant="destructive"
              className="bg-rose-600/80 hover:bg-rose-600"
              onClick={() => {
                setStage("input")
                setStepError(null)
              }}
            >
              Cancel parsing
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "review" && (
        <Card className="border border-slate-800/70 bg-slate-900/75 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Story review & edit</CardTitle>
                <CardDescription className="text-slate-300">
                  Refine the generated stories before committing them to the backlog. Approve or discard in bulk, and edit fields inline.
                </CardDescription>
              </div>
              <Badge className="border border-primary/40 bg-primary/15 text-primary">
                {storyCount} generated stories
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-xs text-slate-300 shadow-inner shadow-slate-950/30">
              <p className="text-slate-200">
                Tip: Edit any field inline. Approved stories will sync to the backlog with the latest values. Use “Merge” to consolidate overlapping narratives before publishing.
              </p>
            </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 shadow-inner shadow-slate-950/30">
              <p className="text-xs text-slate-400">Total stories</p>
              <p className="text-lg font-semibold text-white">{storyMetrics.total}</p>
            </div>
            {STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 shadow-inner shadow-slate-950/30"
              >
                <p className="text-xs text-slate-400">{status}</p>
                <p className="text-lg font-semibold text-white">
                  {storyMetrics.byStatus[status]}
                </p>
              </div>
            ))}
          </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="filter-search" className="text-slate-200">
                  Search stories
                </Label>
                <Input
                  id="filter-search"
                  placeholder="Search title or criteria..."
                  className="border-slate-800/80 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/70"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-200">Tags</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="border-slate-800/80 bg-slate-950/60 text-slate-100">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="all">All tags</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="bot">Bot-automatable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-end justify-end gap-2">
                <Button
                  variant="secondary"
                  className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                >
                  Approve all
                </Button>
                <Button
                  variant="outline"
                  className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                >
                  Discard all
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_STORIES.map((story) => (
              <div
                key={story.id}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-2">
                    <Badge variant="outline" className="border border-primary/40 bg-primary/10 text-primary">
                      Story
                    </Badge>
                    <Input
                      defaultValue={story.title}
                      className="flex-1 border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      defaultValue={story.points}
                      className="w-20 border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                    <Select defaultValue={story.tags[0]?.toLowerCase()}>
                      <SelectTrigger className="w-36 border-slate-800/80 bg-slate-950/70 text-slate-100 focus:ring-primary/50">
                        <SelectValue placeholder="Tag" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                        <SelectItem value="ui">UI</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="bot">Bot-automatable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-xs text-slate-400">Description</Label>
                  <textarea
                    defaultValue={story.description}
                    rows={3}
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-xs text-slate-400">Acceptance criteria</Label>
                  <div className="space-y-2">
                    {story.acceptanceCriteria.map((item, index) => (
                      <Input
                        key={`${story.id}-ac-${index}`}
                        defaultValue={item}
                        className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="w-fit border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
                    >
                      + Add criterion
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    {story.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border border-slate-700 bg-slate-950/60 text-slate-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="border border-slate-700 bg-emerald-600/80 text-white hover:bg-emerald-600"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:border-primary hover:bg-slate-900"
                    >
                      Merge
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-rose-600/80 hover:bg-rose-600"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-400">
              Need a new story? Add it manually to provide context before syncing to the backlog.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              >
                Add custom story
              </Button>
              <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/35">
                Export approved stories
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="rounded-xl border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900/60 sm:px-6">
            <span>Upload history</span>
            <Badge className="bg-slate-800/80 text-xs text-slate-200 group-open:bg-primary/30 group-open:text-primary-foreground">
              {MOCK_HISTORY.length} uploads
            </Badge>
          </summary>
          <div className="space-y-3 px-4 pb-4 pt-2 text-sm sm:px-6">
            {MOCK_HISTORY.map((entry, index) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-sm shadow-slate-950/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Upload {index + 1} • {entry.uploadedAt}
                    </p>
                    <p className="text-sm text-white">{entry.name}</p>
                  </div>
                  <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-200">
                    {entry.status}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-2 rounded-lg bg-slate-900/70 p-3 text-xs text-slate-300">
                  <p>
                    Stories generated and stored in review. Compare with newer runs to analyze requirement changes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900"
                    >
                      View stories
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900"
                    >
                      Re-run parsing
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-rose-600/60 bg-rose-600/10 px-3 py-1 text-xs text-rose-200 hover:bg-rose-600/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400">
              Use the history to compare MVP revisions, validate parsing changes, or clean up outdated briefs.
            </p>
          </div>
        </details>
      </div>
    </main>
  )
}

