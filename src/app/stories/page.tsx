"use client"

import { useMemo, useState } from "react"
import {
  ArchiveRestore,
  ClipboardList,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type StoryType = "UI" | "Backend" | "Bot-automatable"
type StoryStatus = "To Do" | "In Progress" | "Done"

type Story = {
  id: string
  title: string
  description: string
  points: number
  type: StoryType
  sprint: string | null
  status: StoryStatus
  tags: string[]
}

const MOCK_STORIES: Story[] = [
  {
    id: "story-1",
    title: "Enable social login for new users",
    description:
      "Extend authentication to support Google OAuth, storing OAuth tokens and linking with existing profiles.",
    points: 5,
    type: "Backend",
    sprint: "Sprint 08",
    status: "In Progress",
    tags: ["auth", "priority-high"],
  },
  {
    id: "story-2",
    title: "Surface AI story suggestions",
    description:
      "Render parsed AI stories in a dashboard with approve/flag controls and inline tags.",
    points: 3,
    type: "UI",
    sprint: "Sprint 08",
    status: "To Do",
    tags: ["ux", "ai"],
  },
  {
    id: "story-3",
    title: "Automate regression checklist",
    description:
      "Bot agent executes smoke test suite after every merge and reports failures to Slack.",
    points: 8,
    type: "Bot-automatable",
    sprint: null,
    status: "To Do",
    tags: ["automation", "devops"],
  },
]

const STORY_TEMPLATES = [
  {
    title: "Authentication story",
    description: "Pre-fill acceptance criteria for auth flows (OTP, SSO, MFA).",
  },
  { title: "Dashboard enhancement", description: "Template for UI dashboards with filters." },
  {
    title: "Automation agent task",
    description: "Kick-start bot-ready stories with guardrails and rollback steps.",
  },
]

const SPRINTS = ["Sprint 07", "Sprint 08", "Sprint 09"]

const STATUSES: StoryStatus[] = ["To Do", "In Progress", "Done"]

export default function StoryStudioPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "detail" | "create" | "sprint">("dashboard")
  const [selectedStoryId, setSelectedStoryId] = useState<string>(MOCK_STORIES[0]?.id ?? "")
  const [filterType, setFilterType] = useState<string>("all")

  const filteredStories = useMemo(() => {
    if (filterType === "all") return MOCK_STORIES
    return MOCK_STORIES.filter((story) => story.type.toLowerCase() === filterType)
  }, [filterType])

  const selectedStory = MOCK_STORIES.find((story) => story.id === selectedStoryId) ?? MOCK_STORIES[0]

  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge className="rounded-full border border-primary/50 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
            Story Studio
          </Badge>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Story generation & management
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          Manage AI-generated stories, refine details, and plan sprints
        </h1>
        <p className="max-w-4xl text-sm text-slate-300">
          Use the Story Studio to curate story drafts, add new work items, and plan sprint allocation.
          Each section maps to a key activity—reviewing story lists, editing granular details, authoring
          new stories, and assigning work to upcoming sprints.
        </p>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as typeof activeTab)
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-800/50 p-1">
            <TabsTrigger value="dashboard">Story dashboard</TabsTrigger>
            <TabsTrigger value="detail">Story detail</TabsTrigger>
            <TabsTrigger value="create">Create story</TabsTrigger>
            <TabsTrigger value="sprint">Sprint planning</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {activeTab === "dashboard" && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <ClipboardList className="size-5 text-white" />
              Story list & dashboard
            </CardTitle>
            <CardDescription className="text-slate-300">
              Review AI-generated stories, search, filter, and execute bulk actions. Preview details or
              drill into individual stories to refine content.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                <Search className="size-4 text-white" />
                <Input
                  placeholder="Search title, tags, or description..."
                  className="border-none bg-transparent p-0 text-xs text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                <Filter className="size-4 text-white" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-none bg-transparent p-0 text-white focus:ring-0">
                    <SelectValue placeholder="Story type" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="bot-automatable">Bot-automatable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                  Bulk assign
                </Button>
                <Button className="border border-primary/50 bg-primary/70 text-white hover:bg-primary">
                  Export selected
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredStories.map((story) => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedStoryId(story.id)
                  setActiveTab("detail")
                }}
                className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-left shadow-inner shadow-slate-950/40 transition hover:border-primary/40 hover:bg-slate-900/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{story.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{story.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <Badge className="border border-slate-700 bg-slate-950/70 text-slate-100">
                      {story.type}
                    </Badge>
                    <Badge className="border border-primary/40 bg-primary/20 text-primary-foreground">
                      {story.points} pts
                    </Badge>
                    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-slate-200">
                      {story.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Showing {filteredStories.length} of {MOCK_STORIES.length} stories</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900">
                Previous
              </Button>
              <Button className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 hover:bg-slate-900">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {activeTab === "detail" && selectedStory && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="text-white">Story detail & edit</CardTitle>
            <CardDescription className="text-slate-300">
              Refine story attributes, collaborate with teammates, and keep the story ready for sprint
              commitment.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>
                Story ID: <strong className="text-white">{selectedStory.id}</strong>
              </span>
              <span>•</span>
              <span>
                Current status:{" "}
                <strong className="text-primary">{selectedStory.status}</strong>
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[0.65fr_0.35fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-200">
                    Title
                  </Label>
                  <Input
                    id="title"
                    defaultValue={selectedStory.title}
                    className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-200">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    rows={4}
                    defaultValue={selectedStory.description}
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Acceptance criteria</Label>
                  <div className="space-y-2 text-xs text-slate-300">
                    <Input
                      defaultValue="OAuth callback returns user profile on success"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                    <Input
                      defaultValue="Account linking prompts when email already exists"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                    <Button
                      variant="outline"
                      className="border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
                    >
                      + Add criterion
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300">
                <div className="space-y-2">
                  <Label className="text-slate-200">Story points</Label>
                  <Input
                    type="number"
                    defaultValue={selectedStory.points}
                    className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Story type</Label>
                  <Select defaultValue={selectedStory.type.toLowerCase()}>
                    <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      <SelectItem value="ui">UI</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="bot-automatable">Bot-automatable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Tags</Label>
                  <Input
                    defaultValue={selectedStory.tags.join(", ")}
                    className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Attachments</Label>
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 p-3 text-center text-xs text-slate-400">
                    Drag & drop supporting docs or <span className="text-primary">browse</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Collaborative notes</Label>
                  <textarea
                    rows={3}
                    placeholder="Leave comments for the team..."
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                Duplicate story
              </Button>
              <Button variant="destructive" className="bg-rose-600/80 hover:bg-rose-600">
                Delete story
              </Button>
            </div>
            <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
              Save changes
            </Button>
          </CardFooter>
        </Card>
      )}

      {activeTab === "create" && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <PlusCircle className="size-5 text-white" />
              Story creation
            </CardTitle>
            <CardDescription className="text-slate-300">
              Manually add new user stories using guided inputs and AI-assisted suggestions for
              acceptance criteria or story points.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Story title</Label>
                <Input
                  placeholder="As a user, I want to..."
                  className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Detailed description</Label>
                <textarea
                  rows={4}
                  placeholder="Provide context, user value, and constraints..."
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Acceptance criteria</Label>
                <textarea
                  rows={3}
                  placeholder="Given/When/Then ..."
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-slate-200">Story points</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Story type</Label>
                  <Select defaultValue="ui">
                    <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      <SelectItem value="ui">UI</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="bot-automatable">Bot-automatable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Sprint (optional)</Label>
                  <Select defaultValue="none">
                    <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      <SelectItem value="none">Unassigned</SelectItem>
                      {SPRINTS.map((sprint) => (
                        <SelectItem key={sprint} value={sprint}>
                          {sprint}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-white">AI-assisted suggestions</p>
              </div>
              <p>
                Use a pre-built template or let the AI draft acceptance criteria. Adjust before saving
                to maintain clarity.
              </p>
              <Separator className="bg-slate-800/80" />
              <div className="space-y-3">
                {STORY_TEMPLATES.map((template) => (
                  <button
                    key={template.title}
                    className="w-full rounded-lg border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-left text-xs transition hover:border-primary/40 hover:bg-slate-900/80"
                  >
                    <p className="font-medium text-slate-200">{template.title}</p>
                    <p className="text-slate-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>All mandatory fields must be populated before saving.</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                Reset form
              </Button>
              <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                Save story
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {activeTab === "sprint" && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <ArchiveRestore className="size-5 text-white" />
              Sprint assignment & tracking
            </CardTitle>
            <CardDescription className="text-slate-300">
              Drag stories into upcoming sprints or update statuses to reflect delivery progress.
              Visual indicators help teams track burn-down and blockers.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>
                Active sprints:{" "}
                <strong className="text-white">{SPRINTS.join(", ")}</strong>
              </span>
              <span>•</span>
              <span>Story capacity per sprint: <strong className="text-white">20 pts</strong></span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {SPRINTS.map((sprint) => (
              <div
                key={sprint}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{sprint}</p>
                  <Badge className="border border-primary/40 bg-primary/15 text-primary-foreground">
                    {MOCK_STORIES.filter((story) => story.sprint === sprint).reduce(
                      (total, story) => total + story.points,
                      0
                    )}{" "}
                    pts
                  </Badge>
                </div>
                <div className="space-y-2">
                  {MOCK_STORIES.filter((story) => story.sprint === sprint).map((story) => (
                    <div
                      key={`${sprint}-${story.id}`}
                      className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3"
                    >
                      <p className="text-slate-100">{story.title}</p>
                      <p className="text-slate-400">
                        {story.points} pts • {story.type}
                      </p>
                    </div>
                  ))}
                  {MOCK_STORIES.every((story) => story.sprint !== sprint) ? (
                    <p className="rounded-lg border border-dashed border-slate-800/70 bg-slate-900/70 p-3 text-center text-slate-500">
                      No stories assigned yet. Drag stories here.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300">
              <p className="text-sm font-semibold text-white">Unassigned stories</p>
              {MOCK_STORIES.filter((story) => !story.sprint).map((story) => (
                <div
                  key={`unassigned-${story.id}`}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3"
                >
                  <p className="text-slate-100">{story.title}</p>
                  <p className="text-slate-400">
                    {story.points} pts • {story.type}
                  </p>
                </div>
              ))}
              {MOCK_STORIES.filter((story) => !story.sprint).length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-800/70 bg-slate-900/70 p-3 text-center text-slate-500">
                  All stories are assigned.
                </p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Track sprint burndown by syncing story statuses in realtime with the scrum board.
            </span>
            <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
              View scrum board
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

