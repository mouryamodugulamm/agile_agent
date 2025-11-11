"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Gauge,
  ListChecks,
  Settings2,
  ShieldCheck,
  Zap,
} from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type StoryCategory = "documentation" | "scaffolding" | "testing"
type AssignmentStatus = "Pending" | "Running" | "Completed" | "Failed" | "Review Needed"

type AssignmentRule = {
  enabled: boolean
  maxPoints: number
  escalation: "notify" | "auto-reassign"
}

type AiAgent = {
  id: string
  name: string
  specialty: string
  currentTask?: string
  successRate: number
  avgCompletionMins: number
  status: "Available" | "Busy" | "Cooling Down"
}

type StoryAssignment = {
  id: string
  title: string
  category: StoryCategory
  status: AssignmentStatus
  assignedTo: "AI" | "Human"
  agentId: string | null
  lastUpdate: string
  confidence: number
  log: Array<{ timestamp: string; message: string; variant?: "info" | "warning" | "error" }>
}

const DEFAULT_RULES: Record<StoryCategory, AssignmentRule> = {
  documentation: {
    enabled: true,
    maxPoints: 3,
    escalation: "notify",
  },
  scaffolding: {
    enabled: true,
    maxPoints: 5,
    escalation: "auto-reassign",
  },
  testing: {
    enabled: false,
    maxPoints: 2,
    escalation: "notify",
  },
}

const MOCK_AGENTS: AiAgent[] = [
  {
    id: "agent-alpha",
    name: "Alpha",
    specialty: "Documentation & Knowledge Base",
    currentTask: "Compile onboarding FAQ",
    successRate: 0.92,
    avgCompletionMins: 18,
    status: "Busy",
  },
  {
    id: "agent-bravo",
    name: "Bravo",
    specialty: "React scaffolding & UI polish",
    currentTask: "Generate admin analytics layout",
    successRate: 0.89,
    avgCompletionMins: 26,
    status: "Busy",
  },
  {
    id: "agent-cirrus",
    name: "Cirrus",
    specialty: "Integration & smoke testing",
    currentTask: undefined,
    successRate: 0.81,
    avgCompletionMins: 34,
    status: "Available",
  },
  {
    id: "agent-delta",
    name: "Delta",
    specialty: "Changelog summaries & release notes",
    currentTask: "Summarize Sprint 8 release notes",
    successRate: 0.95,
    avgCompletionMins: 12,
    status: "Cooling Down",
  },
]

const MOCK_ASSIGNMENTS: StoryAssignment[] = [
  {
    id: "story-ai-01",
    title: "Draft release notes for Sprint 08",
    category: "documentation",
    status: "Running",
    assignedTo: "AI",
    agentId: "agent-delta",
    lastUpdate: "2 minutes ago",
    confidence: 0.87,
    log: [
      { timestamp: "10:00", message: "Assignment triggered via automation rule." },
      { timestamp: "10:02", message: "AI agent Delta gathered commit history." },
      { timestamp: "10:05", message: "Generated summary requiring approval.", variant: "warning" },
    ],
  },
  {
    id: "story-ai-02",
    title: "Scaffold settings microservice endpoints",
    category: "scaffolding",
    status: "Pending",
    assignedTo: "AI",
    agentId: "agent-bravo",
    lastUpdate: "5 minutes ago",
    confidence: 0.73,
    log: [
      { timestamp: "09:43", message: "Story queued. Awaiting agent capacity." },
      { timestamp: "09:57", message: "Agent Bravo finishing current mission." },
    ],
  },
  {
    id: "story-ai-03",
    title: "Automate smoke tests for login flow",
    category: "testing",
    status: "Review Needed",
    assignedTo: "Human",
    agentId: "agent-cirrus",
    lastUpdate: "8 minutes ago",
    confidence: 0.54,
    log: [
      { timestamp: "09:30", message: "AI completed suite with 2 failures.", variant: "error" },
      { timestamp: "09:35", message: "Escalated to DevOps for manual triage.", variant: "warning" },
    ],
  },
  {
    id: "story-ai-04",
    title: "Generate onboarding FAQ article",
    category: "documentation",
    status: "Completed",
    assignedTo: "AI",
    agentId: "agent-alpha",
    lastUpdate: "15 minutes ago",
    confidence: 0.93,
    log: [
      { timestamp: "09:00", message: "AI agent Alpha compiled draft." },
      { timestamp: "09:08", message: "QA reviewed and approved content.", variant: "info" },
    ],
  },
]

const STATUS_VARIANTS: Record<
  AssignmentStatus,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Pending: {
    label: "Pending",
    badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    icon: Zap,
  },
  Running: {
    label: "Running",
    badgeClass: "border-primary/40 bg-primary/15 text-primary-foreground",
    icon: Activity,
  },
  Completed: {
    label: "Completed",
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    icon: CheckCircle2,
  },
  Failed: {
    label: "Failed",
    badgeClass: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    icon: AlertTriangle,
  },
  "Review Needed": {
    label: "Review needed",
    badgeClass: "border-slate-500/40 bg-slate-500/15 text-slate-200",
    icon: AlertCircle,
  },
}

export default function AiMissionsPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "stories" | "agents">("settings")
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)
  const [selectedStoryId, setSelectedStoryId] = useState<string>(MOCK_ASSIGNMENTS[0]?.id ?? "")
  const [manualOverride, setManualOverride] = useState(false)

  const selectedStory = useMemo(
    () => assignments.find((story) => story.id === selectedStoryId),
    [assignments, selectedStoryId]
  )

  const aiOwned = useMemo(
    () => assignments.filter((item) => item.assignedTo === "AI").length,
    [assignments]
  )

  const humanOverrides = useMemo(
    () => assignments.filter((item) => item.assignedTo === "Human").length,
    [assignments]
  )

  const handleRuleToggle = (category: StoryCategory, enabled: boolean) => {
    setRules((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled,
      },
    }))
  }

  const handleRulePointsChange = (category: StoryCategory, maxPoints: number) => {
    setRules((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        maxPoints,
      },
    }))
  }

  const handleEscalationChange = (category: StoryCategory, escalation: "notify" | "auto-reassign") => {
    setRules((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        escalation,
      },
    }))
  }

  const handleManualReassign = (storyId: string) => {
    setAssignments((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? {
              ...story,
              assignedTo: story.assignedTo === "AI" ? "Human" : "AI",
              status: story.assignedTo === "AI" ? "Review Needed" : "Pending",
              log: [
                {
                  timestamp: "Now",
                  message:
                    story.assignedTo === "AI"
                      ? "Manual override triggered. Awaiting human lead."
                      : "Story returned to AI queue for reassignment.",
                  variant: "warning",
                },
                ...story.log,
              ],
            }
          : story
      )
    )
  }

  const aggregatedStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter((story) => story.status === "Completed").length
    const inProgress = assignments.filter((story) => story.status === "Running").length
    const needingReview = assignments.filter((story) => story.status === "Review Needed").length

    return { total, completed, inProgress, needingReview }
  }, [assignments])

  return (
    <main className="space-y-8 pb-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.primary/60)_theme(colors.slate.900/80)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full border border-primary/60 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
            AI Assignments
          </Badge>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Automated story orchestration for AI agents
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          Route eligible stories to AI agents and monitor automated delivery
        </h1>
        <p className="max-w-4xl text-sm text-slate-300">
          Configure eligibility rules, review individual story assignments, and track AI agent health — all in one
          console designed for bot-augmented teams.
        </p>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-800/50 p-1">
            <TabsTrigger value="settings" className="text-xs uppercase tracking-wide">
              Auto-assignment settings
            </TabsTrigger>
            <TabsTrigger value="stories" className="text-xs uppercase tracking-wide">
              Story assignments
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs uppercase tracking-wide">
              AI agent dashboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {activeTab === "settings" && (
        <section className="space-y-6">
          <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings2 className="size-5 text-white" />
                Auto-assignment rules
              </CardTitle>
              <CardDescription className="text-slate-300">
                Decide when stories auto-route to AI agents. Adjust complexity thresholds, escalation paths, and test your configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
              <div className="space-y-4">
                {(
                  [
                    { key: "documentation", label: "Documentation & release notes", description: "Generate copy, FAQs, onboarding scripts.", icon: ListChecks },
                    { key: "scaffolding", label: "Code scaffolding & boilerplate", description: "Create starter components, API shells, CLI scripts.", icon: Zap },
                    { key: "testing", label: "Regression & smoke testing", description: "Automate targeted test suites and sanity checks.", icon: ShieldCheck },
                  ] satisfies Array<{ key: StoryCategory; label: string; description: string; icon: React.ComponentType<{ className?: string }> }>
                ).map((rule) => {
                  const Icon = rule.icon
                  const value = rules[rule.key]
                  return (
                    <div
                      key={rule.key}
                      className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-white" />
                            <p className="text-sm font-semibold text-white">{rule.label}</p>
                          </div>
                          <p className="text-xs text-slate-400">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wide text-slate-500">Auto-assign</span>
                          <Switch
                            checked={value.enabled}
                            onCheckedChange={(checked) => handleRuleToggle(rule.key, checked)}
                          />
                        </div>
                      </div>

                      <Separator className="my-3 bg-slate-800/70" />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs uppercase tracking-wide text-slate-400">
                            Max story points
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={13}
                            value={value.maxPoints}
                            onChange={(event) =>
                              handleRulePointsChange(rule.key, Number(event.target.value) || value.maxPoints)
                            }
                            className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                          />
                          <p className="text-[11px] text-slate-500">
                            Stories equal or below this estimate will be auto-routed when available AI agents match.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs uppercase tracking-wide text-slate-400">
                            Escalation behaviour
                          </Label>
                          <Select
                            value={value.escalation}
                            onValueChange={(val: "notify" | "auto-reassign") => handleEscalationChange(rule.key, val)}
                          >
                            <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                              <SelectValue placeholder="Select escalation" />
                            </SelectTrigger>
                            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                              <SelectItem value="notify">Notify owner when AI fails</SelectItem>
                              <SelectItem value="auto-reassign">Auto reassign to human when AI fails</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-slate-500">
                            Choose how the system responds if an AI run hits errors or requires human validation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-inner shadow-primary/20">
                  <p className="text-sm font-semibold text-primary-foreground">Automation insights</p>
                  <div className="mt-3 space-y-2 text-xs text-primary-foreground/90">
                    <p>
                      <strong className="text-white">{aiOwned}</strong> stories actively owned by AI this sprint.
                    </p>
                    <p>
                      <strong className="text-white">{humanOverrides}</strong> manual overrides triggered by humans.
                    </p>
                    <p>
                      {manualOverride ? (
                        <span className="text-rose-200">Manual override in effect — new stories require approval.</span>
                      ) : (
                        "Manual override disabled — AI can self-assign within configured limits."
                      )}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-200">
                    <span>Manual override (admins)</span>
                    <Switch checked={manualOverride} onCheckedChange={setManualOverride} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                  <p className="text-sm font-semibold text-white">Assignment tests</p>
                  <p className="mt-2 text-slate-400">
                    Run a sandboxed evaluation to confirm the right agent picks up a sample story.
                  </p>
                  <div className="mt-3 space-y-2">
                    <Label className="text-slate-200">Sample story type</Label>
                    <Select defaultValue="documentation">
                      <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                        <SelectValue placeholder="Story type" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="scaffolding">Code scaffolding</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/35">
                        Run simulation
                      </Button>
                      <Button
                        variant="outline"
                        className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                      >
                        View latest results
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === "stories" && (
        <section className="space-y-6">
          <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="size-5 text-white" />
                Story assignment monitor
              </CardTitle>
              <CardDescription className="text-slate-300">
                Inspect active assignments, swap ownership, or deep-dive into the AI activity log for each story.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
              <div className="space-y-3">
                {assignments.map((story) => {
                  const StatusIcon = STATUS_VARIANTS[story.status].icon
                  return (
                    <button
                      key={story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                      className={cn(
                        "w-full rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-left transition hover:border-primary/40",
                        selectedStoryId === story.id && "border-primary/60 bg-primary/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{story.title}</p>
                          <p className="text-xs text-slate-400">
                            {story.assignedTo === "AI" ? "AI agent" : "Human owner"} • Last update {story.lastUpdate}
                          </p>
                        </div>
                        <Badge className={cn("flex items-center gap-1 text-[11px]", STATUS_VARIANTS[story.status].badgeClass)}>
                          <StatusIcon className="size-3" />
                          {STATUS_VARIANTS[story.status].label}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                        <Badge className="border border-slate-700 bg-slate-950/70 text-slate-100 uppercase tracking-wide">
                          {story.category}
                        </Badge>
                        <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1">
                          Confidence {Math.round(story.confidence * 100)}%
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1">
                          Assigned to {story.assignedTo === "AI" ? "AI" : "Human"}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40">
                {selectedStory ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{selectedStory.title}</p>
                        <p className="text-xs text-slate-400">Story ID: {selectedStory.id}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                        >
                          Request status update
                        </Button>
                        <Button
                          variant="secondary"
                          className="border border-slate-700 bg-emerald-500/80 text-white hover:bg-emerald-500"
                          onClick={() => handleManualReassign(selectedStory.id)}
                        >
                          {selectedStory.assignedTo === "AI" ? "Reassign to human" : "Return to AI"}
                        </Button>
                      </div>
                    </div>
                    <Separator className="bg-slate-800/80" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 text-xs text-slate-300">
                        <p className="text-slate-200">Assignment</p>
                        <p className="text-sm font-semibold text-white">
                          {selectedStory.assignedTo === "AI" ? "AI agent" : "Human owner"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Agent:{" "}
                          {selectedStory.agentId
                            ? MOCK_AGENTS.find((agent) => agent.id === selectedStory.agentId)?.name ?? "Unknown"
                            : "Manual assignment"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 text-xs text-slate-300">
                        <p className="text-slate-200">Health</p>
                        <p className="text-sm font-semibold text-white">
                          Confidence {Math.round(selectedStory.confidence * 100)}%
                        </p>
                        <p className="text-xs text-slate-400">Last update {selectedStory.lastUpdate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Activity log
                      </p>
                      <div className="mt-2 space-y-2">
                        {selectedStory.log.map((entry, index) => (
                          <div
                            key={`${selectedStory.id}-log-${index}`}
                            className={cn(
                              "rounded-xl border px-3 py-2 text-xs",
                              entry.variant === "error"
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                                : entry.variant === "warning"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                                : "border-slate-800/70 bg-slate-900/70 text-slate-200"
                            )}
                          >
                            <p className="font-medium text-white">{entry.timestamp}</p>
                            <p className="text-slate-200">{entry.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <Bot className="size-8 text-slate-600" />
                    <p className="text-sm text-slate-400">Select a story card to inspect active assignment details.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === "agents" && (
        <section className="space-y-6">
          <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Gauge className="size-5 text-white" />
                AI agent performance
              </CardTitle>
              <CardDescription className="text-slate-300">
                Monitor utilisation, completion metrics, and alert states for every AI agent plugged into the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
              <div className="grid gap-3 md:grid-cols-2">
                {MOCK_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-slate-400">{agent.specialty}</p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[11px] uppercase tracking-wide",
                          agent.status === "Available"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                            : agent.status === "Busy"
                            ? "border-primary/40 bg-primary/15 text-primary-foreground"
                            : "border-amber-500/40 bg-amber-500/15 text-amber-200"
                        )}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <p>
                        <strong className="text-white">Current mission:</strong>{" "}
                        {agent.currentTask ?? "Idle — ready for next assignment"}
                      </p>
                      <p>
                        <strong className="text-white">Success rate:</strong> {Math.round(agent.successRate * 100)}%
                      </p>
                      <p>
                        <strong className="text-white">Avg completion:</strong> {agent.avgCompletionMins} mins
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
                      >
                        View history
                      </Button>
                      <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                        Adjust workload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                  <p className="text-sm font-semibold text-white">Assignment summary</p>
                  <div className="mt-3 space-y-2">
                    <p>Total missions tracked: {aggregatedStats.total}</p>
                    <p>Completed in last 24h: {aggregatedStats.completed}</p>
                    <p>Currently running: {aggregatedStats.inProgress}</p>
                    <p>Requires human review: {aggregatedStats.needingReview}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="size-4" />
                    Alert feed
                  </p>
                  <div className="mt-3 space-y-2 text-xs">
                    <p>• 09:58 — Agent Bravo reports configuration drift on sandbox cluster.</p>
                    <p>• 09:41 — Agent Cirrus flagged intermittent timeout on smoke suite.</p>
                    <p>• 09:24 — Manual override triggered by release captain.</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 border border-rose-500/50 bg-transparent text-rose-100 hover:bg-rose-500/20"
                  >
                    Acknowledge alerts
                  </Button>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="size-4" />
                    Recent wins
                  </p>
                  <div className="mt-3 space-y-2 text-xs">
                    <p>• Agent Delta completed release notes in record time.</p>
                    <p>• Alpha resolved knowledge base backlog with 98% approval.</p>
                    <p>• Automation rules reduced manual triage by 37% this sprint.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Stay ahead of AI capacity — re-balance workloads before the backlog spikes.</span>
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                Export agent analytics
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}
    </main>
  )
}

