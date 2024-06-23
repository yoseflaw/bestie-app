import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"

interface MessageProps {
    role: string;
    content: string;
    compImageUrl: string;
    userImageUrl: string;
  }

export default function ChatMessage({ role, content, compImageUrl, userImageUrl }: MessageProps) {

    if (role === 'user') {
      return (
        <div className="flex items-start gap-4 justify-end">
          <div className="grid gap-1">
            <div className="rounded-lg bg-blue-500 p-3 text-sm text-white">
              <p>{ content }</p>
            </div>
            {/* <div className="text-xs text-gray-500 dark:text-gray-400">3:46 PM</div> */}
          </div>
          <Avatar className="h-8 w-8 border">
            <AvatarImage alt="Avatar" src={userImageUrl} />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      )
    }
    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8 border">
          <AvatarImage alt="Avatar" src={compImageUrl} />
          <AvatarFallback>CO</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-500 dark:text-gray-50">
            <p>
              { content }
            </p>
          </div>
          {/* <div className="text-xs text-gray-500 dark:text-gray-400">3:45 PM</div> */}
        </div>
      </div>
    )
  }