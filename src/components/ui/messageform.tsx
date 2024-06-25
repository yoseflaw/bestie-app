import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import { ChatRequestOptions } from "ai";

interface MessageFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
}

export default function MessageForm({ input, isLoading, handleInputChange, handleSubmit }: MessageFormProps) {

    const customSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSubmit(event);
    };
  
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event as unknown as React.SyntheticEvent<HTMLFormElement>);
      }
    };
  
    return (
      <form onSubmit={customSubmit}>
        <div className="flex relative gap-2">
          <Textarea
            value={input}
            className="min-h-[48px] w-full rounded-2xl resize-none border border-gray-200 bg-gray-100 p-3 pr-16 text-sm shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-gray-600 dark:border-gray-800"
            id="message"
            name="message"
            placeholder="Apa ni yang lagi happening?"
            rows={1}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button className="absolute top-1/2 right-3 transform -translate-y-1/2 w-8 h-8" size="icon" type="submit">
            <ArrowUpIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    )
  }

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    )
  }
  

