"use client";
import { useEffect, useState } from "react";
import QAModal from "./QAModal";
import Image from "next/image";
import { Tooltip } from "react-tooltip";
import { getCompanions } from "./actions";

interface ExampleProps {
  userId: string;
  userImageUrl: string;
}

export default function Examples({userId, userImageUrl}: ExampleProps) {
  const [QAModalOpen, setQAModalOpen] = useState(false);
  const [CompParam, setCompParam] = useState({
    name: "",
    title: "",
    imageUrl: "",
    chatHistory: []
  });
  const [examples, setExamples] = useState([
    {
      name: "",
      title: "",
      imageUrl: "",
      llm: "",
      chatHistory: []
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const companions = await getCompanions();
        // let entries = JSON.parse(companions);
        const entries = await getCompanions(userId);
        let setme = entries.map((entry: any) => ({
          name: entry.name,
          title: entry.title,
          imageUrl: entry.imageUrl,
          llm: entry.llm,
          chatHistory: entry.chatHistory
        }));
        setExamples(setme);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div id="ExampleDiv">
      <QAModal
        open={QAModalOpen}
        setOpen={setQAModalOpen}
        example={CompParam}
        userId={userId}
        userImageUrl={userImageUrl}
      />
      <ul
        role="list"
        className="mt-14 m-auto max-w-3xl grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {examples.map((example, i) => (
          <li
            key={example.name}
            onClick={() => {
              if (example.name.length > 0) {
                setCompParam(example);
                setQAModalOpen(true);
              }
            }}
            className="col-span-2 flex flex-col rounded-lg bg-slate-800  text-center shadow relative ring-1 ring-white/10 cursor-pointer hover:ring-sky-300/70 transition"
          >
            <div className="absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-sky-300/0 via-sky-300/70 to-sky-300/0"></div>
            <div className="flex flex-1 flex-col p-8">
              <Image
                width={0}
                height={0}
                sizes="100vw"
                className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
                src={example.imageUrl === ""? "/placeholder-user.jpg": example.imageUrl}
                alt=""
              />
              <h3 className="mt-6 text-sm font-medium text-white">
                {example.name === ""? "Memuat teman-teman baru...": example.name}
              </h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dt className="sr-only"></dt>
                <dd className="text-sm text-slate-400">
                  {example.title}
                </dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}