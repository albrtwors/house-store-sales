"use client"

import GenericInput from "@/components/inputs/Generic";
import { clientSupabase } from "@/utils/clientSupabase";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";



export default function Create() {
    const [searchTerm, setSearchTerm] = useState<string>(''); // Término de búsqueda
    const [allProducts, setAllProducts] = useState<any[]>([]); // Todos los productos
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // Productos filtrados
    const [addedProducts, setAddedProducts] = useState<any[]>([]); // Productos añadidos
    // Estado local para cantidad en cada fila
    const [cantidad, setCantidad] = useState<number>(1);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await clientSupabase.from('products').select('*');
        if (error) {
            Swal.fire({
                theme: 'dark',
                title: 'Error al cargar productos',
                icon: 'error',
            });
        } else {
            setAllProducts(data);
            setFilteredProducts(data);
        }
    };

    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = allProducts.filter((product: any) =>
            product.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    // Para gestionar cantidad en cada producto añadido
    const handleAddProduct = (product: any, quantity: number) => {
        if (quantity < 1 || quantity > product.stock) {
            Swal.fire({
                theme: 'dark',
                title: 'Cantidad inválida',
                text: `Debe ser entre 1 y ${product.stock}`,
                icon: 'warning',
            });
            return;
        }

        // Ver si ya existe en la lista y actualizar cantidad
        const existingIndex = addedProducts.findIndex((p: any) => p.id === product.id);
        if (existingIndex !== -1) {
            // Actualiza la cantidad si ya está
            const updatedProducts = [...addedProducts];
            updatedProducts[existingIndex].cantidad += quantity;
            // No permitir que sobrepase el stock
            if (updatedProducts[existingIndex].cantidad > product.stock) {
                Swal.fire({
                    theme: 'dark',
                    title: 'Cantidad excede el stock',
                    text: `El stock disponible es ${product.stock}`,
                    icon: 'warning',
                });
                return;
            }
            setAddedProducts(updatedProducts);
        } else {
            // Añadir nuevo producto con cantidad
            setAddedProducts([
                ...addedProducts,
                { ...product, cantidad: quantity },
            ]);
        }
    };

    const handleRemoveProduct = (productId: any) => {
        setAddedProducts(addedProducts.filter((p: any) => p.id !== productId));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());

        Swal.fire({
            title: 'Loading...',
            html: 'Por favor espere',
            theme: 'dark',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Incluye productos con cantidades en la data
        const payload = {
            ...data,
            products: addedProducts,
            total: addedProducts.reduce((total, current): any => total + current.price * current.cantidad, 0),

        };


        addedProducts.forEach((prod: any) => {
            clientSupabase.from('products').update({ stock: prod.stock - prod.cantidad }).eq('id', prod.id).then((res: any) => {
                console.log('ok')
            })
        })

        clientSupabase.from('sales').insert(payload).then((res: any) => {
            if (res.error) {
                Swal.fire({
                    theme: 'dark',
                    title: 'Hubo un error',
                    icon: 'error',
                });
            } else {
                Swal.fire({
                    theme: 'dark',
                    title: 'Venta realizada',
                    icon: 'success',
                });
            }
        });


    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <h1 className="text-3xl font-bold">Haz una Venta</h1>

            <form onSubmit={handleSubmit} className="flex flex-col px-3 gap-6">
                <div>
                    <GenericInput
                        name="person"
                        label="Persona"
                        placeholder="Ingresa una persona"
                        type="text"
                    />
                </div>
                <div className="flex flex-col gap-1">

                    <h1 className="font-bold">Ha pagado?</h1>

                    <input name="paid" type="checkbox"></input>

                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="font-bold">Referencia (en caso de pago movil)</h1>
                    <input name="reference" type="number" className="px-3 py-1 border-2 border-white text-white"></input>
                </div>

                {/* Productos Añadidos */}
                <div>
                    <h3 className="font-bold mb-2">Productos Añadidos</h3>
                    {addedProducts.length === 0 ? (
                        <p>No hay productos añadidos.</p>
                    ) : (
                        <ul>
                            {addedProducts.map((product: any) => (
                                <li key={product.id} className="flex flex-col mb-2 border p-2 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p>Cantidad: {product.cantidad}</p>
                                            <p>Subtotal: {product.cantidad * product.price}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </li>

                            ))}
                            {addedProducts.length > 0 && (
                                <span>
                                    Total: <b>{addedProducts.reduce((total: number, prod: any) => total + prod.cantidad * prod.price, 0)} $</b>
                                </span>
                            )}

                        </ul>
                    )}
                </div>

                {/* Productos por añadir con buscador */}
                <div>
                    <h3 className="font-bold mb-2">Productos para añadir</h3>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border p-2 rounded mb-2"
                    />

                    <div className="max-h-60 overflow-y-auto border rounded p-2">
                        {filteredProducts.length === 0 ? (
                            <p>No se encontraron productos.</p>
                        ) : (
                            filteredProducts.map((product: any) => {

                                return (
                                    <div key={product.id} className="flex justify-between items-center mb-2 border-b pb-2">
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p>Stock: {product.stock}</p>
                                            <p>Precio: {product.price}</p>
                                            {/* Input para cantidad */}
                                            <input
                                                type="number"
                                                min={1}
                                                max={product.stock}
                                                value={cantidad}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    if (isNaN(val)) return;
                                                    if (val < 1) {
                                                        setCantidad(1);
                                                    } else if (val > product.stock) {
                                                        setCantidad(product.stock);
                                                    } else {
                                                        setCantidad(val);
                                                    }
                                                }}
                                                className="border p-1 w-16"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleAddProduct(product, cantidad)}
                                            disabled={product.stock === 0}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <button className="bg-green-700 font-bold rounded-lg px-3 py-1 hover:opacity-55">
                    Subir
                </button>
            </form>
        </div>
    );
}