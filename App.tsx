

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Message, MessageSender, Session, Source, ChatMode, ImagePart } from './types';
import { getObsidianResponse, getDynamicSuggestions } from './services/geminiService';
import { saveSessions, loadSessions } from './services/storageService';
import { checkRateLimit, recordMessage } from './services/rateLimiter';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import WelcomePage from './components/WelcomePage';
import HistorySidebar from './components/HistorySidebar';
import AboutPage from './components/AboutPage';
import ProModeModal from './components/ProModeModal';

const ACKNOWLEDGED_KEY = 'obsidian_acknowledged_welcome';
const CHAT_MODE_KEY = 'obsidian_chat_mode';
const PRO_MODAL_SHOWN_KEY = 'obsidian_pro_modal_shown';

const App: React.FC = () => {
  const [hasAcknowledgedWelcome, setHasAcknowledgedWelcome] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'welcome' | 'chat' | 'about'>('welcome');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>(() => {
    return (localStorage.getItem(CHAT_MODE_KEY) as ChatMode) || 'lite';
  });
  const [showModeTooltip, setShowModeTooltip] = useState<boolean>(false);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const stopRequestRef = useRef<boolean>(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const sessionMode = currentSession?.mode || chatMode;

  const createNewSession = useCallback((mode: ChatMode) => {
    const newSessionId = `session_${Date.now()}`;
    const newSession: Session = {
      id: newSessionId,
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [
        {
          id: Date.now(),
          sender: MessageSender.AI,
          text: "Please provide the necessary information for me to proceed with the OBSIDIAN Protocol.",
          sources: [],
        },
      ],
      mode: mode,
    };
    return newSession;
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_MODE_KEY, chatMode);
  }, [chatMode]);

  useEffect(() => {
    const acknowledged = localStorage.getItem(ACKNOWLEDGED_KEY) === 'true';
    setHasAcknowledgedWelcome(acknowledged);

    const loadedSessions = loadSessions();
    setSessions(loadedSessions);

    if (acknowledged) {
      setCurrentPage('chat');
      if (loadedSessions.length > 0) {
        const lastSession = loadedSessions[0];
        setCurrentSessionId(lastSession.id);
        setChatMode(lastSession.mode || 'lite');
      } else {
        const newSession = createNewSession(chatMode);
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    } else {
      setCurrentPage('welcome');
    }
    // This effect should only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  const handleNewChat = useCallback(() => {
    const newSession = createNewSession(chatMode);
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsLoading(false);
    setIsStopping(false);
    setError(null);
    if (isHistoryVisible) setIsHistoryVisible(false);
  }, [createNewSession, isHistoryVisible, chatMode]);

  const handleSelectSession = (id: string) => {
    if (currentSessionId === id) return;
    const selectedSession = sessions.find(s => s.id === id);
    setCurrentSessionId(id);
    setChatMode(selectedSession?.mode || 'lite');
    setError(null);
    setIsLoading(false);
    if (isHistoryVisible) setIsHistoryVisible(false);
  };

  const handleDeleteSession = (id: string) => {
    const remainingSessions = sessions.filter(s => s.id !== id);
    if (remainingSessions.length === 0) {
      const newSession = createNewSession(chatMode);
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    } else {
      setSessions(remainingSessions);
      if (currentSessionId === id) {
        const newCurrentSession = remainingSessions[0];
        setCurrentSessionId(newCurrentSession.id);
        setChatMode(newCurrentSession.mode || 'lite');
      }
    }
  };

  const handleContinue = () => {
    localStorage.setItem(ACKNOWLEDGED_KEY, 'true');
    setHasAcknowledgedWelcome(true);
    setCurrentPage('chat');
    if (sessions.length === 0) {
      handleNewChat();
    }
  };

  const handleGoHome = () => {
    localStorage.removeItem(ACKNOWLEDGED_KEY);
    setHasAcknowledgedWelcome(false);
    setCurrentPage('welcome');
  };

  const handleShowAbout = () => {
    setCurrentPage('about');
  };

  const handleCloseAbout = () => {
    setCurrentPage(hasAcknowledgedWelcome ? 'chat' : 'welcome');
  };

  const handleStopGenerating = () => {
    stopRequestRef.current = true;
    setIsLoading(false);
    setIsStopping(true);
  };

  const handleToggleMode = () => {
    const newMode = chatMode === 'lite' ? 'pro' : 'lite';
    setChatMode(newMode);

    if (newMode === 'pro' && localStorage.getItem(PRO_MODAL_SHOWN_KEY) !== 'true') {
      setShowProModal(true);
      localStorage.setItem(PRO_MODAL_SHOWN_KEY, 'true');
    }

    if (currentSessionId) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, mode: newMode } : s));
    }
  }

  const handleCloseProModal = () => {
    setShowProModal(false);
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = useCallback(async (inputText: string, imageFile?: File) => {
    const limitCheck = checkRateLimit();
    if (limitCheck.isLimited) {
      const minutes = Math.ceil(limitCheck.retryAfter / 60);
      const plural = minutes > 1 ? 's' : '';
      setError(`You have reached the message limit. Please try again in about ${minutes} minute${plural}.`);
      return;
    }

    if ((!inputText.trim() && !imageFile) || isLoading || isStopping || !currentSessionId || !currentSession || !hasAcknowledgedWelcome) return;

    recordMessage();
    stopRequestRef.current = false;
    setError(null);

    let userMessage: Message = { id: Date.now(), sender: MessageSender.User, text: inputText };

    if (imageFile) {
      try {
        const imageUrl = URL.createObjectURL(imageFile);
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
        });
        const imagePart: ImagePart = { mimeType: imageFile.type, data: base64Data };
        userMessage = { ...userMessage, imageUrl, image: imagePart };
      } catch (err) {
        console.error("Error processing image:", err);
        setError("Failed to process image file.");
        return;
      }
    }

    const isFirstUserMessageInSession = currentSession.messages.filter(m => m.sender === MessageSender.User).length === 0;
    const newTitle = isFirstUserMessageInSession ? inputText.substring(0, 40) + (inputText.length > 40 ? '...' : '') : currentSession.title;

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const aiMessagePlaceholder: Message = { id: Date.now() + 1, sender: MessageSender.AI, text: "", sources: [] };
        return { ...session, title: newTitle, messages: [...session.messages, userMessage, aiMessagePlaceholder] };
      }
      return session;
    }));

    setIsLoading(true);

    if (isFirstUserMessageInSession) {
      setShowModeTooltip(true);
      setTimeout(() => setShowModeTooltip(false), 5000); // Hide after 5 seconds
    }

    try {
      const result = await getObsidianResponse(currentSession.messages, userMessage.text, sessionMode, userMessage.image);

      if (stopRequestRef.current) {
        // Clean up placeholder if user stopped the request
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, messages: s.messages.slice(0, -1) };
          }
          return s;
        }));
        return;
      }

      let conversationForSuggestions: Message[] = [];

      // Update state with the main response. The updater function will run synchronously.
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const newMessages = [...s.messages];
          const updatedPlaceholder = {
            ...newMessages[newMessages.length - 1],
            text: result.text,
            sources: result.sources
          };
          newMessages[newMessages.length - 1] = updatedPlaceholder;
          // Capture the complete conversation to pass to the next API call.
          conversationForSuggestions = newMessages;
          return { ...s, messages: newMessages };
        }
        return s;
      }));

      // Now `conversationForSuggestions` is populated. Kick off the non-blocking suggestions request.
      getDynamicSuggestions(conversationForSuggestions)
        .then(suggestions => {
          // Check if user has navigated away or stopped
          if (suggestions.length > 0 && !stopRequestRef.current) {
            setSessions(prev => prev.map(s => {
              // We only update if the session is still the current one, to be safe.
              if (s.id === currentSessionId) {
                const messages = [...s.messages];
                if (messages.length > 0) {
                  const lastMessage = messages[messages.length - 1];
                  // Add suggestions to the last message.
                  messages[messages.length - 1] = { ...lastMessage, suggestions };
                }
                return { ...s, messages };
              }
              return s;
            }));
          }
        })
        .catch(err => {
          console.error("Could not fetch dynamic suggestions:", err);
          // Fail silently. No suggestions will be shown.
        });

    } catch (err) {
      console.error(err);
      if (!stopRequestRef.current) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(`Error: ${errorMessage}`);
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const userMessageIndex = s.messages.findIndex(m => m.id === userMessage.id);
            // Remove the user message and the AI placeholder that was added
            if (userMessageIndex !== -1) {
              return { ...s, messages: s.messages.slice(0, userMessageIndex) };
            }
          }
          return s;
        }));
      }
    } finally {
      setIsLoading(false);
      stopRequestRef.current = false;
      setIsStopping(false);
    }
  }, [isLoading, isStopping, currentSessionId, currentSession, hasAcknowledgedWelcome, sessions, sessionMode]);

  return (
    <>
      <WelcomePage onContinue={handleContinue} onLearnMore={handleShowAbout} isVisible={currentPage === 'welcome'} />
      <AboutPage onClose={handleCloseAbout} isVisible={currentPage === 'about'} />
      <ProModeModal isVisible={showProModal} onClose={handleCloseProModal} />

      <HistorySidebar
        isVisible={isHistoryVisible}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setIsHistoryVisible(false)}
      />

      <main className={`relative h-dvh font-sans transition-all duration-300 ease-in-out ${isHistoryVisible ? 'lg:pl-72' : ''}`}>
        <div className={`flex flex-col h-full text-slate-200 transition-opacity duration-1000 ease-in-out ${currentPage === 'chat' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Header
            onGoHome={handleGoHome}
            onResetChat={handleNewChat}
            onToggleHistory={() => setIsHistoryVisible(v => !v)}
            onShowAbout={handleShowAbout}
            chatMode={sessionMode}
            onToggleMode={handleToggleMode}
            showModeTooltip={showModeTooltip}
          />
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            isStopping={isStopping}
            mode={sessionMode}
            onSuggestionClick={handleSuggestionClick}
          />
          <div className="px-4 pb-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {error && <div className="text-red-400 text-center p-2 rounded-md bg-red-900/50 mb-2">{error}</div>}
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isStopping={isStopping} onStopGenerating={handleStopGenerating} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;