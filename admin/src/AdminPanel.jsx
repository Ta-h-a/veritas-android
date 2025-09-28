import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [uploads, setUploads] = useState([]);

  // Fetch all uploads on mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/clerkdata")
      .then((res) => setUploads(res.data));
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await axios.delete(`/api/clerkdata/${id}`);
      setUploads((prev) => prev.filter((item) => item._id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">
        Admin Uploads Panel
      </h1>

      {uploads.length === 0 ? (
        <p className="text-center text-gray-500">No uploads found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {uploads.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col"
            >
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-semibold">ID:</span> {item.clerk_id}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-semibold">Email:</span>{" "}
                  {item.clerk_email}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-semibold">Barcode:</span>{" "}
                  {item.barcode_number}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">OCR Text:</span>{" "}
                  {item.ocr_text}
                </p>
              </div>

              {item.barcode_image && (
                <img
                  src={`data:image/png;base64,${item.barcode_image}`}
                  alt="Barcode"
                  className="w-full rounded-md mb-4 object-contain h-40"
                />
              )}

              <button
                onClick={() => handleDelete(item._id)}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition duration-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
