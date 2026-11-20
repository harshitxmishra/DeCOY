"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { MatchProfile } from "../types";
import { getSharedInterests, generateIcebreakers } from "../icebreakers";

interface ChatMessage {
  id: string;
  matchId: string;
  sender: "user" | "match";
  text: string;
  timestamp: string;
}

interface MatchChatModalProps {
  match: MatchProfile;
  onClose: () => void;
  onUnmatch?: (profileId: string) => void;
}

export function MatchChatModal({ match, onClose, onUnmatch }: MatchChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shared = getSharedInterests(match.interests);
  const icebreakers = generateIcebreakers(match);
  const firstName = match.name.split(" ")[0] || match.name;

  // Load chat messages on mount
  useEffect(() => {
    fetch(`/api/messages?matchId=${match.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  }, [match.id]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setSending(true);
    setInputText("");

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      matchId: match.id,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, text }),
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        if (data.autoReply) {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempUserMsg.id),
            data.userMsg,
            data.autoReply,
          ]);
        }
      }, 1200);
    } catch {
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Back"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-pink-300">
              <Image src={match.photo} alt={match.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">{match.name}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active now" />
              </div>
              <span className="text-xs text-gray-400">{match.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUnmatch && (
              <button
                onClick={() => onUnmatch(match.id)}
                className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Unmatch"
              >
                Unmatch
              </button>
            )}
            <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline">Esc</kbd>
          </div>
        </div>

        {/* Shared Interest Banner */}
        {shared.length > 0 && (
          <div className="flex items-center gap-2 border-b border-pink-50 bg-pink-50/60 px-4 py-1.5 text-xs">
            <span className="text-pink-600 font-bold">✨ Common:</span>
            <div className="flex flex-wrap gap-1">
              {shared.map((item) => (
                <span key={item} className="rounded-full bg-white px-2 py-0.2 text-[10px] font-semibold text-pink-700 shadow-2xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="my-auto py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">You matched with {firstName}!</p>
              <p className="mt-1 text-xs text-gray-400">Say hi or tap an icebreaker prompt below.</p>

              {/* Quick Icebreaker Starter Pills */}
              <div className="mt-4 space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tap to send icebreaker:</span>
                {icebreakers.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.replace(/"/g, ""))}
                    className="block w-full rounded-xl border border-pink-100 bg-white p-2.5 text-left text-xs font-medium text-gray-700 shadow-2xs hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-xs"
                          : "bg-gray-100 text-gray-800 rounded-tl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-xs bg-gray-100 px-3.5 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-gray-100 bg-white p-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${firstName}...`}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs sm:text-sm focus:border-pink-500 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-40"
              aria-label="Send message"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
