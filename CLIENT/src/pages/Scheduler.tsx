import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Send, ArrowRight, X, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import { PLATFORMS } from '../assets/assets';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://ai-social-media-automation.onrender.com";

const Scheduler = () => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Validation states
    const [errors, setErrors] = useState({
        platforms: false,
        content: false,
        date: false,
        time: false
    });
    
    // Image upload state
    const [mediaPreview, setMediaPreview] = useState<{ url: string; type: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const fetchPosts = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        try {
            const res = await fetch(`${API_URL}/api/posts?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) return;
            
            try {
                // Fetch connected accounts
                const accountsRes = await fetch(`${API_URL}/api/social/accounts?userId=${userId}`);
                if (accountsRes.ok) {
                    const accountsData = await accountsRes.json();
                    setConnectedAccounts(accountsData.accounts || []);
                }
            } catch (err) {
                console.error(err);
            }
            await fetchPosts();
        };
        fetchData();
    }, []);

    const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.scheduledDate || b.createdAt).getTime() - new Date(a.scheduledDate || a.createdAt).getTime()
    );

    const now = new Date().getTime();
    const upcomingPosts = sortedPosts.filter((post: any) => {
        const postTime = new Date(post.scheduledDate || post.createdAt).getTime();
        return post.status === 'scheduled' && postTime > now;
    });
    
    const publishedPosts = sortedPosts.filter((post: any) => {
        const postTime = new Date(post.scheduledDate || post.createdAt).getTime();
        return post.status === 'published' || (post.status === 'scheduled' && postTime <= now);
    });

    const togglePlatform = (acc: any) => {
        const accId = acc._id || acc.id;
        setSelectedPlatforms(prev => {
            const exists = prev.find(p => (p._id || p.id) === accId);
            const next = exists ? prev.filter(p => (p._id || p.id) !== accId) : [...prev, acc];
            if (next.length > 0) setErrors(e => ({ ...e, platforms: false }));
            return next;
        });
    };

    const handleDelete = async (postId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Post deleted successfully");
                await fetchPosts();
            } else {
                toast.error("Failed to delete post");
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            toast.error("Error connecting to server");
        }
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaPreview({ url: URL.createObjectURL(file), type: file.type });
        }
    };

    const handleRemoveMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview.url);
        }
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSchedule = async () => {
        const newErrors = {
            platforms: selectedPlatforms.length === 0,
            content: content.trim() === '',
            date: date === '',
            time: time === ''
        };
        
        setErrors(newErrors);

        if (!Object.values(newErrors).some(Boolean)) {
            setIsLoading(true);
            try {
                const userId = localStorage.getItem("userId");
                
                // Read base64 if media exists
                let mediaBase64 = null;
                if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
                    const file = fileInputRef.current.files[0];
                    mediaBase64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                }

                const localDateTime = new Date(`${date}T${time}`);
                // Publish instantly only if the selected time is strictly in the past or exactly now
                const isPublishNow = localDateTime.getTime() <= new Date().getTime();
                
                const payload = {
                    userId,
                    content,
                    platforms: selectedPlatforms.map(p => ({ platform: p.platform, accountId: p._id || p.id })),
                    scheduledDate: localDateTime.toISOString(),
                    localScheduleString: `${date}T${time}:00`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    mediaBase64,
                    publishNow: isPublishNow
                };

                const res = await fetch(`${API_URL}/api/posts/schedule`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    toast.success(isPublishNow ? 'Post published successfully!' : 'Post scheduled successfully!');
                    setSelectedPlatforms([]);
                    setContent('');
                    setDate('');
                    setTime('');
                    handleRemoveMedia();
                    await fetchPosts();
                } else {
                    const errorData = await res.json();
                    toast.error(`Failed to schedule post: ${errorData.message}`);
                }
            } catch (err) {
                console.error("Error scheduling:", err);
                toast.error("An error occurred while scheduling.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start overflow-hidden">
            {/* Left Column: Compose Post */}
            <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 md:p-6 flex flex-col gap-5">
                    <h1 className="text-[1.2rem] font-bold text-gray-800">Compose Post</h1>
                
                {/* Platforms */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-400 tracking-wider">PLATFORMS</label>
                        {errors.platforms && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Required</span>}
                    </div>
                    <div className={`flex flex-wrap gap-2.5 p-1 -m-1 rounded-xl transition-all ${errors.platforms ? 'bg-red-50 ring-1 ring-red-300' : ''}`}>
                        {connectedAccounts.length === 0 && <span className="text-sm text-gray-500 py-1">No connected accounts. Please connect an account in the dashboard.</span>}
                        {connectedAccounts.map(acc => {
                            const platformDef = PLATFORMS.find(p => p.id === acc.platform);
                            const Icon = platformDef?.icon || Calendar;
                            const accId = acc._id || acc.id;
                            const isSelected = selectedPlatforms.some(p => (p._id || p.id) === accId);
                            return (
                                <button
                                    key={accId}
                                    onClick={() => togglePlatform(acc)}
                                    title={acc.name || acc.platform}
                                    className={`w-10 h-10 rounded-xl border transition-all duration-200 flex items-center justify-center relative group
                                        ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300'}
                                        ${errors.platforms && !isSelected ? 'border-red-200 text-red-400' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-400 tracking-wider">CONTENT</label>
                        {errors.content && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Required</span>}
                    </div>
                    <div className={`relative border rounded-2xl transition-all duration-200 
                        ${errors.content 
                            ? 'border-red-300 bg-red-50 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500' 
                            : 'border-gray-200 bg-[#fafbfc] focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500'}`}>
                        <textarea
                            value={content}
                            onChange={(e) => { setContent(e.target.value); setErrors(err => ({ ...err, content: false })); }}
                            placeholder="What do you want to share today?"
                            maxLength={280}
                            className={`w-full h-24 p-3 bg-transparent resize-none outline-none text-sm transition-colors duration-200
                                ${errors.content ? 'text-red-900 placeholder-red-300' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                        <div className={`absolute bottom-2 right-3 text-xs font-medium ${errors.content ? 'text-red-400' : 'text-gray-400'}`}>
                            {content.length}/280
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 tracking-wider">MEDIA (OPTIONAL)</label>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*,video/*"
                        className="hidden" 
                    />
                    {mediaPreview ? (
                        <div className="relative w-full h-20 rounded-2xl border border-gray-200 overflow-hidden group">
                            {mediaPreview.type.startsWith('video/') ? (
                                <video src={mediaPreview.url} className="w-full h-full object-cover" controls />
                            ) : (
                                <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <button 
                                    onClick={handleRemoveMedia}
                                    className="bg-white p-2 rounded-full hover:bg-red-50 hover:text-red-600 text-gray-800 transition-colors shadow-sm"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafbfc] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200"
                        >
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-400">Click to upload image or video</span>
                        </div>
                    )}
                </div>

                {/* Date & Time */}
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400 tracking-wider">DATE</label>
                            {errors.date && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Required</span>}
                        </div>
                        <div className="relative">
                            <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${errors.date ? 'text-red-400' : 'text-gray-400'}`} />
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); setErrors(err => ({ ...err, date: false })); }}
                                className={`w-full pl-9 pr-2 py-2.5 rounded-xl border outline-none text-sm transition-all duration-200 
                                    ${errors.date 
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-200 bg-[#fafbfc] text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400 tracking-wider">TIME</label>
                            {errors.time && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Required</span>}
                        </div>
                        <div className="relative">
                            <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${errors.time ? 'text-red-400' : 'text-gray-400'}`} />
                            <input 
                                type="time"
                                value={time}
                                onChange={(e) => { setTime(e.target.value); setErrors(err => ({ ...err, time: false })); }}
                                className={`w-full pl-9 pr-2 py-2.5 rounded-xl border outline-none text-sm transition-all duration-200 
                                    ${errors.time 
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-200 bg-[#fafbfc] text-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Button */}
                <button 
                    onClick={handleSchedule}
                    disabled={isLoading}
                    className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm shadow-indigo-200 disabled:opacity-70"
                >
                    {isLoading ? 'Scheduling...' : 'Schedule Post'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
                </div>
            </div>

            {/* Right Column: Posts List */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
                
                {/* Upcoming Section */}
                <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-800 text-[0.95rem]">Upcoming</h2>
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {upcomingPosts.length}
                        </span>
                    </div>
                    <div className="p-2">
                        {upcomingPosts.map((post: any) => {
                            const PlatformIcon = PLATFORMS.find(p => p.id === post.platforms[0])?.icon || (() => null);
                            return (
                                <div key={post._id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                                    <div className="flex justify-between items-start mb-2.5">
                                        <div className="text-[#a1a1aa] bg-gray-100/50 p-1.5 rounded-md">
                                            <PlatformIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium tracking-wide">
                                            {(post.mediaUrls && post.mediaUrls.length > 0) && (
                                                <span className="bg-gray-100/80 text-gray-600 px-2.5 py-1 rounded-md">Image</span>
                                            )}
                                            <span>{formatDate(post.scheduledDate || post.scheduledFor)}</span>
                                            <button 
                                                onClick={() => handleDelete(post._id)}
                                                className="ml-1 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                title="Remove Post"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line pr-4">
                                        {post.content}
                                    </p>
                                </div>
                            )
                        })}
                        {upcomingPosts.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm">No upcoming posts</div>
                        )}
                    </div>
                </div>

                {/* Published Section */}
                <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col max-h-[300px]">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <Send className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-800 text-[0.95rem]">Published</h2>
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {publishedPosts.length}
                        </span>
                    </div>
                    <div className="p-2 flex flex-col overflow-y-auto">
                        {publishedPosts.map((post: any, index: number) => {
                            const PlatformIcon = PLATFORMS.find(p => p.id === post.platforms[0])?.icon || (() => null);
                            return (
                                <React.Fragment key={post._id}>
                                    <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-[#a1a1aa] bg-gray-100/50 p-1.5 rounded-md">
                                                <PlatformIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex items-center gap-2.5 text-[10px] text-gray-400 font-medium tracking-wide">
                                                <span>{formatDate(post.scheduledDate || post.scheduledFor)}</span>
                                                <span className="bg-[#e6fcf5] text-[#20c997] px-2 py-0.5 rounded-full font-semibold border border-[#b2f2bb]/40">
                                                    Published
                                                </span>
                                                <button 
                                                    onClick={() => handleDelete(post._id)}
                                                    className="ml-1 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                    title="Remove Post"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[12.5px] text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line pr-2">
                                            {post.content}
                                        </p>
                                    </div>
                                    {index < publishedPosts.length - 1 && (
                                        <div className="h-[1px] bg-gray-100 mx-3 my-0.5" />
                                    )}
                                </React.Fragment>
                            )
                        })}
                        {publishedPosts.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm">No published posts</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;