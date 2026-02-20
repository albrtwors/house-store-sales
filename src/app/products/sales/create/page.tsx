"use client"
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { clientSupabase } from "@/utils/clientSupabase";
import GenericInput from "@/components/inputs/Generic";

interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
}

interface AddedProduct extends Product {
    cantidad: number;
}

export default function Create() {

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([]);

    // 🔥 cantidades como string (input friendly)
    const [quantities, setQuantities] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await clientSupabase
            .from('products')
            .select('*');

        if (error) {
            Swal.fire({
                theme: 'dark',
                title: 'Error al cargar productos',
                icon: 'error',
            });
            return;
        }

        setAllProducts(data || []);
        setFilteredProducts(data || []);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        const filtered = allProducts.filter((product) =>
            product.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredProducts(filtered);
    };

    // 🔥 Validación SOLO aquí
    const handleAddProduct = (product: Product, quantity: string | undefined) => {

        const parsedQuantity = Number(quantity);

        if (!parsedQuantity || parsedQuantity <= 0) {
            Swal.fire({
                theme: 'dark',
                title: 'Cantidad inválida',
                text: 'Debe ser mayor a 0',
                icon: 'warning',
            });
            return;
        }

        if (parsedQuantity > product.stock) {
            Swal.fire({
                theme: 'dark',
                title: 'Cantidad excede el stock',
                text: `Stock disponible: ${product.stock}`,
                icon: 'warning',
            });
            return;
        }

        const existingIndex = addedProducts.findIndex(
            (p) => p.id === product.id
        );

        if (existingIndex !== -1) {

            const updatedProducts = [...addedProducts];
            const nuevaCantidad =
                updatedProducts[existingIndex].cantidad + parsedQuantity;

            if (nuevaCantidad > product.stock) {
                Swal.fire({
                    theme: 'dark',
                    title: 'Cantidad excede el stock',
                    text: `Stock disponible: ${product.stock}`,
                    icon: 'warning',
                });
                return;
            }

            updatedProducts[existingIndex].cantidad = nuevaCantidad;
            setAddedProducts(updatedProducts);

        } else {

            setAddedProducts([
                ...addedProducts,
                { ...product, cantidad: parsedQuantity }
            ]);
        }

        // limpiar input
        setQuantities((prev) => ({
            ...prev,
            [product.id]: ''
        }));
    };

    const handleRemoveProduct = (productId: number) => {
        setAddedProducts((prev) =>
            prev.filter((p) => p.id !== productId)
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (addedProducts.length === 0) {
            Swal.fire({
                theme: 'dark',
                title: 'No hay productos añadidos',
                icon: 'warning',
            });
            return;
        }

        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form.entries());

        Swal.fire({
            title: 'Procesando venta...',
            html: 'Por favor espere',
            theme: 'dark',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
        });

        try {

            // 1️⃣ Actualizar stock
            for (const prod of addedProducts) {
                const { error } = await clientSupabase
                    .from('products')
                    .update({ stock: prod.stock - prod.cantidad })
                    .eq('id', prod.id);

                if (error) throw error;
            }

            // 2️⃣ Insertar venta
            const total = addedProducts.reduce(
                (acc, curr) => acc + curr.price * curr.cantidad,
                0
            );

            const payload = {
                ...data,
                paid: data.paid ? true : false,
                products: addedProducts,
                total
            };

            const { error: saleError } = await clientSupabase
                .from('sales')
                .insert(payload);

            if (saleError) throw saleError;

            Swal.fire({
                theme: 'dark',
                title: 'Venta realizada',
                icon: 'success',
            });

            // reset
            setAddedProducts([]);
            setQuantities({});
            fetchProducts();

        } catch (error) {
            Swal.fire({
                theme: 'dark',
                title: 'Error en la venta',
                text: 'No se pudo completar la operación',
                icon: 'error',
            });
        }
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <h1 className="text-3xl font-bold">Haz una Venta</h1>

            <form onSubmit={handleSubmit} className="flex flex-col px-3 gap-6">

                <GenericInput
                    name="person"
                    label="Persona"
                    placeholder="Ingresa una persona"
                    type="text"
                />

                <div>
                    <h1 className="font-bold">Ha pagado?</h1>
                    <input name="paid" type="checkbox" />
                </div>

                <div>
                    <h1 className="font-bold">Referencia (si es pago móvil)</h1>
                    <input
                        name="reference"
                        type="number"
                        className="px-3 py-1 border-2 border-white text-white"
                    />
                </div>

                {/* Productos Añadidos */}
                <div>
                    <h3 className="font-bold mb-2">Productos Añadidos</h3>

                    {addedProducts.length === 0 ? (
                        <p>No hay productos añadidos.</p>
                    ) : (
                        <>
                            {addedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border p-2 rounded mb-2"
                                >
                                    <p className="font-semibold">{product.name}</p>
                                    <p>Cantidad: {product.cantidad}</p>
                                    <p>Subtotal: {product.cantidad * product.price}</p>

                                    <button
                                        type="button"
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleRemoveProduct(product.id)}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            ))}

                            <p>
                                Total: <b>
                                    {addedProducts.reduce(
                                        (acc, prod) =>
                                            acc + prod.cantidad * prod.price,
                                        0
                                    )} $
                                </b>
                            </p>
                        </>
                    )}
                </div>

                {/* Productos para añadir */}
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

                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex justify-between items-center mb-2 border-b pb-2"
                            >
                                <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p>Stock: {product.stock}</p>
                                    <p>Precio: {product.price}</p>

                                    <input
                                        type="number"
                                        value={quantities[product.id] ?? ''}
                                        onChange={(e) =>
                                            setQuantities((prev) => ({
                                                ...prev,
                                                [product.id]: e.target.value
                                            }))
                                        }
                                        className="border p-1 w-16"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                    onClick={() =>
                                        handleAddProduct(
                                            product,
                                            quantities[product.id]
                                        )
                                    }
                                    disabled={product.stock === 0}
                                >
                                    Añadir
                                </button>
                            </div>
                        ))}

                    </div>
                </div>

                <button className="bg-green-700 font-bold rounded-lg px-3 py-1 hover:opacity-55">
                    Subir
                </button>

            </form>
        </div>
    );
}