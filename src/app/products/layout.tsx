"use client"

import Navbar from "@/components/navbar/Navbar"

export default function Layout({ children }: any) {
    return <div>
        <Navbar></Navbar>
        {children}
    </div>

}