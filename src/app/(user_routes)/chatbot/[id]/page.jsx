"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiSend,
  FiImage,
  FiEdit3,
  FiCheck,
  FiX,
  FiTrash2,
  FiMessageSquare,
} from "react-icons/fi";
import { GiHolosphere } from "react-icons/gi";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AnimatedMarkdown from "@/components/AnimatedMarkdown";
import Image from "next/image";

const MessageSkeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
      >
        <div className="max-w-xs lg:max-w-2xl">
          <div className="flex items-start space-x-3">
            {i % 2 === 1 && (
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            )}
            <div className="space-y-2">
              <Skeleton
                className={`h-16 w-64 rounded-2xl ${
                  i % 2 === 0
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [newMessageIds, setNewMessageIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/chatbot/${chatId}`, {
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setChat(result.chat);
        setMessages(result.chat.messages || []);
        setEditTitle(result.chat.title);
      } else {
        setError(result.message || "Failed to fetch chat");
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage) || isSending) return;

    const userMessage = message.trim();
    const imageToSend = selectedImage;

    // Clear input immediately
    setMessage("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsSending(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      image_url: imagePreview,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const formData = new FormData();
      formData.append("content", userMessage);
      if (imageToSend) {
        formData.append("image", imageToSend);
      }

      const response = await fetch(`/api/chatbot/${chatId}/messages`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Replace temp message with actual messages from server
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id);
          return [...withoutTemp, result.userMessage, result.assistantMessage];
        });

        // Mark the assistant message as new for animation
        if (result.assistantMessage?.id) {
          setNewMessageIds((prev) =>
            new Set(prev).add(result.assistantMessage.id)
          );

          // Remove from new messages after animation completes
          setTimeout(() => {
            setNewMessageIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(result.assistantMessage.id);
              return newSet;
            });
          }, 3000); // Remove after 3 seconds (animation is 2.5s)
        }
      } else {
        // Remove temp message and show error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        setError(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setError("Network error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image must be smaller than 5MB");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateTitle = async () => {
    if (!editTitle.trim() || editTitle === chat.title) {
      setIsEditingTitle(false);
      setEditTitle(chat.title);
      return;
    }

    try {
      const response = await fetch(`/api/chatbot/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setChat((prev) => ({ ...prev, title: result.chat.title }));
        setIsEditingTitle(false);
      } else {
        setError(result.message || "Failed to update title");
        setEditTitle(chat.title);
      }
    } catch (error) {
      console.error("Error updating title:", error);
      setError("Network error occurred");
      setEditTitle(chat.title);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const deleteChat = async () => {
    try {
      const response = await fetch(`/api/chatbot/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push("/chatbot");
      } else {
        setError(result.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError("Network error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        {/* Header Skeleton - Fixed */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* Messages Skeleton - Scrollable with page */}
        <div className="pb-32 pt-4">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <MessageSkeleton />
          </div>
        </div>

        {/* Input Skeleton - Fixed */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chat not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This chat may have been deleted or you don't have access to it.
          </p>
          <button
            onClick={() => router.push("/chatbot")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-colors duration-200"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      <div className="border-b -translate-y-7  py-3 px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
              <FiMessageSquare className="text-white text-2xl" />
            </div>

            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded-lg border-0 focus:ring-2 focus:ring-green-500 outline-none"
                    onKeyPress={(e) => e.key === "Enter" && updateTitle()}
                    autoFocus
                  />
                  <button
                    onClick={updateTitle}
                    className="text-green-600 hover:text-green-700 p-1"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitle(chat.title);
                    }}
                    className="text-gray-500 hover:text-gray-600 p-1"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 group">
                  <h1 className="font-semibold text-gray-900 dark:text-white">
                    {chat.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                    title="Edit title"
                  >
                    <FiEdit3 className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
                title="Delete chat"
              >
                <FiTrash2 className="text-lg" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chat? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteChat}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-[73px] z-10 bg-red-100 dark:bg-red-900/20 border-b border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 text-center"
        >
          {error}
          <button
            onClick={() => setError("")}
            className="ml-4 text-red-600 hover:text-red-700"
          >
            ✕
          </button>
        </motion.div>
      )}

      <div className="pb-32 pt-4">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="  rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <GiHolosphere className=" w-20 h-20 text-green-400 drop-shadow-[0_5px_15px_rgba(34,197,94,0.5)] -rotate-45 " />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Start chatting with agroverse bot!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Ask me anything about farming, crops, soil health, pest control,
                livestock, or agricultural practices.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl ${
                      msg.role === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {msg.role === "assistant" && (
                        <div className=" translate-y-4 translate-x-1 rounded-full flex-shrink-0">
                          <GiHolosphere className=" w-8.5 h-8.5 text-green-400 drop-shadow-[0_5px_15px_rgba(34,197,94,0.5)]  -rotate-45" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div
                          className={`px-4 py-3  ${
                            msg.role === "user"
                              ? msg.image_url
                                ? "bg-green-500 text-white rounded-2xl"
                                : "bg-green-500 text-white rounded-full"
                              : "bg-white dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {msg.image_url && (
                            <div className="mb-3 rounded-2xl">
                              <Image
                                src={msg.image_url}
                                alt="Uploaded image"
                                width={300}
                                height={200}
                                className="max-w-full h-auto "
                              />
                            </div>
                          )}
                          {msg.role === "user" ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <AnimatedMarkdown isNew={newMessageIds.has(msg.id)}>
                              {msg.content}
                            </AnimatedMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="  rounded-full flex-shrink-0">
                  <GiHolosphere className=" w-8.5 h-8.5 text-green-400 drop-shadow-[0_5px_15px_rgba(34,197,94,0.5)] -rotate-45 " />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 relative inline-block"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-32 max-h-32 rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200"
              >
                ✕
              </button>
            </motion.div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex-1 relative backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-full border border-white/20 dark:border-gray-700/30 shadow-lg">
              <div className="flex items-end">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 -translate-y-0.5 translate-x-1 bg-blue-200/70 hover:text-green-600 dark:hover:text-green-400 p-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-200/50 transition-all duration-200 flex-shrink-0"
                  title="Upload image"
                >
                  <FiImage className="text-xl " />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me about farming, crops, soil, pests, or any agricultural topic..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white px-3 py-3 resize-none focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[48px] max-h-32"
                  rows={1}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isSending}
                />

                <button
                  onClick={sendMessage}
                  disabled={(!message.trim() && !selectedImage) || isSending}
                  className="bg-gradient-to-r -translate-y-0.5 from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex-shrink-0 mr-1"
                >
                  <FiSend className="text-xl " />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
