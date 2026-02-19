import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname()
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])
    return (
        <nav className="flex flex-col md:flex-row items-center md:justify-center p-4 bg-black">
            {/* Botón desplegable solo en pantallas pequeñas */}
            <button
                className="md:hidden mb-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={toggleMenu}
            >
                {menuOpen ? "Cerrar Menú" : "Menú"}
            </button>

            {/* Menú */}
            <div
                className={`flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 transition-all duration-300 ${menuOpen ? "block" : "hidden md:flex"
                    }`}
            >
                <Link href={"/products"} className="px-3 py-2 hover:bg-gray-200 rounded">
                    Tus Productos
                </Link>
                <Link href={"/products/create"} className="px-3 py-2 hover:bg-gray-200 rounded">
                    Agregar Producto
                </Link>
                <Link href={"/"} className="px-3 py-2 hover:bg-gray-200 rounded">
                    Tus Ventas
                </Link>
                <Link href={"/products/sales/create"} className="px-3 py-2 hover:bg-gray-200 rounded">
                    Agregar Venta
                </Link>
            </div>
        </nav>
    );
}