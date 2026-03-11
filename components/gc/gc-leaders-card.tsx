import { Users, Phone, Mail, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { LeaderBrief, LeaderContactResponse } from '@/types'

interface GcLeadersCardProps {
  leaders: LeaderBrief[]
}

function contactIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'phone':
      return <Phone className="size-4" />
    case 'email':
      return <Mail className="size-4" />
    case 'whatsapp':
      return <MessageCircle className="size-4" />
    default:
      return <Phone className="size-4" />
  }
}

function contactHref(contact: LeaderContactResponse): string {
  switch (contact.type.toLowerCase()) {
    case 'phone':
      return `tel:${contact.value}`
    case 'email':
      return `mailto:${contact.value}`
    case 'whatsapp':
      return `https://wa.me/${contact.value.replace(/\D/g, '')}`
    default:
      return '#'
  }
}

export function GcLeadersCard({ leaders }: GcLeadersCardProps) {
  if (leaders.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Users className="size-5 text-primary" />
          Líderes
        </h2>

        <div className="space-y-4">
          {leaders.map((leader) => (
            <div key={leader.id} className="rounded-lg bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-medium">{leader.name}</span>
              </div>

              {leader.contacts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {leader.contacts.map((contact) => (
                    <a
                      key={contact.id}
                      href={contactHref(contact)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {contactIcon(contact.type)}
                      <span>{contact.label ?? contact.value}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
