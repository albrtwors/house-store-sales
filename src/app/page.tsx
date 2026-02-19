'use client'
import Navbar from "@/components/navbar/Navbar";
import { clientSupabase } from "@/utils/clientSupabase";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [sales, setSales]: any = useState([]); // Todas las ventas
  const [filteredSales, setFilteredSales]: any = useState([]); // Ventas filtradas
  const [searchPerson, setSearchPerson]: any = useState('');
  const [startDate, setStartDate]: any = useState('');
  const [endDate, setEndDate]: any = useState('');

  // Cargar ventas al cargar
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error }: any = await clientSupabase.from('sales').select('*');
    if (error) {
      console.error(error);
    } else {
      setSales(data);
      setFilteredSales(data);
    }
  };

  // Filtrar ventas en base a los criterios
  useEffect(() => {
    let filtered = [...sales];

    if (searchPerson) {
      filtered = filtered.filter(sale =>
        sale.person.toLowerCase().includes(searchPerson.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter(sale => new Date(sale.created_at) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(sale => new Date(sale.created_at) <= new Date(endDate));
    }

    setFilteredSales(filtered);
  }, [searchPerson, startDate, endDate, sales]);

  return (
    <div>
      <Navbar></Navbar>
      <div className="flex flex-col gap-2 p-5 items-center justify-center">

        <h1 className="text-3xl mb-4">Tus Ventas</h1>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full max-w-4xl">
          {/* Buscador por persona */}
          <input
            type="text"
            placeholder="Buscar por persona..."
            value={searchPerson}
            onChange={(e) => setSearchPerson(e.target.value)}
            className="border p-2 rounded w-full"
          />

          {/* Fecha inicio */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />

          {/* Fecha fin */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* Tabla de ventas */}
        <div className="mx-3 w-full overflow-scroll flex justify-center">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-black">
                <th className="border border-gray-400 px-4 py-2">Fecha</th>
                <th className="border border-gray-400 px-4 py-2">Persona</th>
                <th className="border border-gray-400 px-4 py-2">Precio Total</th>
                <th className="border border-gray-400 px-4 py-2">Productos</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center px-4 py-2">
                    No hay ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale: any) => (
                  <tr key={sale.id} className="border-b border-gray-300">
                    <td className="px-4 py-2">
                      {new Date(sale.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{sale.person}</td>
                    <td className="px-4 py-2">${sale.total}</td>
                    <td className="px-4 py-2">
                      {sale.products && Array.isArray(sale.products) ? (
                        <ul className="list-disc list-inside">
                          {sale.products.map((prod: any, index: number) => (
                            <li key={index}>
                              {prod.name} x {prod.cantidad}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No productos'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}