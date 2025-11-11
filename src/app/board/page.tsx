"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  Archive,
  BarChart4,
  CalendarClock,
  Filter,
  MessageSquarePlus,
  Search,
  TimerReset,
  Users,
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

type BoardStage = "board" | "planning" | "status"
type StoryStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done"

type BoardStory = {
  id: string
  title: string
  description: string
  points: number
  assignee: string
  status: StoryStatus
  sprint: string
  tags: string[]
  type: "UI" | "Backend" | "Automation" | "QA"
  blocked?: boolean
  overdue?: boolean
}

const BOARD_COLUMNS: { status: StoryStatus; description: string }[] = [
  { status: "Backlog", description: "Ideas ready to be groomed or scheduled." },
  { status: "To Do", description: "Committed items ready for execution." },
  { status: "In Progress", description: "Stories actively being worked on." },
  { status: "Review", description: "Ready for QA or peer review." },
  { status: "Done", description: "Completed stories awaiting release notes." },
]

const MOCK_BOARD_STORIES: BoardStory[] = [
  {
    id: "story-10",
    title: "Implement OAuth callback handler",
    description: "Handle auth callbacks and persist tokens securely.",
    points: 5,
    assignee: "Jordan",
    status: "In Progress",
    sprint: "Sprint 08",
    tags: ["Backend", "Auth"],
    type: "Backend",
  },
  {
    id: "story-11",
    title: "Design AI suggestion cards",
    description: "Create responsive cards for AI-generated story drafts.",
    points: 3,
    assignee: "Priya",
    status: "Review",
    sprint: "Sprint 08",
    tags: ["UI", "UX"],
    type: "UI",
  },
  {
    id: "story-12",
    title: "Configure bot environment for smoke tests",
    description: "Provision containerized environment for automated checks.",
    points: 8,
    assignee: "Bot-Agent",
    status: "To Do",
    sprint: "Sprint 08",
    tags: ["Automation", "CI"],
    type: "Automation",
    blocked: true,
  },
  {
    id: "story-13",
    title: "Build sprint summary widget",
    description: "Expose sprint stats (points, chart) on the dashboard.",
    points: 5,
    assignee: "Lina",
    status: "Backlog",
    sprint: "Sprint 09",
    tags: ["UI"],
    type: "UI",
  },
  {
    id: "story-14",
    title: "QA manual regression",
    description: "Validate login, story creation, and AI suggestions.",
    points: 3,
    assignee: "Marco",
    status: "Review",
    sprint: "Sprint 08",
    tags: ["QA"],
    type: "QA",
    overdue: true,
  },
  {
    id: "story-15",
    title: "Release notes automation",
    description: "Auto-generate release notes from completed stories.",
    points: 2,
    assignee: "Jordan",
    status: "Done",
    sprint: "Sprint 07",
    tags: ["Automation"],
    type: "Automation",
  },
]

const SPRINTS = ["Sprint 07", "Sprint 08", "Sprint 09", "Backlog"]

const WORKLOG_ENTRIES = [
  {
    id: "log-1",
    storyId: "story-10",
    timestamp: "Today • 10:25",
    author: "Jordan",
    activity: "Moved to In Progress",
  },
  {
    id: "log-2",
    storyId: "story-11",
    timestamp: "Today • 09:50",
    author: "Priya",
    activity: "Requested design review (UI tweaks)",
  },
  {
    id: "log-3",
    storyId: "story-12",
    timestamp: "Yesterday • 18:10",
    author: "Bot-Agent",
    activity: "Marked as blocked (missing environment secrets)",
  },
]

export default function ScrumBoardPage() {
  const [activeStage, setActiveStage] = useState<BoardStage>("board")
  const [selectedSprint, setSelectedSprint] = useState("Sprint 08")
  const [stories, setStories] = useState<BoardStory[]>(MOCK_BOARD_STORIES)
  const [selectedStoryId, setSelectedStoryId] = useState<string>(MOCK_BOARD_STORIES[0]?.id ?? "")
  const [filterStatus, setFilterStatus] = useState<StoryStatus | "all">("all")
  const [filterAssignee, setFilterAssignee] = useState("all")
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<StoryStatus | null>(null)

  const uniqueAssignees = useMemo(
    () => [...new Set(stories.map((story) => story.assignee))],
    [stories]
  )

  const storiesForBoard = useMemo(() => {
    return stories.filter((story) => {
      const matchesSprint = story.sprint === selectedSprint || (selectedSprint === "Backlog" && story.status === "Backlog")
      const matchesStatus = filterStatus === "all" || story.status === filterStatus
      const matchesAssignee =
        filterAssignee === "all" || story.assignee.toLowerCase() === filterAssignee

      return matchesSprint && matchesStatus && matchesAssignee
    })
  }, [stories, selectedSprint, filterStatus, filterAssignee])

  const storiesInSelectedSprint = useMemo(
    () => stories.filter((story) => story.sprint === selectedSprint),
    [stories, selectedSprint]
  )

  const burndownData = useMemo(
    () => ({
      committed: 38,
      completed: 21,
      remaining: 17,
      todayVelocity: 5,
    }),
    []
  )

  const activeStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId),
    [stories, selectedStoryId]
  )

  const handleCardDragStart = (event: React.DragEvent<HTMLButtonElement>, storyId: string) => {
    event.dataTransfer.setData("application/story-id", storyId)
    event.dataTransfer.effectAllowed = "move"
    setDraggedStoryId(storyId)
  }

  const handleCardDragEnd = () => {
    setDraggedStoryId(null)
    setDragOverStatus(null)
  }

  const handleColumnDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    status: StoryStatus
  ) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setDragOverStatus(status)
  }

  const handleColumnDrop = (event: React.DragEvent<HTMLDivElement>, status: StoryStatus) => {
    event.preventDefault()
    const storyId =
      event.dataTransfer.getData("application/story-id") ||
      event.dataTransfer.getData("text/plain") ||
      draggedStoryId

    if (!storyId) {
      setDragOverStatus(null)
      return
    }

    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? {
              ...story,
              status,
            }
          : story
      )
    )

    setDraggedStoryId(null)
    setDragOverStatus(null)
  }

  return (
    <main className="space-y-8 pb-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.primary/60)_theme(colors.slate.900/80)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full border border-primary/60 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
            Scrum Board
          </Badge>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Sprint tracking & collaboration
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          Visualize work, plan capacity, and keep the team aligned in real time
        </h1>
        <p className="max-w-4xl text-sm text-slate-300">
          Use the Scrum Board to manage story flow, monitor sprint health, and collaborate on
          execution. Navigate between the Kanban board, sprint planning tools, and quick status
          updates to cover every step of your Agile cadence.
        </p>

        <Tabs
          value={activeStage}
          onValueChange={(value) =>
            setActiveStage(value as BoardStage)
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-800/50 p-1">
            <TabsTrigger value="board">Scrum board</TabsTrigger>
            <TabsTrigger value="planning">Sprint planning</TabsTrigger>
            <TabsTrigger value="status">Status updates</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {activeStage === "board" && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="size-5 text-white" />
              Scrum board (Kanban)
            </CardTitle>
            <CardDescription className="text-slate-300">
              Drag and drop stories across workflow states, view assignees, and act on flagged items
              without leaving the board.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                <Search className="size-4 text-white" />
                <Input
                  placeholder="Search title or tag..."
                  className="border-none bg-transparent p-0 text-xs text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                <Filter className="size-4 text-white" />
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as StoryStatus | "all")}>
                  <SelectTrigger className="border-none bg-transparent p-0 text-white focus:ring-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="all">All statuses</SelectItem>
                    {BOARD_COLUMNS.map((column) => (
                      <SelectItem key={column.status} value={column.status}>
                        {column.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                <SelectTrigger className="rounded-xl border border-slate-800/70 bg-slate-950/60 text-xs text-white focus:ring-primary/50">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                  {SPRINTS.map((sprint) => (
                    <SelectItem key={sprint} value={sprint}>
                      {sprint}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="rounded-xl border border-slate-800/70 bg-slate-950/60 text-xs text-white focus:ring-primary/50">
                  <SelectValue placeholder="Filter assignee" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                  <SelectItem value="all">All members</SelectItem>
                  {uniqueAssignees.map((assignee) => {
                    const value = assignee.toLowerCase()
                    return (
                      <SelectItem key={value} value={value}>
                        {assignee}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:theme(colors.primary/60)_theme(colors.slate.800/70)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60">
            <div className="flex min-w-full gap-4">
              {BOARD_COLUMNS.map((column) => {
                const stories = storiesForBoard.filter((story) => story.status === column.status)
                return (
                  <div
                    key={column.status}
                    onDragOver={(event) => handleColumnDragOver(event, column.status)}
                    onDragEnter={() => setDragOverStatus(column.status)}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setDragOverStatus(null)
                      }
                    }}
                    onDrop={(event) => handleColumnDrop(event, column.status)}
                    className={cn(
                      "flex min-w-[240px] flex-1 flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40 transition",
                      dragOverStatus === column.status && "border-primary/50 bg-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{column.status}</p>
                        <p className="text-xs text-slate-400">{column.description}</p>
                      </div>
                      <Badge className="border border-slate-700 bg-slate-900/80 text-slate-100">
                        {stories.length}
                      </Badge>
                    </div>
                    <Separator className="bg-slate-800/80" />
                    <div className="flex flex-col gap-3">
                      {stories.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-800/70 bg-slate-900/60 p-3 text-center text-xs text-slate-500">
                          No stories yet
                        </div>
                      ) : null}
                      {stories.map((story) => (
                        <button
                          key={story.id}
                          draggable
                          onDragStart={(event) => handleCardDragStart(event, story.id)}
                          onDragEnd={handleCardDragEnd}
                          onClick={() => {
                            setSelectedStoryId(story.id)
                            setActiveStage("status")
                          }}
                          className={cn(
                            "rounded-xl border border-slate-800/70 bg-slate-900/70 p-3 text-left text-xs transition hover:border-primary/40",
                            story.blocked && "border-amber-500/40 bg-amber-500/10",
                            story.overdue && "border-rose-500/40 bg-rose-500/10"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-100 line-clamp-2">{story.title}</p>
                            <Badge className="border border-primary/40 bg-primary/15 text-primary-foreground">
                              {story.points} pts
                            </Badge>
                          </div>
                          <p className="mt-1 text-slate-400">
                            {story.assignee} • {story.tags.join(", ")}
                          </p>
                          {(story.blocked || story.overdue) && (
                            <p className="mt-2 text-xs text-amber-300">
                              {story.blocked ? "Blocked: awaiting environment setup." : "Overdue: review needed."}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Drag cards to update status instantly — teammates will see the changes in real time.
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                Collapse columns
              </Button>
              <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                Bulk move
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {activeStage === "planning" && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarClock className="size-5 text-white" />
              Sprint planning & management
            </CardTitle>
            <CardDescription className="text-slate-300">
              Group stories into sprints, track velocity, and adjust commitments based on team
              capacity.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 shadow-inner">
                <p className="text-slate-400">Sprint start</p>
                <p className="text-lg font-semibold text-white">Mar 03</p>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 shadow-inner">
                <p className="text-slate-400">Sprint end</p>
                <p className="text-lg font-semibold text-white">Mar 16</p>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 shadow-inner">
                <p className="text-slate-400">Committed</p>
                <p className="text-lg font-semibold text-white">{burndownData.committed} pts</p>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 shadow-inner">
                <p className="text-slate-400">Completed</p>
                <p className="text-lg font-semibold text-white">{burndownData.completed} pts</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Sprint burndown</p>
                <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                  Export chart
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-end gap-2">
                  <div className="h-24 w-full rounded-lg bg-gradient-to-t from-primary/70 to-primary/20 shadow-inner shadow-primary/30" />
                  <div className="h-14 w-full rounded-lg bg-gradient-to-t from-emerald-500/60 to-emerald-500/10 shadow-inner shadow-emerald-500/30" />
                  <div className="h-20 w-full rounded-lg bg-gradient-to-t from-slate-700/60 to-slate-700/10 shadow-inner shadow-slate-700/20" />
                  <div className="h-10 w-full rounded-lg bg-gradient-to-t from-slate-700/60 to-slate-700/10 shadow-inner shadow-slate-700/20" />
                  <div className="h-8 w-full rounded-lg bg-gradient-to-t from-slate-700/60 to-slate-700/10 shadow-inner shadow-slate-700/20" />
                  <div className="h-12 w-full rounded-lg bg-gradient-to-t from-rose-500/50 to-rose-500/10 shadow-inner shadow-rose-500/20" />
                </div>
                <div className="space-y-2 rounded-xl border border-slate-800/70 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-2 w-4 rounded-full bg-primary" />
                    Planned velocity: {burndownData.committed} pts
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-2 w-4 rounded-full bg-emerald-500" />
                    Completed so far: {burndownData.completed} pts
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-2 w-4 rounded-full bg-rose-500" />
                    Remaining: {burndownData.remaining} pts
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-2 w-4 rounded-full bg-white" />
                    Today&apos;s velocity: {burndownData.todayVelocity} pts
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
              <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Assign stories to sprint</p>
                  <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                    Repeat sprint template
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {storiesInSelectedSprint
                    .map((story) => (
                      <div
                        key={`planning-${story.id}`}
                        className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-3"
                      >
                        <p className="text-slate-100">{story.title}</p>
                        <p className="text-slate-400">{story.assignee} • {story.points} pts</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <p className="text-sm font-semibold text-white">Sprint actions</p>
                <Button className="border border-primary/40 bg-primary/70 text-white hover:bg-primary">
                  Start sprint
                </Button>
                <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                  Archive completed sprint
                </Button>
                <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                  Notify team
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Capacity planning tools help balance workload across teams.</span>
            <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
              View team availability
            </Button>
          </CardFooter>
        </Card>
      )}

      {activeStage === "status" && activeStory && (
        <Card className="border border-slate-800/70 bg-slate-900/80 shadow-lg shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="size-5 text-white" />
              Story status & activity
            </CardTitle>
            <CardDescription className="text-slate-300">
              Quick edit status, log work, add comments, and review audit history without leaving the board.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40">
                <p className="text-sm font-semibold text-white">{activeStory.title}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {activeStory.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <Badge className="border border-primary/40 bg-primary/15 text-primary-foreground">
                    {activeStory.points} pts
                  </Badge>
                  <Badge className="border border-slate-700 bg-slate-950/70 text-slate-100">
                    {activeStory.type}
                  </Badge>
                  <Badge className="border border-slate-700 bg-slate-950/70 text-slate-100">
                    Assigned to {activeStory.assignee}
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Update status & log work
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-slate-200">Status</Label>
                    <Select defaultValue={activeStory.status}>
                      <SelectTrigger className="border-slate-800/80 bg-slate-950/70 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                        {BOARD_COLUMNS.map((column) => (
                          <SelectItem key={column.status} value={column.status}>
                            {column.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-200">Log work (optional)</Label>
                    <Input
                      placeholder="e.g. 2h pair programming"
                      className="border-slate-800/80 bg-slate-950/70 text-slate-100 focus-visible:ring-primary/60"
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-slate-200">Comment</Label>
                  <textarea
                    rows={3}
                    placeholder="Share status updates, blockers, or next steps..."
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                    <MessageSquarePlus className="mr-2 size-4" />
                    Add comment
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Activity timeline
                </p>
                <div className="mt-2 space-y-2 text-xs text-slate-300">
                  {WORKLOG_ENTRIES.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
                      <p className="text-slate-200">{entry.activity}</p>
                      <p className="text-slate-400">
                        {entry.timestamp} by {entry.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-300 shadow-inner shadow-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Quick actions
                </p>
                <div className="mt-3 grid gap-2">
                  <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                    @mention teammate
                  </Button>
                  <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                    Upload attachment
                  </Button>
                  <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
                    View audit log
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>All updates are synced instantly. Archives remain searchable for future audits.</span>
            <Button variant="outline" className="border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900">
              Archive story
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

