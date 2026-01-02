"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"

export default function AnimatedMarkdown({ children, isNew = false }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Preprocess the text to fix numbered list formatting
  const preprocessText = (text) => {
    if (!text) return ""
    
    // Fix numbered lists that have line breaks after the number
    return text.replace(/(\d+)\.\s*\n\s*/g, '$1. ')
  }
  
  const text = preprocessText(children || "")
  const animationDuration = 2500 // 2.5 seconds
  const intervalDuration = animationDuration / text.length

  useEffect(() => {
    if (isNew && text) {
      setDisplayedText("")
      setCurrentIndex(0)
      
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = prevIndex + 1
          setDisplayedText(text.slice(0, newIndex))
          
          if (newIndex >= text.length) {
            clearInterval(timer)
          }
          
          return newIndex
        })
      }, intervalDuration)

      return () => clearInterval(timer)
    } else {
      setDisplayedText(text)
    }
  }, [text, isNew, intervalDuration])

  const markdownComponents = {
    // Custom styling for different elements
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-green-500 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2 mt-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-2">
        {children}
      </h4>
    ),
    p: ({ children, node }) => {
      // Check if this paragraph is inside a list item
      const isInListItem = node?.parent?.type === 'listItem';
      
      if (isInListItem) {
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {children}
          </span>
        );
      }
      
      return (
        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {children}
        </p>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-green-700 dark:text-green-400">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-600 dark:text-gray-400">
        {children}
      </em>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 text-gray-700 dark:text-gray-300 space-y-0">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ml-2 mb-0 inline-block w-full">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-3 bg-green-50 dark:bg-green-900/20 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    code: ({ children, inline }) => 
      inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-green-700 dark:text-green-400">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-3 overflow-x-auto">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
            {children}
          </code>
        </pre>
      ),
    hr: () => (
      <hr className="border-t-2 border-green-200 dark:border-green-700 my-4" />
    ),
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
      >
        {children}
      </a>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="prose prose-green max-w-none dark:prose-invert"
    >
      <ReactMarkdown components={markdownComponents}>
        {displayedText}
      </ReactMarkdown>
      {isNew && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-2 h-4 bg-green-500 ml-1"
        />
      )}
    </motion.div>
  )
}
