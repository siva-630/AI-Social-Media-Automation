import React, { useState } from 'react';
import { History, ArrowRight, X, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { dummyGenerationData, PLATFORMS } from '../assets/assets';

const TONES = ['Professional', 'Creative', 'Funny', 'Minimalist', 'Excited'];

interface GenerationPost {
    _id: string;
    prompt: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    tone: string;
    createdAt: string;
    updatedAt?: string;
    user?: string;
}

const AIComposer = () => {
    const [idea, setIdea] = useState('');
    const [aiImage, setAiImage] = useState(true);
    const [selectedTone, setSelectedTone] = useState('Professional');
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal state
    const [selectedPost, setSelectedPost] = useState<GenerationPost | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleErrors, setScheduleErrors] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsGenerating(true);
        try {
            // Simulate parsing data and sending to backend asynchronously
            const payload = { idea, tone: selectedTone, useAiImage: aiImage };
            console.log("Generating with payload:", payload);
            
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setIdea('');
        } catch (error) {
            console.error("Failed to generate:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    };

    const openScheduleModal = (post: GenerationPost) => {
        setSelectedPost(post);
        setSelectedPlatforms([]);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleErrors([]);
    };

    const handleSchedule = async () => {
        const errors: string[] = [];
        if (selectedPlatforms.length === 0) errors.push('Channels');
        if (!scheduleDate) errors.push('Date');
        if (!scheduleTime) errors.push('Time');

        if (errors.length > 0) {
            setScheduleErrors(errors);
            return;
        }

        setIsScheduling(true);
        try {
            // Simulate sending parsed structured data to the backend asynchronously
            const payload = {
                postId: selectedPost?._id,
                platforms: selectedPlatforms,
                scheduledFor: `${scheduleDate}T${scheduleTime}:00Z`
            };
            console.log("Scheduling payload to backend:", payload);

            await new Promise((resolve) => setTimeout(resolve, 1500));

            alert('Post scheduled successfully!');
            setSelectedPost(null);
            setScheduleErrors([]);
        } catch (error) {
            console.error("Failed to schedule:", error);
        } finally {
            setIsScheduling(false);
        }
    };

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => {
            const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
            if (next.length > 0) setScheduleErrors(e => e.filter(err => err !== 'Channels'));
            return next;
        });
    };

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 min-h-screen pb-20">
            {/* Header */}
            <div className="text-center my-10">
                <h1 className="text-[2rem] md:text-[2.25rem] font-medium text-[#1e293b]">What should we create today?</h1>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-[1rem] border border-gray-200 shadow-sm p-4 mb-6">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Share your idea... (e.g. A post about the launch of our new eco-friendly coffee beans)"
                    className="w-full h-24 bg-transparent resize-none outline-none text-slate-700 placeholder-slate-400 text-[15px] mb-4 p-2 focus:ring-0"
                />
                <div className="flex justify-end items-center gap-4">
                    {/* AI Image Toggle */}
                    <div className="flex items-center gap-3 bg-indigo-50/80 px-4 py-2 rounded-[0.8rem]">
                        <span className="text-[13px] font-semibold text-slate-800">AI Image</span>
                        <button 
                            onClick={() => setAiImage(!aiImage)}
                            className={`w-10 h-[22px] rounded-full transition-colors relative shadow-inner ${aiImage ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${aiImage ? 'left-[20px]' : 'left-[2px]'}`}></div>
                        </button>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !idea.trim()}
                        className={`bg-indigo-600 text-white px-6 py-2.5 rounded-[0.8rem] font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200
                            ${(isGenerating || !idea.trim()) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                Generate
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tones */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
                {TONES.map(tone => (
                    <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border
                            ${selectedTone === tone 
                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200' 
                                : 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50 hover:text-indigo-600'}`}
                    >
                        {tone}
                    </button>
                ))}
            </div>

            {/* Recent Generations */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                        <History className="w-5 h-5" />
                        <h2 className="text-xl font-medium">Recent Generations</h2>
                    </div>
                    <span className="text-slate-500 font-medium text-sm">{dummyGenerationData.length} total</span>
                </div>

                {dummyGenerationData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dummyGenerationData.map((post, index) => {
                            const isHighlighted = index === 0 || index === 2;
                            return (
                                <div key={post._id} className={`bg-white rounded-[1.25rem] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col h-full border ${isHighlighted ? 'border-indigo-100' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[13px] text-slate-400 font-medium">{formatDate(post.createdAt)}</span>
                                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-md">
                                        {post.tone}
                                    </span>
                                </div>
                                
                                <p className={`text-slate-700 text-[14px] leading-[1.6] mb-4 ${post.mediaUrl ? 'line-clamp-3' : 'line-clamp-6'}`}>
                                    {post.content}
                                </p>

                                {post.mediaUrl && (
                                    <div className="rounded-xl overflow-hidden mb-4 w-full h-32 bg-slate-50 shrink-0">
                                        <img src={post.mediaUrl} alt="AI Generation" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <button 
                                    onClick={() => openScheduleModal(post)}
                                    className="w-full py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] hover:text-indigo-600 text-slate-600 text-sm font-medium rounded-xl transition-colors mt-auto"
                                >
                                    Schedule Post
                                </button>
                            </div>
                        )
                    })}
                </div>
                ) : (
                    <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-5">
                            <History className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-800 mb-2">No recent generations</h3>
                        <p className="text-slate-500 text-[15px] max-w-sm">
                            You haven't generated any posts yet. Type an idea above and click Generate to create your first AI-powered post!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white rounded-[1.25rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-medium text-slate-800">Schedule Generation</h3>
                            <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                            {/* Original Prompt */}
                            <div className="bg-[#f8fafc] rounded-[1rem] p-5 border border-gray-100">
                                <p className="text-slate-700 text-[15px]">{selectedPost.prompt}</p>
                            </div>

                            {/* Generated Content */}
                            <div className="bg-[#f8fafc] rounded-[1rem] p-5 border border-gray-100 whitespace-pre-wrap">
                                <p className="text-slate-700 text-[15px] leading-relaxed">{selectedPost.content}</p>
                                {selectedPost.mediaUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden max-h-[300px] border border-gray-200">
                                        <img src={selectedPost.mediaUrl} alt="Generated Media" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Select Channels */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold text-slate-500 tracking-widest">SELECT CHANNELS</label>
                                    {scheduleErrors.includes('Channels') && <span className="text-[11px] text-red-500 font-semibold tracking-wider">* REQUIRED</span>}
                                </div>
                                <div className={`flex gap-3 p-1 -m-1 rounded-xl transition-colors ${scheduleErrors.includes('Channels') ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                                    {PLATFORMS.map(platform => {
                                        const Icon = platform.icon;
                                        const isSelected = selectedPlatforms.includes(platform.id);
                                        return (
                                            <button
                                                key={platform.id}
                                                onClick={() => togglePlatform(platform.id)}
                                                className={`w-12 h-12 rounded-xl border transition-all duration-200 flex items-center justify-center
                                                    ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-200 text-slate-400 hover:border-indigo-200'}
                                                    ${scheduleErrors.includes('Channels') && !isSelected ? 'border-red-200 text-red-400' : ''}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${scheduleErrors.includes('Date') ? 'text-red-400' : 'text-slate-400'}`} />
                                    <input 
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => { setScheduleDate(e.target.value); setScheduleErrors(err => err.filter(x => x !== 'Date')); }}
                                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none text-[15px] transition-all duration-200
                                            ${scheduleErrors.includes('Date') 
                                                ? 'border-red-300 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500' 
                                                : 'border-gray-100 bg-[#f8fafc] text-slate-600 focus:ring-1 focus:ring-indigo-400'}`}
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${scheduleErrors.includes('Time') ? 'text-red-400' : 'text-slate-400'}`} />
                                    <input 
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => { setScheduleTime(e.target.value); setScheduleErrors(err => err.filter(x => x !== 'Time')); }}
                                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none text-[15px] transition-all duration-200
                                            ${scheduleErrors.includes('Time') 
                                                ? 'border-red-300 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500' 
                                                : 'border-gray-100 bg-[#f8fafc] text-slate-600 focus:ring-1 focus:ring-indigo-400'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 shrink-0 flex flex-col gap-4 bg-white border-t border-gray-100">
                            {scheduleErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-medium">Please provide: {scheduleErrors.join(', ')}</span>
                                </div>
                            )}
                            <button 
                                onClick={handleSchedule}
                                disabled={isScheduling}
                                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm shadow-indigo-200
                                    ${isScheduling ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isScheduling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4" />
                                        Schedule Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIComposer;