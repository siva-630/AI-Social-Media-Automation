import { PlusIcon, CheckCircle2, Unplug } from "lucide-react";
import { PLATFORMS } from "../assets/assets";

interface AccountListProps {
  account: any[];
  onDisconnect: (accountId: string) => Promise<void> | void;
}

const AccountList = ({ account, onDisconnect }: AccountListProps) => {

  const handleDisconnect = async (accountId: string) => {
    const confirm = window.confirm("Are you sure you want to disconnect this account?")
    if (!confirm) return;
    await onDisconnect(accountId)
  }
  
  if (account.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-20 px-6">
        <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border-slate-100">
          <PlusIcon className="size-6 text-slate-500 opacity-50" />
        </div>
        <p className="font-medium text-slate-800">No accounts connected</p>
        <p className="text-slate-500 text-sm text-center mt-1">Connect your first social platform to start scheduling and automating your accounting</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {account.map((acc) => {
        const platformInfo = PLATFORMS.find(p => p.id === acc.platform);
        const Icon = platformInfo?.icon;
        
        return (
          <div key={acc._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                {Icon ? <Icon className="w-6 h-6" /> : null}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{acc.handle}</h3>
                <p className="text-sm text-slate-500 capitalize">{platformInfo?.name || acc.platform}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <button 
                onClick={() => handleDisconnect(acc._id)}
                className="text-slate-400 hover:text-violet-500 transition-colors p-1 rounded-md"
                title="Disconnect account"
              >
                <Unplug className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccountList
