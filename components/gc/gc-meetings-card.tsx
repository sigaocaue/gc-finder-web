import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { GcMeetingResponse } from '@/types'

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

interface GcMeetingsCardProps {
  meetings: GcMeetingResponse[]
}

export function GcMeetingsCard({ meetings }: GcMeetingsCardProps) {
  if (meetings.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Clock className="size-5 text-primary" />
          Horários de encontro
        </h2>

        <div className="space-y-3">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
            >
              <span className="font-medium">{WEEKDAYS[meeting.weekday]}</span>
              <span className="text-sm text-muted-foreground">{meeting.start_time}</span>
            </div>
          ))}
        </div>

        {meetings.some((m) => m.notes) && (
          <div className="mt-3 space-y-1">
            {meetings
              .filter((m) => m.notes)
              .map((m) => (
                <p key={m.id} className="text-xs text-muted-foreground">
                  {m.notes}
                </p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
