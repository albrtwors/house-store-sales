"use client"

import GenericInput from "@/components/inputs/Generic";
import { clientSupabase } from "@/utils/clientSupabase";
import { useContext } from "react";
import Swal from "sweetalert2";

export default function Create() {

    const handleSubmit = (e: any) => {
        e.preventDefault()
        const form = new FormData(e.target)
        const data = Object.fromEntries(form.entries())
        Swal.fire({
            title: 'Loading...',
            html: 'Por favor espere',
            theme: 'dark',
            allowOutsideClick: false, // Prevents closing by clicking outside
            allowEscapeKey: false,   // Prevents closing with the Escape key
            didOpen: () => {
                Swal.showLoading(); // Shows the loading spinner
            }
        });
        clientSupabase.from('products').insert([data]).then((res: any) => {
            if (res.error) {
                Swal.fire({
                    theme: 'dark',
                    title: "Hubo un error",
                    icon: "error"
                });
            }
            Swal.fire({
                theme: 'dark',
                title: "Producto creado",

                icon: "success"
            });
        })

    }
    return <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-bold">Añade un Nuevo Producto</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <GenericInput name='name' label="Nombre" placeholder="Ingresa un nombre" type="text"></GenericInput>
            <GenericInput name='price' label="Precio" placeholder="Ingresa un Precio en $ 💵" type="number"></GenericInput>
            <GenericInput name='stock' label="Cantidad" placeholder="Ingresa la cantidad que dispones" type="number"></GenericInput>
            <button className="bg-green-700 font-bold rounded-lg px-3 py-1 hover:opacity-55">Subir</button>

        </form>
    </div>
}