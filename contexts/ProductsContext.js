import React, { createContext, useState, useContext } from "react";
const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    const addProduct = (product) => {
        setProducts((prev) => [...prev, product]);
    };

    const updateProductQuantity = (productId, newQuantity) => {
        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === productId
                    ? { ...product, quantity: newQuantity }
                    : product
            )
        );
    };

    return (
        <ProductsContext.Provider value={{ products, addProduct, updateProductQuantity }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => useContext(ProductsContext);