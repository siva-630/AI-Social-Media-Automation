import { PlusCircleIcon } from "lucide-react"
import { useState } from "react"
import AccountList from "../components/AccountList"
import ShowPicker from "../components/ShowPicker"
import { dummyAccountsData } from "../assets/assets"

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>(dummyAccountsData)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)

  const handleDisconnect = async (accountId: string) => {
    setAccounts(accounts.filter(acc => acc._id !== accountId));
  }

  const handleConnect = (platformId: string) => {
    const newAccount = {
      _id: Math.random().toString(36).substring(7),
      platform: platformId,
      handle: "new_user",
      status: "connected",
    };
    setAccounts([...accounts, newAccount]);
    setShowPlatformPicker(false);
  }

  const connectedPlatforms = accounts.map(acc => acc.platform);

  return (
    <div className="space-y-8 max-w-4xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Connected Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">{accounts.length} of 4 platforms connected</p>
        </div>
        <button onClick={() => setShowPlatformPicker(true)} className="text-white flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-full font-medium transition-all w-full sm:w-auto justify-center shadow-sm">
          <PlusCircleIcon className="size-4" />
          Connect Account
        </button>
      </div>
      
      <AccountList account={accounts} onDisconnect={handleDisconnect} />

      <ShowPicker 
        isOpen={showPlatformPicker} 
        onClose={() => setShowPlatformPicker(false)} 
        connectedPlatforms={connectedPlatforms}
        onConnect={handleConnect}
      />
    </div>
  )
}

export default Accounts