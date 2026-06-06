import { X, ExternalLink, CheckCircle2 } from "lucide-react";
import { PLATFORMS } from "../assets/assets";

interface ShowPickerProps {
    isOpen: boolean;
    onClose: () => void;
    connectedPlatforms: string[];
    onConnect: (platformId: string) => void;
}

const ShowPicker = ({ isOpen, onClose, connectedPlatforms, onConnect }: ShowPickerProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-800">Choose a Platform</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/*  */}
                <div className="p-6 space-y-3">
                    {PLATFORMS.map((platform: any) => {
                        const isConnected = connectedPlatforms.includes(platform.id);
                        const Icon = platform.icon;
                        
                        if (isConnected) {
                            return (
                                <div key={platform.id} className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="text-violet-500">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-violet-500">{platform.name}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">Already connected</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                </div>
                            );
                        }

                        return (
                            <div 
                                key={platform.id} 
                                onClick={() => onConnect(platform.id)}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm hover:shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-600 group-hover:text-violet-600 transition-colors">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800 group-hover:text-violet-900 transition-colors">{platform.name}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5">{platform.description}</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShowPicker;
// 