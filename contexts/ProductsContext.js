import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert } from "react-native";

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    const addProduct = (product) => {
        setProducts((prev) => [...prev, product]);
    };

    const updateProductQuantity = (productId, newQuantity) => {
        setProducts((currentProducts) =>
            currentProducts.map((product) => {
                if (product.id === productId) {
                    const updatedProduct = { ...product, quantity: newQuantity };

                    // Verificar si cayó por debajo del stock mínimo
                    if (updatedProduct.minStock && newQuantity <= updatedProduct.minStock && newQuantity < product.quantity) {
                        Alert.alert(
                            "⚠️ Alerta de Stock Bajo",
                            `El producto "${product.name}" ha alcanzado el stock mínimo.\n\nStock actual: ${newQuantity}\nStock mínimo: ${updatedProduct.minStock}`,
                            [{ text: "Entendido" }]
                        );
                    }

                    return updatedProduct;
                }
                return product;
            })
        );
    };

    const updateProductMinStock = (productId, minStock) => {
        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === productId
                    ? { ...product, minStock }
                    : product
            )
        );
    };

    // Obtener productos con stock bajo
    const getLowStockProducts = () => {
        return products.filter(p =>
            p.minStock && p.quantity <= p.minStock
        );
    };

    return (
        <ProductsContext.Provider value={{
            products,
            addProduct,
            updateProductQuantity,
            updateProductMinStock,
            getLowStockProducts
        }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => useContext(ProductsContext);