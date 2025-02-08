"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Meeting = {
  id: string
  title: string
  description?: string
  start_time: Date
  end_time: Date
  is_public: boolean
  is_online: boolean
  is_in_person: boolean
  location?: string
  meeting_link?: string
  color: string
  created_by: string
  created_at: string
  updated_at: string
  required_attendees: Attendee[]
  optional_attendees: Attendee[]
}

export type Attendee = {
  id: string
  display_name: string
  avatar_url: string | null
}

export type MeetingAttendee = {
  user_id: string
  is_required: boolean
}

export async function createMeeting(meeting: Omit<Meeting, "id" | "created_at" | "updated_at">) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      title: meeting.title,
      description: meeting.description,
      start_time: meeting.start_time.toISOString(),
      end_time: meeting.end_time.toISOString(),
      is_public: meeting.is_public,
      is_online: meeting.is_online,
      is_in_person: meeting.is_in_person,
      location: meeting.location,
      meeting_link: meeting.meeting_link,
      color: meeting.color,
      created_by: meeting.created_by, // Ensure this field is included
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating meeting:", error)
    return { success: false, error: "Failed to create meeting" }
  }

  // Add attendees
  const attendees = [
    ...meeting.required_attendees.map((a) => ({ meeting_id: data.id, user_id: a.id, is_required: true })),
    ...meeting.optional_attendees.map((a) => ({ meeting_id: data.id, user_id: a.id, is_required: false })),
  ]

  const { error: attendeesError } = await supabase.from("meeting_attendees").insert(attendees)

  if (attendeesError) {
    console.error("Error adding attendees:", attendeesError)
    return { success: false, error: "Failed to add attendees" }
  }

  revalidatePath("/dashboard/v/chats")
  return { success: true, data }
}

export async function updateMeeting(meeting: Meeting) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("meetings")
    .update({
      title: meeting.title,
      description: meeting.description,
      start_time: meeting.start_time.toISOString(),
      end_time: meeting.end_time.toISOString(),
      is_public: meeting.is_public,
      is_online: meeting.is_online,
      is_in_person: meeting.is_in_person,
      location: meeting.location,
      meeting_link: meeting.meeting_link,
      color: meeting.color,
    })
    .eq("id", meeting.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating meeting:", error)
    return { success: false, error: "Failed to update meeting" }
  }

  // Remove existing attendees
  await supabase.from("meeting_attendees").delete().eq("meeting_id", meeting.id)

  // Add updated attendees
  const attendees = [
    ...meeting.required_attendees.map((a) => ({ meeting_id: meeting.id, user_id: a.id, is_required: true })),
    ...meeting.optional_attendees.map((a) => ({ meeting_id: meeting.id, user_id: a.id, is_required: false })),
  ]

  const { error: attendeesError } = await supabase.from("meeting_attendees").insert(attendees)

  if (attendeesError) {
    console.error("Error updating attendees:", attendeesError)
    return { success: false, error: "Failed to update attendees" }
  }

  revalidatePath("/dashboard/v/chats")
  return { success: true, data }
}

export async function deleteMeeting(meetingId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("meetings").delete().eq("id", meetingId)

  if (error) {
    console.error("Error deleting meeting:", error)
    return { success: false, error: "Failed to delete meeting" }
  }

  revalidatePath("/dashboard/v/chats")
  return { success: true }
}

export async function fetchMeetings(userId: string) {
  const supabase = createClient()

  console.log("Fetching meetings for user:", userId)

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("created_by", userId)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching meetings:", error)
    return { success: false, error: "Failed to fetch meetings" }
  }

  console.log("Fetched meetings:", data)

  const meetings: Meeting[] = data.map((meeting) => ({
    ...meeting,
    start_time: new Date(meeting.start_time),
    end_time: new Date(meeting.end_time),
    required_attendees: [], // We'll handle attendees in a separate query if needed
    optional_attendees: [],
  }))

  return { success: true, data: meetings }
}

