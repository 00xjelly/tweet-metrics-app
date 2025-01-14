import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'

interface ActivityItem {
  id: string
  user: {
    name: string
    handle: string
    avatar: string
  }
  type: 'like' | 'retweet' | 'reply'
  timestamp: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    user: {
      name: "Sarah Wilson",
      handle: "@sarahw",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    type: "like",
    timestamp: "2m ago",
  },
  {
    id: "2",
    user: {
      name: "John Doe",
      handle: "@johndoe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    type: "retweet",
    timestamp: "5m ago",
  },
  {
    id: "3",
    user: {
      name: "Amy Smith",
      handle: "@amysmith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    type: "reply",
    timestamp: "10m ago",
  },
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-rose-500" />
    case 'retweet':
      return <Repeat2 className="h-4 w-4 text-emerald-500" />
    case 'reply':
      return <MessageCircle className="h-4 w-4 text-blue-500" />
  }
}

export function ActivityList() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>
              {activity.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}
              <span className="text-muted-foreground"> {activity.user.handle}</span>
            </p>
            <div className="flex items-center gap-1">
              {getActivityIcon(activity.type)}
              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}