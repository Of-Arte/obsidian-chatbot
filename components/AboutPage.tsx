
import React from 'react';
import CloseIcon from './icons/CloseIcon';
import ObsidianLogo from './icons/ObsidianLogo';

interface AboutPageProps {
    onClose: () => void;
    isVisible: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ onClose, isVisible }) => {
    return (
        <div className={`fixed inset-0 z-20 font-sans transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <header
                className="absolute top-0 left-0 right-0 z-10 bg-slate-900/70 backdrop-blur-lg border-b border-cyan-400/20 flex items-center justify-between"
                style={{
                    paddingTop: 'calc(0.5rem + env(safe-area-inset-top))',
                    paddingBottom: '0.5rem',
                    paddingLeft: '1.5rem',
                    paddingRight: '1rem'
                }}
            >
                <h2 className="text-lg font-semibold text-cyan-300 tracking-wider">ABOUT Obsidian</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
            </header>

            <div
                className="h-full overflow-y-auto"
                style={{
                    paddingTop: 'calc(4.5rem + env(safe-area-inset-top))',
                    paddingBottom: '2rem'
                }}
            >
                <div className="w-full max-w-3xl mx-auto px-4">
                    <div className="group flex justify-start">
                        <div className="flex items-start gap-3 w-full">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-cyan-500/50 mt-1">
                                <ObsidianLogo className="w-6 h-6" />
                            </div>
                            <div className="relative bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 sm:p-6 rounded-2xl rounded-bl-none shadow-lg w-full">
                                <div className="text-sm sm:text-base text-slate-300 space-y-4">
                                    <p>
                                        Obsidian is a personal AI chat interface built on top of the Gemini API. It uses a custom system prompt to shape the model's tone and output style, with session history, a Pro mode toggle, and a rate limiter layered on top.
                                    </p>

                                    <div className="pt-3 border-t border-slate-700">
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">What it is:</h3>
                                        <ul className="list-disc list-inside space-y-2 pl-2 text-slate-400">
                                            <li>A UI wrapper around the Gemini API, not a custom-trained model.</li>
                                            <li>Session history is stored locally in your browser and is not synced anywhere.</li>
                                            <li>Pro mode changes the system prompt to ask for more verbose, structured responses.</li>
                                        </ul>
                                    </div>

                                    <div className="pt-3 border-t border-slate-700">
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Limitations:</h3>
                                        <ul className="list-disc list-inside space-y-2 pl-2 text-slate-400">
                                            <li>No access to real-time data, news, or external APIs.</li>
                                            <li>All outputs reflect Gemini's training data cutoff and inherent model limitations.</li>
                                            <li>Nothing here constitutes financial or professional advice.</li>
                                        </ul>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <button
                            onClick={onClose}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                        >
                            Return to Interface
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
