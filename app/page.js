'use client'
import { useState, useRef, useEffect } from "react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const foodBgPattern = `
  data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e0e8f0' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E
`;

const darkFoodBgPattern = `
  data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23304030' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E
`;

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:`Hi! I'm your allergy-free recipe assistant. How can I help you find a delicious and safe recipe today?` 
  }]);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setMessage('');
    setMessages((prevMessages) => [
      ...prevMessages,
      {role:'user', content: message},
      {role:'assistant' , content:''},
    ]);

    const response = fetch('api/chat', {
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role:'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({done, value}){
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array, {stream: true});
        setMessages((messages) => {
          let lastMessage = messages[messages.length-1];
          let otherMessages = messages.slice(0, messages.length-1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            }, 
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div 
      className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-blue-150'}`} 
      style={{
        backgroundImage: darkMode 
          ? `linear-gradient(90deg, rgba(1,8,22,1) 0%, rgba(70,79,142,1) 49%, rgba(174,154,195,1) 100%)` 
          : `linear-gradient(90deg, rgba(142,180,254,1) 0%, rgba(162,254,255,1) 41%, rgba(255,255,139,1) 100%)`
      }}
    >
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-blue-300'} text-white p-4 flex justify-between items-center`}>
        <h1 className="text-2xl font-bold">SafeBites Assistant</h1>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <span>Welcome, {user.firstName}!</span>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Sign In
                </button>
              </SignInButton>
              {/* <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Sign Up
                </button>
              </SignUpButton> */}
            </>
          )}
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {isSignedIn ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 h-[70vh] flex flex-col`}>
            <div className="flex-grow overflow-auto mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-2`}>
                  <div className={`rounded-lg p-2 max-w-[80%] ${
                    message.role === 'assistant' 
                      ? (darkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-800')
                      : (darkMode ? 'bg-gray-600 text-blue-300' : 'bg-purple-100 text-blue-800')
                  }`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex space-x-2">
              <input
                className={`flex-grow p-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                    : 'bg-blue-50 text-gray-900 placeholder-gray-500 border-blue-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder='Ask about allergy-free recipes'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage}
                className={`${
                  darkMode 
                    ? 'bg-blue-400 hover:bg-blue-600' 
                    : 'bg-blue-400 hover:bg-blue-600'
                } text-white font-bold py-2 px-4 rounded`}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Welcome to SafeBites</h2>
              <p className="mb-8 text-gray-700 dark:text-gray-300">
                Your personalized, allergy-free recipe assistant.
              </p>
              <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        )}
      </main>

      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-blue-300'} text-white p-4 text-center`}>
        <p>&copy; 2024 SafeBites. All rights reserved.</p>
      </footer>
    </div>
  );
}
