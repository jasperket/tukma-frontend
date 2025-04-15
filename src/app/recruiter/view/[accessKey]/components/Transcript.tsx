import { useEffect, useRef, useState } from "react";
import { getMessages, Message } from "~/app/actions/interview";
import { User } from "~/app/actions/recruiter";

const Transcript: React.FC<{
  user: User;
}> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const name = user.firstName + " " + user.lastName;

  useEffect(() => {
    const accessKey = window.location.href.split("/").pop();
    const storageKey = `chat-${accessKey}-${user.username}`;

    const storedMessages = localStorage.getItem(storageKey);
    if (storedMessages) {
      setMessages((JSON.parse(storedMessages)) as Message[]);
      setLoading(false);
    }

    async function fetch() {
      const messagesRes = await getMessages(
        accessKey!,
        name,
        user.username,
      );

      if (messagesRes.success) {
        const data = messagesRes.data?.messages.splice(1);
        setMessages(data);
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        setError(true);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <>
      <div className="w-full rounded-xl bg-white p-6 md:p-8">
        <h1 className="mb-6 text-2xl font-bold text-[#3c3c3c] md:text-3xl">
          Interview
        </h1>

        <div className="mb-8 rounded-lg bg-[#f8f7f4] md:p-8">
          {/* Conversation Area */}
          <div
            className="mb-6 max-h-[350px] min-h-[350] space-y-6 overflow-y-auto scroll-smooth pr-2"
            ref={chatContainerRef}
            style={{ scrollBehavior: "smooth" }}
          >
            {!loading &&
              messages?.map((message) => (
                <MessageBubble key={message.id} role={message.role}>
                  {message.content}
                </MessageBubble>
              ))}
            {error && (
              <p className="text-red-500">
                An error occured, please refresh the page
              </p>
            )}
            {loading && <SystemThinking>Loading</SystemThinking>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Transcript;

const SystemThinking: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <div className="flex items-start">
        <div className="max-w-[80%] rounded-lg bg-[#e6e2d9] p-3 text-[#3c3c3c]">
          <div className="flex items-center">
            <span className="mr-2">{children}</span>
            <span className="flex space-x-1">
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const MessageBubble: React.FC<{
  children: React.ReactNode;
  role: string;
}> = ({ children, role }) => {
  function getStyleContainer(role: string) {
    if (role === "system") {
      return "flex items-start";
    }
    return "flex items-start justify-end";
  }

  function getStyleInner(role: string) {
    if (role === "system") {
      return "bg-[#e6e2d9] text-[#3c3c3c] rounded-lg p-3 max-w-[80%]";
    }
    return "bg-[#8b5d3f] text-white rounded-lg p-3 max-w-[80%]";
  }

  return (
    <>
      <div className={getStyleContainer(role)}>
        <div className={getStyleInner(role)}>
          <p>{children}</p>
        </div>
      </div>
    </>
  );
};
