"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Edit, Trash2, Video, MapPin, UserPlus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  isSameHour,
  parse,
  differenceInMinutes,
  addMinutes,
  setHours,
  setMinutes,
  isAfter,
} from "date-fns"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { rectIntersection } from "@dnd-kit/core"
import { searchUserProfiles, type UserProfile } from "../actions/users"
import { toast } from "@/components/ui/use-toast"
import {
  createMeeting,
  updateMeeting,
  deleteMeeting,
  fetchMeetings,
  type Meeting,
  type Attendee,
} from "../actions/meetings"

type CalendarView = "month" | "week"

const colorOptions = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Yellow", value: "bg-yellow-500" },
  { name: "Purple", value: "bg-purple-500" },
]

const WeekView = ({
  date,
  events,
  onEventClick,
  onEventDrop,
}: {
  date: Date
  events: Meeting[]
  onEventClick: (event: Meeting) => void
  onEventDrop: (event: Meeting, newDate: Date) => void
}) => {
  const weekStart = startOfWeek(date)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = eachHourOfInterval({ start: startOfDay(date), end: endOfDay(date) })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    setActiveId(null)
    const { active, over } = event
    if (active && over) {
      const draggedEvent = events.find((e) => e.id.toString() === active.id)
      if (draggedEvent) {
        const [day, hour, minute] = over.id.split(":").map(Number)
        const newDate = setMinutes(setHours(addDays(weekStart, day), hour), minute)
        onEventDrop(draggedEvent, newDate)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex h-full overflow-auto">
        <div className="w-16 flex-shrink-0 border-r">
          <div className="sticky top-0 h-10 bg-background z-10 border-b"></div>
          {hours.map((hour) => (
            <div
              key={hour.toISOString()}
              className="h-12 border-b text-xs text-muted-foreground flex items-center justify-center"
            >
              {format(hour, "ha")}
            </div>
          ))}
        </div>
        <div className="flex-grow grid grid-cols-7">
          {weekDays.map((day) => (
            <div key={day.toISOString()}>
              {hours.map((hour) => (
                <Droppable
                  key={`${day.toISOString()}-${hour.getHours()}:${hour.getMinutes()}`}
                  id={`${day.getDate()}:${hour.getHours()}:${hour.getMinutes()}`}
                >
                  <div className="h-12 border-b border-r border-dotted relative">
                    {events
                      .filter(
                        (event) =>
                          isSameDay(new Date(event.start_time), day) && isSameHour(new Date(event.start_time), hour),
                      )
                      .map((event) => (
                        <Draggable key={event.id} id={event.id}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute left-1 right-1 ${event.color} text-white rounded p-1 text-xs overflow-hidden cursor-move draggable-event flex items-center justify-between`}
                                  style={{
                                    top: `${(new Date(event.start_time).getMinutes() / 60) * 100}%`,
                                    height: `${(differenceInMinutes(new Date(event.end_time), new Date(event.start_time)) / 60) * 100}%`,
                                  }}
                                  onClick={() => onEventClick(event)}
                                >
                                  <span>{event.title}</span>
                                  {event.is_in_person && <MapPin className="h-3 w-3 ml-1" />}
                                  {event.is_online && <Video className="h-3 w-3 ml-1" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{event.title}</p>
                                <p>Date: {format(new Date(event.start_time), "PPP")}</p>
                                <p>Start: {format(new Date(event.start_time), "p")}</p>
                                <p>End: {format(new Date(event.end_time), "p")}</p>
                                <p>
                                  Duration:{" "}
                                  {`${Math.floor(differenceInMinutes(new Date(event.end_time), new Date(event.start_time)) / 60)}h ${
                                    differenceInMinutes(new Date(event.end_time), new Date(event.start_time)) % 60
                                  }m`}
                                </p>
                                {event.is_in_person && <p>Location: {event.location}</p>}
                                {event.is_online && <p>Online Meeting</p>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Draggable>
                      ))}
                  </div>
                </Droppable>
              ))}
            </div>
          ))}
        </div>
      </div>
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeId ? (
          <div className="draggable-event bg-primary text-primary-foreground rounded p-1 text-xs">
            {events.find((e) => e.id.toString() === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

const MonthView = ({
  date,
  events,
  onDateClick,
  onEventClick,
  onEventDrop,
}: {
  date: Date
  events: Meeting[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Meeting) => void
  onEventDrop: (event: Meeting, newDate: Date) => void
}) => {
  const monthStart = startOfMonth(date)
  const startDate = startOfWeek(monthStart)
  const endDate = addDays(startDate, 41) // 6 weeks * 7 days - 1

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    setActiveId(null)
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const draggedEvent = events.find((e) => e.id.toString() === active.id)
      if (draggedEvent) {
        const newDate = new Date(over.id)
        const timeDiff = differenceInMinutes(draggedEvent.end_time, draggedEvent.start_time)
        const updatedEvent: Meeting = {
          ...draggedEvent,
          start_time: setMinutes(
            setHours(newDate, draggedEvent.start_time.getHours()),
            draggedEvent.start_time.getMinutes(),
          ),
          end_time: addMinutes(
            setMinutes(setHours(newDate, draggedEvent.start_time.getHours()), draggedEvent.start_time.getMinutes()),
            timeDiff,
          ),
        }
        onEventDrop(updatedEvent, updatedEvent.start_time)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-2 h-full">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <Droppable key={day.toISOString()} id={day.toISOString()}>
            <Card
              key={day.toISOString()}
              data-droppable-id={day.toISOString()}
              className={`${
                !isSameMonth(day, date) ? "opacity-50" : ""
              } cursor-pointer hover:bg-accent h-full flex flex-col`}
              onClick={() => onDateClick(day)}
            >
              <CardContent className="p-2 flex-grow flex flex-col">
                <div
                  className={`text-sm ${
                    isSameDay(day, new Date())
                      ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="flex-grow overflow-y-auto mt-1">
                  {events
                    .filter((event) => isSameDay(new Date(event.start_time), day))
                    .map((event) => (
                      <Draggable key={event.id} id={event.id}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`text-xs mb-1 truncate ${event.color} text-white rounded p-1 cursor-move draggable-event flex items-center justify-between`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEventClick(event)
                                }}
                              >
                                <span>{event.title}</span>
                                {event.is_in_person && <MapPin className="h-3 w-3 ml-1" />}
                                {event.is_online && <Video className="h-3 w-3 ml-1" />}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{event.title}</p>
                              <p>Date: {format(new Date(event.start_time), "PPP")}</p>
                              <p>Start: {format(new Date(event.start_time), "p")}</p>
                              <p>End: {format(new Date(event.end_time), "p")}</p>
                              <p>
                                Duration:{" "}
                                {`${Math.floor(differenceInMinutes(new Date(event.end_time), new Date(event.start_time)) / 60)}h ${
                                  differenceInMinutes(new Date(event.end_time), new Date(event.start_time)) % 60
                                }m`}
                              </p>
                              {event.is_in_person && <p>Location: {event.location}</p>}
                              {event.is_online && <p>Online Meeting</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Draggable>
                    ))}
                </div>
              </CardContent>
            </Card>
          </Droppable>
        ))}
      </div>
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeId ? (
          <div className="draggable-event bg-primary text-primary-foreground rounded p-1 text-xs">
            {events.find((e) => e.id.toString() === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

const Draggable = ({ children, id }: { children: ReactNode; id: number | string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id.toString(),
  })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

const Droppable = ({ children, id }: { children: ReactNode; id: string }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return <div ref={setNodeRef}>{children}</div>
}

const EventDetailsDialog = ({
  event,
  isOpen,
  onClose,
  onJoinMeeting,
  onEditMeeting,
}: {
  event: Meeting | null
  isOpen: boolean
  onClose: () => void
  onJoinMeeting: (meetingLink: string) => void
  onEditMeeting: (event: Meeting) => void
}) => {
  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <div className="col-span-3">{format(new Date(event.start_time), "PPP")}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Time</Label>
            <div className="col-span-3">
              {format(new Date(event.start_time), "p")} - {format(new Date(event.end_time), "p")}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Visibility</Label>
            <div className="col-span-3">{event.is_public ? "Public" : "Private"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Required Attendees</Label>
            <div className="col-span-3">
              {event.required_attendees.map((attendee) => attendee.display_name).join(", ")}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Optional Attendees</Label>
            <div className="col-span-3">
              {event.optional_attendees.map((attendee) => attendee.display_name).join(", ")}
            </div>
          </div>
          {event.is_in_person && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Location</Label>
              <div className="col-span-3">{event.location}</div>
            </div>
          )}
          {event.is_online && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Meeting Link</Label>
              <div className="col-span-3">
                <Button onClick={() => onJoinMeeting(event.meeting_link || "")}>Join Meeting</Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onEditMeeting(event)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MeetingsPage({ userId }: { userId: string }) {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [events, setEvents] = useState<Meeting[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Meeting>({
    id: "",
    title: "",
    description: "",
    start_time: new Date(),
    end_time: new Date(),
    is_public: true,
    is_online: false,
    is_in_person: false,
    color: "bg-blue-500",
    created_by: userId, // Update: Set created_by to userId
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    required_attendees: [],
    optional_attendees: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Meeting | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isAddingRequired, setIsAddingRequired] = useState(true)

  useEffect(() => {
    loadMeetings()
  }, []) // Update: Removed userId from the dependency array

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchUserProfiles(searchTerm).then(setSearchResults)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const loadMeetings = async () => {
    console.log("Loading meetings for user:", userId) // Add this line
    const result = await fetchMeetings(userId)
    if (result.success && result.data) {
      console.log("Meetings loaded successfully:", result.data) // Add this line
      setEvents(result.data)
    } else {
      console.error("Error loading meetings:", result.error) // Add this line
      toast({ title: "Error loading meetings", description: result.error, variant: "destructive" })
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setDate(direction === "prev" ? subMonths(date, 1) : addMonths(date, 1))
  }

  const handleDateClick = (day: Date) => {
    const currentHour = new Date().getHours()
    const startDate = setHours(day, currentHour + 1)
    const endDate = setHours(day, currentHour + 2)
    setNewEvent({
      ...newEvent,
      start_time: startDate,
      end_time: endDate,
    })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleEventClick = (event: Meeting) => {
    setSelectedEvent(event)
    setIsEventDetailsOpen(true)
  }

  const handleCreateOrUpdateEvent = async () => {
    if (newEvent.title && newEvent.start_time && newEvent.end_time) {
      const result = isEditing
        ? await updateMeeting(newEvent)
        : await createMeeting({
            ...newEvent,
            created_by: userId, // Ensure this line is present and correct
          })

      if (result.success) {
        toast({ title: `Meeting ${isEditing ? "updated" : "created"} successfully!` })
        setIsDialogOpen(false)
        loadMeetings()
      } else {
        toast({
          title: `Failed to ${isEditing ? "update" : "create"} meeting`,
          description: result.error,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteEvent = async () => {
    if (newEvent.id) {
      const result = await deleteMeeting(newEvent.id)
      if (result.success) {
        toast({ title: "Meeting deleted successfully!" })
        setIsDialogOpen(false)
        loadMeetings()
      } else {
        toast({ title: "Failed to delete meeting", description: result.error, variant: "destructive" })
      }
    }
  }

  const handleEventDrop = async (event: Meeting, newDate: Date) => {
    const timeDiff = differenceInMinutes(event.end_time, event.start_time)
    const updatedEvent = {
      ...event,
      start_time: newDate,
      end_time: addMinutes(newDate, timeDiff),
    }
    const result = await updateMeeting(updatedEvent)
    if (result.success) {
      toast({ title: "Meeting updated successfully!" })
      loadMeetings()
    } else {
      toast({ title: "Failed to update meeting", description: result.error, variant: "destructive" })
    }
  }

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, "_blank")
  }

  const handleEditMeeting = (event: Meeting) => {
    setNewEvent(event)
    setIsEditing(true)
    setIsEventDetailsOpen(false)
    setIsDialogOpen(true)
  }

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4)
    const minute = (i % 4) * 15
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  })

  const calculateDuration = () => {
    const durationInMinutes = differenceInMinutes(newEvent.end_time, newEvent.start_time)
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const isEndTimeValid = (time: string) => {
    const endTime = parse(`${format(newEvent.start_time, "yyyy-MM-dd")} ${time}`, "yyyy-MM-dd HH:mm", new Date())
    return isAfter(endTime, newEvent.start_time)
  }

  const addAttendee = (user: UserProfile) => {
    const attendee: Attendee = {
      id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    }

    const isAlreadyAdded =
      newEvent.required_attendees.some((a) => a.id === user.id) ||
      newEvent.optional_attendees.some((a) => a.id === user.id)

    if (isAlreadyAdded) {
      toast({
        title: "Attendee already added",
        description: `${user.display_name} is already in the attendee list.`,
        variant: "destructive",
      })
      return
    }

    if (isAddingRequired) {
      setNewEvent({
        ...newEvent,
        required_attendees: [...newEvent.required_attendees, attendee],
      })
    } else {
      setNewEvent({
        ...newEvent,
        optional_attendees: [...newEvent.optional_attendees, attendee],
      })
    }
    setSearchTerm("")
    setSearchResults([])
  }

  const removeAttendee = (attendee: Attendee, isRequired: boolean) => {
    if (isRequired) {
      setNewEvent({
        ...newEvent,
        required_attendees: newEvent.required_attendees.filter((a) => a.id !== attendee.id),
      })
    } else {
      setNewEvent({
        ...newEvent,
        optional_attendees: newEvent.optional_attendees.filter((a) => a.id !== attendee.id),
      })
    }
  }

  console.log("Current events in MeetingsPage:", events) // Add this line before the return statement

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold">{format(date, "MMMM yyyy")}</div>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {view === "month" ? (
          <MonthView
            date={date}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          />
        ) : (
          <WeekView date={date} events={events} onEventClick={handleEventClick} onEventDrop={handleEventDrop} />
        )}
      </div>
      <EventDetailsDialog
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={() => setIsEventDetailsOpen(false)}
        onJoinMeeting={handleJoinMeeting}
        onEditMeeting={handleEditMeeting}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Meeting" : "Create New Meeting"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !newEvent.start_time && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEvent.start_time ? format(newEvent.start_time, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEvent.start_time}
                    onSelect={(date) => date && setNewEvent({ ...newEvent, start_time: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Select
                value={format(newEvent.start_time, "HH:mm")}
                onValueChange={(value) =>
                  setNewEvent({
                    ...newEvent,
                    start_time: parse(
                      `${format(newEvent.start_time, "yyyy-MM-dd")} ${value}`,
                      "yyyy-MM-dd HH:mm",
                      new Date(),
                    ),
                  })
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Select
                value={format(newEvent.end_time, "HH:mm")}
                onValueChange={(value) =>
                  setNewEvent({
                    ...newEvent,
                    end_time: parse(
                      `${format(newEvent.start_time, "yyyy-MM-dd")} ${value}`,
                      "yyyy-MM-dd HH:mm",
                      new Date(),
                    ),
                  })
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time} disabled={!isEndTimeValid(time)}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${color.value}`}></div>
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Location</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newEvent.is_in_person}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_in_person: checked })}
                  />
                  <Label>In Person</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newEvent.is_online}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_online: checked })}
                  />
                  <Label>Online</Label>
                </div>
              </div>
            </div>
            {newEvent.is_in_person && (
              <div className="grid grid-cols4 itemscenter gap-4">
                <Label htmlFor="location" className="text-right">
                  Address
                </Label>
                <Input
                  id="location"
                  value={newEvent.location || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter address"
                />
              </div>
            )}
            {newEvent.is_online && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meetingLink" className="text-right">
                  Meeting Link
                </Label>
                <Input
                  id="meetingLink"
                  value={newEvent.meeting_link || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, meeting_link: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter meeting link"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Visibility</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Label>Private</Label>
                <Switch
                  checked={newEvent.is_public}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_public: checked })}
                />
                <Label>Public</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Attendees</Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Button variant={isAddingRequired ? "default" : "outline"} onClick={() => setIsAddingRequired(true)}>
                    Required
                  </Button>
                  <Button
                    variant={!isAddingRequired ? "default" : "outline"}
                    onClick={() => setIsAddingRequired(false)}
                  >
                    Optional
                  </Button>
                </div>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <ScrollArea className="h-[100px] mt-2">
                    {searchResults.map((user) => {
                      const isAlreadyAdded =
                        newEvent.required_attendees.some((a) => a.id === user.id) ||
                        newEvent.optional_attendees.some((a) => a.id === user.id)
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{user.display_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => addAttendee(user)} disabled={isAlreadyAdded}>
                            {isAlreadyAdded ? "Added" : "Add"}
                          </Button>
                        </div>
                      )
                    })}
                  </ScrollArea>
                )}
                <div className="mt-2">
                  <Label>Required Attendees</Label>
                  {newEvent.required_attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={attendee.avatar_url || undefined} />
                          <AvatarFallback>{attendee.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{attendee.display_name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeAttendee(attendee, true)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Label>Optional Attendees</Label>
                  {newEvent.optional_attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={attendee.avatar_url || undefined} />
                          <AvatarFallback>{attendee.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{attendee.display_name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeAttendee(attendee, false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Duration</Label>
              <div className="col-span-3">{calculateDuration()}</div>
            </div>
          </div>
          <DialogFooter>
            {isEditing && (
              <Button variant="destructive" onClick={handleDeleteEvent}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button onClick={handleCreateOrUpdateEvent}>
              {isEditing ? (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Meeting
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

