import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Edit3, Loader2, PackageOpen } from "lucide-react";
import productService from "../appwrite/product";
import { useNavigate } from "react-router-dom";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const LIMIT = 9;

  const observer = useRef();

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading || fetchingRef.current) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchProducts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const fetchingRef = useRef(false);

  const fetchProducts = async (isNewSearch = false) => {
    if (fetchingRef.current || (!hasMore && !isNewSearch)) return;

    fetchingRef.current = true;
    setLoading(true);

    // Use the current offset unless it's a new search
    const currentOffset = isNewSearch ? 0 : offset;

    try {
      const res = await productService.listProducts({
        limit: LIMIT,
        offset: currentOffset,
        search: search,
      });

      setProducts((prev) =>
        isNewSearch ? res.products : [...prev, ...res.products],
      );
      setOffset(currentOffset + res.products.length);

      if (res.products.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    fetchProducts(true);
  }, [search]);

  const handleSearch = () => {
    const value = searchInput;
    // If the user clicks search with an empty box, treat it as a reset
    setSearch(value);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch(""); // This triggers the useEffect to fetch all products
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id.$id);
        await productService.deleteImage(id.imageId || null);
        setProducts((prev) => prev.filter((p) => p.$id !== id.$id));
      } catch (err) {
        console.log(err);

        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Total Menu Items({products.length})
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-3 w-full md:w-[500px] mb-5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            // Optional: Trigger search on "Enter" key
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 pr-10"
          />
          {searchInput && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <button
          disabled={loading}
          onClick={handleSearch}
          className={`px-5 py-2 rounded-xl font-semibold transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {products.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <PackageOpen size={64} strokeWidth={1} />
          <p className="mt-4 text-xl">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            // Handle quantityOptions string-to-json safely
            let options = [];
            try {
              options =
                typeof product.quantityOptions === "string"
                  ? JSON.parse(product.quantityOptions)
                  : product.quantityOptions || [];
            } catch (e) {
              console.error("JSON Parse Error", e);
            }

            const isLastElement = products.length === index + 1;

            return (
              <div
                key={product.$id}
                ref={isLastElement ? lastProductElementRef : null}
                className={`group  rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col `}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                  />
                  {/* <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-green-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {product.discount}% OFF
                    </span>
                  </div> */}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-800 capitalize leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-2xl font-black text-blue-600">
                      ₹{product.price - product.discount}
                    </span>
                  </div>

                  {/* <p
                    className={`text-gray-600 text-xl mb-4 line-clamp-2 italic`}
                  >
                    {"Stock quantity: \n"}
                    <span className={`text-red-500`}>
                      {product.stockQuantity}
                    </span>
                  </p> */}

                  <p className="text-gray-800 font-semibold text-sm mb-4 line-clamp-2 italic">
                    {product.restaurantId.name}
                  </p>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">
                    {product.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pricing Tiers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100"
                        >
                          <span className="text-xs font-semibold">
                            {opt.label}: ₹{opt.purchasePrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 px-5 bg-gray-50 border-t flex gap-3">
                  <button
                    onClick={() =>
                      navigate("/add-Product", {
                        state: { editProduct: product },
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-sm"
                  >
                    <Edit3 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all font-semibold"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
          <span className="text-gray-500 font-medium">Loading products...</span>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-12">
          <div className="h-px bg-gray-200 w-1/4 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">
            You've reached the end of the inventory.
          </p>
        </div>
      )}
    </div>
  );
};

export default Product;
