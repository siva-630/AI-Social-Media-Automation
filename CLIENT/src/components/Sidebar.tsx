
export const Sidebar = ({isOpen,setIsOpen}:{isOpen:boolean,setIsOpen:(val:boolean)=> void}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-200 ease-in-out
    md:relative md:translate-x-0 `}></div>
  )
}
