"use client"

import { useMemo, useState } from "react"
import {
  ActivitySquare,
  AlertTriangle,
  Bot,
  CheckCircle2,
  CodeXml,
  GitBranch,
  History,
  Link2,
  Play,
  RefreshCcw,
  ServerCog,
  Settings2,
  ShieldAlert,
  TerminalSquare,
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

type TabSection = "settings" | "stories" | "builds"

type RepoConfig = {
  url: string
  branch: string
  commitTemplate: string
  autoCommit: boolean
  autoBuild: boolean
}

type StoryBuildStatus = {
  id: string
  title: string
  branch: string
  commitHash: string
  status: "Pending" | "Running" | "Success" | "Failed"
  pipelineId: string
  updatedAt: string
  triggerSource: "Developer" | "AI Agent"
}

type BuildJob = {
  id: string
  branch: string
  storyId: string
  status: "Success" | "Running" | "Failed"
  duration: string
  triggeredBy: string
  startedAt: string
  provider: "GitHub Actions" | "GitLab CI" | "CircleCI"
}

const MOCK_REPO_CONFIG: RepoConfig = {
  url: "git@github.com:agile-agent/platform.git",
  branch: "main",
  commitTemplate: "feat(story-{id}): {title}",
  autoCommit: true,
  autoBuild: true,
}

const MOCK_STORY_STATUSES: StoryBuildStatus[] = [
  {
    id: "story-201",
    title: "Implement AI assignment audit log export",
    branch: "feature/ai-audit-export",
    commitHash: "a4f7c9d",
    status: "Running",
    pipelineId: "#9821",
    updatedAt: "2 min ago",
    triggerSource: "AI Agent",
  },
  {
    id: "story-199",
    title: "Enhance scrum board drag-and-drop analytics",
    branch: "feature/board-telemetry",
    commitHash: "c17b3a2",
    status: "Success",
    pipelineId: "#9817",
    updatedAt: "24 min ago",
    triggerSource: "Developer",
  },
  {
    id: "story-197",
    title: "Fix dark theme alignment issues on auth screens",
    branch: "hotfix/ui-contrast",
    commitHash: "f9c28bd",
    status: "Failed",
    pipelineId: "#9811",
    updatedAt: "42 min ago",
    triggerSource: "Developer",
  },
  {
    id: "story-188",
    title: "Generate onboarding FAQ article via AI",
    branch: "feature/faq-automation",
    commitHash: "b7382ab",
    status: "Pending",
    pipelineId: "#9799",
    updatedAt: "1 hr ago",
    triggerSource: "AI Agent",
  },
]

const MOCK_BUILD_JOBS: BuildJob[] = [
  {
    id: "#9821",
    branch: "feature/ai-audit-export",
    storyId: "story-201",
    status: "Running",
    duration: "03:12",
    triggeredBy: "AI Agent Delta",
    startedAt: "10:14",
    provider: "GitHub Actions",
  },
  {
    id: "#9817",
    branch: "feature/board-telemetry",
    storyId: "story-199",
    status: "Success",
    duration: "07:45",
    triggeredBy: "Jordan",
    startedAt: "09:46",
    provider: "GitLab CI",
  },
  {
    id: "#9814",
    branch: "feature/story-studio-filters",
    storyId: "story-195",
    status: "Success",
    duration: "05:38",
    triggeredBy: "Priya",
    startedAt: "09:10",
    provider: "CircleCI",
  },
  {
    id: "#9811",
    branch: "hotfix/ui-contrast",
    storyId: "story-197",
    status: "Failed",
    duration: "02:03",
    triggeredBy: "Jordan",
    startedAt: "08:51",
    provider: "GitHub Actions",
  },
]

const STATUS_STYLES: Record<
  StoryBuildStatus["status"],
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Pending: {
    label: "Pending",
    className: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    icon: History,
  },
  Running: {
    label: "Running",
    className: "border-primary/40 bg-primary/15 text-primary-foreground",
    icon: ActivitySquare,
  },
  Success: {
    label: "Passed",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
    icon: CheckCircle2,
  },
  Failed: {
    label: "Failed",
    className: "border-rose-500/40 bg-rose-500/15 text-rose-100",
    icon: ShieldAlert,
  },
}

const JOB_STATUS_STYLES: Record<
  BuildJob["status"],
  { className: string; tag: string }
> = {
  Success: {
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
    tag: "Success",
  },
  Running: {
    className: "border-primary/40 bg-primary/15 text-primary-foreground",
    tag: "Running",
  },
  Failed: {
    className: "border-rose-500/40 bg-rose-500/15 text-rose-100",
    tag: "Failed",
  },
}

export default function DeliveryConsolePage() {
  const [activeTab, setActiveTab] = useState<TabSection>("settings")
  const [config, setConfig] = useState(MOCK_REPO_CONFIG)
  const [filterStatus, setFilterStatus] = useState<BuildJob["status"] | "all">("all")
  const [providerFilter, setProviderFilter] = useState<BuildJob["provider"] | "all">("all")

  const filteredJobs = useMemo(() => {
    return MOCK_BUILD_JOBS.filter((job) => {
      const matchesStatus = filterStatus === "all" || job.status === filterStatus
      const matchesProvider = providerFilter === "all" || job.provider === providerFilter
      return matchesStatus && matchesProvider
    })
  }, [filterStatus, providerFilter])

  return (
    <main className="space-y-8 pb-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.primary/60)_theme(colors.slate.900/80)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full border border-primary/60 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
            Delivery Console
          </Badge>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Git automation & CI/CD health
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          Automate commits, monitor pipelines, and keep releases flowing
        </h1>
        <p className="max-w-4xl text-sm text-slate-300">
          Connect repositories, observe commit-to-deploy flow, and troubleshoot build issues without leaving your Agile workspace.
        </p>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabSection)}>
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-800/50 p-1">
            <TabsTrigger value="settings" className="text-xs uppercase tracking-wide">
              Git & pipeline settings
            </TabsTrigger>
            <TabsTrigger value="stories" className="text-xs uppercase tracking-wide">
              Story commit status
            </TabsTrigger>
            <TabsTrigger value="builds" className="text-xs uppercase tracking-wide">
              Build dashboard
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
                Repository & pipeline configuration
              </CardTitle>
              <CardDescription className="text-slate-300">
                Authorise Git access, map automated commit behaviour, and control which branches feed your CI/CD pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[0.65fr_0.35fr]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Repository URL</Label>
                    <Input
                      value={config.url}
                      onChange={(event) => setConfig((prev) => ({ ...prev, url: event.target.value }))}
                      placeholder="git@github.com:workspace/repo.git"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">Default branch</Label>
                    <Input
                      value={config.branch}
                      onChange={(event) => setConfig((prev) => ({ ...prev, branch: event.target.value }))}
                      placeholder="main"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-200">API token / SSH key</Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••••••"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                    <p className="text-xs text-slate-500">
                      Stored securely in the workspace secret vault. Required for automated commits and pipeline triggers.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-200">Commit message template</Label>
                    <Input
                      value={config.commitTemplate}
                      onChange={(event) =>
                        setConfig((prev) => ({ ...prev, commitTemplate: event.target.value }))
                      }
                      placeholder="feat(story-{id}): {title}"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                    <p className="text-xs text-slate-500">
                      Use placeholders like {"{id}"} and {"{title}"} to auto-link commits with stories.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="size-4 text-white" />
                      <span className="text-sm font-semibold text-white">Automation toggles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wide text-[11px] text-slate-400">Auto-commit</span>
                        <Switch
                          checked={config.autoCommit}
                          onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoCommit: checked }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wide text-[11px] text-slate-400">Auto-build</span>
                        <Switch
                          checked={config.autoBuild}
                          onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoBuild: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-400">
                    When enabled, commit-ready stories trigger automated Git commits and CI/CD pipelines across configured branches.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-inner shadow-primary/20 text-xs text-primary-foreground">
                  <p className="text-sm font-semibold text-white">Connection status</p>
                  <div className="mt-3 space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      Git repository authenticated
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      Pipeline webhook active (GitHub Actions)
                    </p>
                    <p className="flex items-center gap-2 text-amber-200">
                      <AlertTriangle className="size-4 text-white" />
                      Deployment previews paused (manual review)
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/35">
                      Test connection
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                    >
                      View validation logs
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                  <p className="text-sm font-semibold text-white">Recent automation events</p>
                  <div className="mt-3 space-y-2">
                    <p>• 10:12 — Commit a4f7c9d generated for story-201 by AI Agent Delta.</p>
                    <p>• 09:47 — Build #9817 deployed to preview (feature/board-telemetry).</p>
                    <p>• 09:05 — API token rotated by system admin.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Changes save locally — future backend integration will persist settings across sessions.</span>
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70">
                Export config JSON
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {activeTab === "stories" && (
        <section className="space-y-6">
          <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <CodeXml className="size-5 text-white" />
                Story commit & pipeline status
              </CardTitle>
              <CardDescription className="text-slate-300">
                Track how individual stories flow from commit to deployment. Trigger rebuilds or rollbacks when needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_STORY_STATUSES.map((story) => {
                const badgeMeta = STATUS_STYLES[story.status]
                const StatusIcon = badgeMeta.icon
                return (
                  <div
                    key={story.id}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{story.title}</p>
                        <p className="text-xs text-slate-400">
                          Story ID: {story.id} • Branch: {story.branch}
                        </p>
                        <p className="text-xs text-slate-500">
                          Trigger source: {story.triggerSource} • Last update {story.updatedAt}
                        </p>
                      </div>
                      <Badge className={cn("flex items-center gap-1 text-[11px]", badgeMeta.className)}>
                        <StatusIcon className="size-3 text-white" />
                        {badgeMeta.label}
                      </Badge>
                    </div>
                    <Separator className="my-3 bg-slate-800/80" />
                    <div className="grid gap-3 sm:grid-cols-[0.65fr_0.35fr]">
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3">
                          <p className="text-slate-200">Latest commit</p>
                          <p className="text-sm font-semibold text-white">#{story.commitHash}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                            >
                              <Link2 className="mr-2 size-4" />
                              View in Git
                            </Button>
                            <Button
                              variant="outline"
                              className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                            >
                              <TerminalSquare className="mr-2 size-4" />
                              View diff
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3">
                          <p className="text-slate-200">Build pipeline</p>
                          <p className="text-sm font-semibold text-white">Run {story.pipelineId}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                        >
                              <ServerCog className="mr-2 size-4" />
                              View logs
                            </Button>
                            <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                              <RefreshCcw className="mr-2 size-4" />
                              Re-run build
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3">
                          <p className="text-slate-200">Notifications</p>
                          <ul className="mt-2 space-y-1">
                            <li>• Send Slack alert on failure.</li>
                            <li>• Mention story owner when build succeeds.</li>
                            <li>• Auto-close story if deployment verified.</li>
                          </ul>
                        </div>
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-3">
                          <p className="text-slate-200">Manual actions</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              className="border border-slate-700 bg-emerald-600/80 text-white hover:bg-emerald-600"
                            >
                              <CheckCircle2 className="mr-2 size-4" />
                              Mark story complete
                            </Button>
                            <Button
                              variant="destructive"
                              className="bg-rose-600/80 text-white hover:bg-rose-600"
                            >
                              <AlertTriangle className="mr-2 size-4" />
                              Rollback
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Automation events sync in near real-time — future integrations will replace mock data.</span>
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70">
                Subscribe to pipeline alerts
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {activeTab === "builds" && (
        <section className="space-y-6">
          <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <ServerCog className="size-5 text-white" />
                Build activity dashboard
              </CardTitle>
              <CardDescription className="text-slate-300">
                Monitor the broader health of your CI/CD runs. Filter by provider, status, or branch to focus on what matters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300">
                  <p className="text-slate-400">Success rate (24h)</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-300">87%</p>
                  <p className="mt-1 text-slate-500">Trending up by 6% vs previous day.</p>
                </div>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300">
                  <p className="text-slate-400">Average duration</p>
                  <p className="mt-2 text-2xl font-semibold text-white">05:41</p>
                  <p className="mt-1 text-slate-500">Includes setup + test execution.</p>
                </div>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300">
                  <p className="text-slate-400">Open incidents</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-300">3</p>
                  <p className="mt-1 text-slate-500">Investigate failing smoke tests.</p>
                </div>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 text-xs text-slate-300">
                  <p className="text-slate-400">Latest deploy</p>
                  <p className="mt-2 text-2xl font-semibold text-white">10:22</p>
                  <p className="mt-1 text-slate-500">feature/board-telemetry → Preview.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as BuildJob["status"] | "all")}>
                  <SelectTrigger className="w-40 border-slate-800/80 bg-slate-950/70 text-slate-100">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={providerFilter}
                  onValueChange={(value) =>
                    setProviderFilter(value as BuildJob["provider"] | "all")
                  }
                >
                  <SelectTrigger className="w-44 border-slate-800/80 bg-slate-950/70 text-slate-100">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="all">All providers</SelectItem>
                    <SelectItem value="GitHub Actions">GitHub Actions</SelectItem>
                    <SelectItem value="GitLab CI">GitLab CI</SelectItem>
                    <SelectItem value="CircleCI">CircleCI</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                >
                  <History className="mr-2 size-4" />
                  Last 24h
                </Button>
                <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                  <Play className="mr-2 size-4" />
                  Trigger build
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">Build {job.id}</p>
                        <p className="text-xs text-slate-400">
                          Branch {job.branch} • Story {job.storyId}
                        </p>
                        <p className="text-xs text-slate-500">
                          Triggered by {job.triggeredBy} at {job.startedAt} via {job.provider}
                        </p>
                      </div>
                      <Badge className={cn("text-[11px]", JOB_STATUS_STYLES[job.status].className)}>
                        {JOB_STATUS_STYLES[job.status].tag}
                      </Badge>
                    </div>
                    <Separator className="my-3 bg-slate-800/80" />
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1">
                        Duration {job.duration}
                      </span>
                        <Button
                          variant="outline"
                          className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                        >
                        <TerminalSquare className="mr-2 size-4" />
                        Inspect logs
                      </Button>
                        <Button
                          variant="outline"
                          className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70"
                        >
                        <Bot className="mr-2 size-4" />
                        Open deployment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Hook into your provider webhooks to replace mock data with live build telemetry.</span>
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70">
                Download build report (CSV)
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}
    </main>
  )
}

