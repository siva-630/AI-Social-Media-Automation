import { PlusCircleIcon } from "lucide-react"
import { useState, useEffect } from "react"
import AccountList from "../components/AccountList"
import ShowPicker from "../components/ShowPicker"
import { toast } from "react-toastify";

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      const userId = localStorage.getItem("userId") || "";

      // Instant cache loading
      const cached = localStorage.getItem(`cached_accounts_${userId}`);
      if (cached) {
        setAccounts(JSON.parse(cached));
      }

      const response = await fetch(`http://127.0.0.1:3000/api/social/accounts?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        const mappedAccounts = (data.accounts || []).map((acc: any) => ({
          _id: acc.id || acc._id,
          platform: acc.platform,
          handle: acc.username || acc.name || "Unknown User",
          status: "connected"
        }));
        setAccounts(mappedAccounts);
        localStorage.setItem(`cached_accounts_${userId}`, JSON.stringify(mappedAccounts));
      } else {
        toast.error("Failed to load accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Error loading accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();

    const handleFocus = () => {
      fetchAccounts();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/social/accounts/${accountId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const updatedAccounts = accounts.filter(acc => acc._id !== accountId);
        setAccounts(updatedAccounts);
        localStorage.setItem(`cached_accounts_${localStorage.getItem("userId")}`, JSON.stringify(updatedAccounts));
        toast.success("Account disconnected successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to disconnect account");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting account");
    }
  }

  const handleConnect = async (platformId: string) => {
    try {
      setConnecting(platformId);
      const response = await fetch("http://127.0.0.1:3000/api/social/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: platformId,
          userId: localStorage.getItem("userId") || undefined,
        }),
      });

      const data = await response.json();

      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      } else {
        console.error("Failed to fetch authorization URL:", data.message);
        toast.error("Failed to connect: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error connecting account:", error);
      toast.error("Error connecting account. Please try again.");
    } finally {
      setConnecting(null);
      setShowPlatformPicker(false);
    }
  }

  const connectedPlatforms = accounts.map(acc => acc.platform);

  return (
    <div className="space-y-8 max-w-4xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Connected Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">{accounts.length} of 3 platforms connected</p>
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