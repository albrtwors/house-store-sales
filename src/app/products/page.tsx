'use client';

import { clientSupabase } from '@/utils/clientSupabase';
import Link from 'next/link';

import { useState, useEffect } from 'react';

export default function Page() {
    const [allProducts, setAllProducts]: any = useState([]);
    const [searchTerm, setSearchTerm]: any = useState('');

    // Cargar productos en el cliente
    useEffect(() => {
        fetchProducts();
    }, []);
    const fetchProducts = async () => {
        const { data } = await clientSupabase.from('products').select('*');
        if (data) {
            setAllProducts(data);
        }
    };
    const handleDeleteProduct = async (id: string) => {
        clientSupabase.from('products').delete().eq('id', id).then((res: any) => {
            fetchProducts()
        })

    }
    const filteredProducts = allProducts.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-3xl font-bold mb-4">Aquí podrás ver tus productos</h1>

            <input
                type="text"
                placeholder="Buscar por nombre..."
                className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="w-full max-w-2xl">
                {filteredProducts.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {filteredProducts.map((product: any) => (
                            <li key={product.id} className="py-4 flex flex-col gap-2">
                                <div><strong>Nombre:</strong> {product.name}</div>
                                <div><strong>Precio:</strong> ${product.price}</div>
                                <div><strong>Cantidad en stock:</strong> {product.stock}</div>
                                <div className='flex gap-2'>
                                    <button onClick={() => handleDeleteProduct(product.id)} className='p-2 bg-red-600 font-bold text-white rounded-lg'>Eliminar</button>
                                    <Link href={`/products/edit/${product.id}`}>
                                        <button className='p-2 bg-green-500 font-bold text-white rounded-lg'>Editar</button>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No se encontraron productos.</p>
                )}
            </div>
        </div>
    );
}