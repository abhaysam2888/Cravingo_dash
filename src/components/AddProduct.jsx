import React, { useState, useEffect } from "react";
import { Client, Storage, ID, TablesDB, Query } from "appwrite";
import { useLocation, useNavigate } from "react-router-dom";
import {
  bucketId,
  databaseId,
  endpoint,
  restaurantId,
  menuItemId,
  projectId,
} from "../conf/conf";
import imageCompression from "browser-image-compression";

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const databases = new TablesDB(client);
const storage = new Storage(client);

const AddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are in edit mode
  const editData = location.state?.editProduct;
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    name: editData?.name || "",
    price: editData?.price || "",
    discount: editData?.discount || "",
    restaurantId: editData?.restaurantId || "",
    description: editData?.description || "",
    category: editData?.category || "",
    isAvailable: editData?.isAvailable || true,
    isVeg: editData?.isVeg || true,
    suggestedItems: editData?.suggestedItems || [],
  });

  const [quantityOptions, setQuantityOptions] = useState(
    editData?.quantityOptions
      ? JSON.parse(editData.quantityOptions)
      : [{ label: "", appPrice: "", purchasePrice: "", discount: "" }],
  );

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await databases.listRows({
          databaseId: databaseId,
          tableId: restaurantId,
          queries: [Query.limit(1000)],
        });

        setCategories(response.rows);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...quantityOptions];
    updatedOptions[index][field] = field === "label" ? value : Number(value);
    setQuantityOptions(updatedOptions);
  };

  const addOption = () => {
    setQuantityOptions([
      ...quantityOptions,
      { label: "", appPrice: "", purchasePrice: "", discount: "" },
    ]);
  };

  const removeOption = (indexToRemove) => {
    setQuantityOptions(
      quantityOptions.filter((_, index) => index !== indexToRemove),
    );
  };

  const validateForm = () => {
    // Basic fields
    for (const [key, value] of Object.entries(formData)) {
      if (value === "" || value === null) {
        alert(`Please fill ${key}`);
        return false;
      }
    }

    // Quantity options validation
    for (let i = 0; i < quantityOptions.length; i++) {
      const opt = quantityOptions[i];
      if (
        !opt.label ||
        opt.appPrice === "" ||
        opt.purchasePrice === "" ||
        opt.discount === ""
      ) {
        alert(`Please complete all quantity fields (row ${i + 1})`);
        return false;
      }
    }

    // Image required on create
    if (!isEditMode && !imageFile) {
      alert("Product image is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      let fileUrl = editData?.imageUrl || "";
      let fileResponse = editData?.imageId || "";
      let finalImageId = editData?.imageId || "";

      // Upload Image (Only if a new file is selected)
      if (imageFile) {
        console.log("Uploading file:", imageFile);
        fileResponse = await storage.createFile({
          bucketId: bucketId,
          fileId: ID.unique(),
          file: imageFile,
        });

        finalImageId = fileResponse.$id;

        fileUrl = storage.getFileView({
          bucketId: bucketId,
          fileId: fileResponse.$id,
        });
      }

      // Payload
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        discount: Number(formData.discount),
        restaurantId: formData.restaurantId,
        imageUrl: fileUrl,
        quantityOptions: JSON.stringify(quantityOptions),
        description: formData.description,
        category: formData.category,
        isAvailable: formData.isAvailable,
        isVeg: formData.isVeg,
        imageId: finalImageId,
        restaurantPrice: 0,
        suggestedItems: formData.suggestedItems,
      };

      // Update or Create Logic
      if (isEditMode) {
        await databases.updateRow({
          databaseId: databaseId,
          tableId: menuItemId,
          rowId: editData.$id,
          data: payload,
        });
        alert("Product Updated Successfully!");
      } else {
        await databases.createRow({
          databaseId: databaseId,
          tableId: menuItemId,
          rowId: ID.unique(),
          data: payload,
        });
        alert("Product Published Successfully!");
      }

      navigate("/products"); // Navigate back to the list after success
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg mt-6 sm:mt-10">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">
        {isEditMode ? "Edit Product" : "Product Dashboard"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Menu Item
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition"
              placeholder="e.g. Chowmein"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Restaurants
            </label>
            <select
              required
              value={formData.restaurantId}
              onChange={(e) =>
                setFormData({ ...formData, restaurantId: e.target.value })
              }
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select a Restaurant</option>
              {categories.map((cat) => (
                <option key={cat.$id} value={cat.$id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Price (₹)
            </label>
            {/* Base Price (₹) Input */}
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, price: val });

                // Sync with first variant
                const updatedOptions = [...quantityOptions];
                updatedOptions[0].appPrice = val === "" ? "" : Number(val);
                setQuantityOptions(updatedOptions);
              }}
              placeholder="e.g. 100"
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Discount
            </label>
            {/* Overall Discount Input */}
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, discount: val });

                // Sync with first variant
                const updatedOptions = [...quantityOptions];
                updatedOptions[0].discount = val === "" ? "" : Number(val);
                setQuantityOptions(updatedOptions);
              }}
              placeholder="e.g. 50"
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, category: val });
              }}
              placeholder="e.g. noodels, tea"
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              isAvailable
            </label>
            {/* Overall Discount Input */}
            <select
              required
              value={formData.isAvailable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isAvailable: e.target.value === "true",
                })
              }
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none bg-white"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">isVeg</label>
            <select
              required
              value={formData.isVeg}
              onChange={(e) =>
                setFormData({ ...formData, isVeg: e.target.value === "true" })
              }
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none bg-white"
            >
              <option value={true}>true</option>
              <option value={false}>false</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-semibold text-gray-600">
              Suggested Items (comma separated)
            </label>
            <input
              type="text"
              value={formData.suggestedItems.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  suggestedItems: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="chai, coffee, biscuit"
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Menu Item Image
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              required={!isEditMode}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                  alert("Only image files are allowed");
                  e.target.value = "";
                  return;
                }

                const options = {
                  maxSizeMB: 0.045, // Target slightly under 50KB (0.05MB)
                  maxWidthOrHeight: 800, // Reduce resolution to help reach target size
                  useWebWorker: true,
                  fileType: "image/jpeg", // JPEGs compress much better than PNGs
                };

                try {
                  setLoading(true);
                  const compressedBlob = await imageCompression(file, options);

                  // FIX: Convert the Blob to a real File object
                  const finalizedFile = new File([compressedBlob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });

                  console.log("Finalized File for Appwrite:", finalizedFile);
                  setImageFile(finalizedFile); // Now imageFile is a real File object
                } catch (error) {
                  console.error("Compression Error:", error);
                  alert("Failed to compress image.");
                } finally {
                  setLoading(false);
                }
              }}
              className="border-2 p-1.5 rounded-lg bg-gray-50 cursor-pointer"
            />

            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, JPEG, PNG, WEBP (Max 5MB)
            </p>

            {isEditMode && (
              <p className="text-xs text-blue-500 mt-1">
                Leave empty to keep current image
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-semibold text-gray-600">
              Menu Item Description
            </label>
            <textarea
              rows="4"
              value={formData.description}
              placeholder="Describe the product..."
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border-2 p-2 rounded-lg focus:border-blue-500 outline-none transition w-full"
            ></textarea>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
            📦 Quantity Variations
          </h3>
          {quantityOptions.map((opt, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4 bg-white p-4 rounded-lg border shadow-sm"
            >
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label className="text-[10px] font-bold text-gray-400">
                  Label
                </label>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) =>
                    handleOptionChange(index, "label", e.target.value)
                  }
                  className="border p-2 rounded bg-gray-50"
                  placeholder="full/half"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400">
                  App Price
                </label>
                <input
                  type="number"
                  value={opt.appPrice}
                  // Disable manual editing for the first row to keep it synced with Base Price
                  readOnly={index === 0}
                  onChange={(e) =>
                    handleOptionChange(index, "appPrice", e.target.value)
                  }
                  className={`border p-2 rounded ${index === 0 ? "bg-gray-200 cursor-not-allowed" : "bg-gray-50"}`}
                  placeholder="e.g. 110"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400">
                  Buy Price
                </label>
                <input
                  type="number"
                  value={opt.purchasePrice}
                  onChange={(e) =>
                    handleOptionChange(index, "purchasePrice", e.target.value)
                  }
                  placeholder="e.g. 90"
                  className="border p-2 rounded bg-gray-50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400">
                  Disc
                </label>
                <input
                  type="number"
                  value={opt.discount}
                  // Disable manual editing for the first row to keep it synced with overall discount
                  readOnly={index === 0}
                  onChange={(e) =>
                    handleOptionChange(index, "discount", e.target.value)
                  }
                  placeholder="e.g. 10"
                  className={`border p-2 rounded ${index === 0 ? "bg-gray-200 cursor-not-allowed" : "bg-gray-50"}`}
                />
              </div>
              {quantityOptions.length > 1 && (
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="bg-red-50 text-red-500 p-2 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition h-10 w-10 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition border border-blue-200"
          >
            + Add Another Variant
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition transform active:scale-95 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white"
          }`}
        >
          {loading
            ? "PROCESSING..."
            : isEditMode
              ? "UPDATE PRODUCT"
              : "PUBLISH PRODUCT"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
