
import { PlusCircleIcon } from "lucide-react"
import { useState } from "react"
// import { isModuleNamespaceObject } from "util/types"


const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [contecting, setConnecting] = useState<string | null>(null)
  const[showPalntformPicker,setShowPlantformPickeer] = useState(false)
  return (
    <div className="space-y-8 max-w-4xl">
      

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div className="">
          <h2 className="">Connected Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">{accounts.length} of {setAccounts.length} platforms connected</p>
        </div>
        <button onClick={()=>setShowPlantformPickeer(true)} className="text-slate-500 flex items-center gap-2 px-5 py-2.5 bg-violet-500  hover:bg-violet-600 text-white rounded-full font-medium transition-all w-full sm:w-auto  justify-center">
          <PlusCircleIcon className="size-4"/>Connected Account
        
          

        </button>
      </div>
     </div>
  )
}

export default Accounts