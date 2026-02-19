import { useState } from "react"

export default function GenericInput({ name, type = 'text', initValue, placeholder, label }: { name: string, type: string, initValue?: any, placeholder: string, label: string }) {
    const [val, setVal] = useState(initValue)
    return <div className="flex flex-col">
        <label className="font-bold text-lg" htmlFor={name}>{label}</label>
        <input step='any' className="px-3 py-1 rounded-xl border-2 border-white placeholder-gray-100 text-white" name={name} id={name} onChange={(e: any) => {
            setVal(e.target.value)
        }} value={initValue && val} type={type}></input>

    </div>

}