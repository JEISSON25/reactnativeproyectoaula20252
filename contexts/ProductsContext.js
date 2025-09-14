import React, { createContext, useState, useContext } from "react";

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    const addProduct = (product) => {
        setProducts((prev) => [...prev, product]);
    };

    return (
        <ProductsContext.Provider value={{ products, addProduct }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => useContext(ProductsContext);