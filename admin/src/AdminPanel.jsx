import React, { useEffect, useState } from "react";
import {
  Trash2,
  Search,
  Filter,
  User,
  Mail,
  Hash,
  FileText,
  ImageIcon,
  AlertCircle,
  SearchSlash,
  MapPin,
  Building,
  Tag,
} from "lucide-react";

import { UserButton, useUser } from "@clerk/clerk-react";

const AdminPanel = () => {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useUser();
  console.log(user);

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/admin/clerkdata"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUploads(data);
        setFilteredUploads(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Failed to load data. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = uploads.filter(
      (item) =>
        item.clerk_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clerk_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode_number.includes(searchTerm) ||
        item.ocr_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.state &&
          item.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.city &&
          item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category &&
          item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUploads(filtered);
  }, [searchTerm, uploads]);

  // Delete handler with API call
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      setDeleteLoading(id);
      try {
        const response = await fetch(
          `http://localhost:8080/api/clerkdata/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setUploads((prev) => prev.filter((item) => item._id !== id));
          setFilteredUploads((prev) => prev.filter((item) => item._id !== id));
        } else {
          throw new Error(result.message || "Delete failed");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete item. Please try again.");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-6 w-3/4 mb-4 rounded"></div>
      <div className="space-y-3">
        <div className="bg-gray-300 h-4 w-full rounded"></div>
        <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
        <div className="bg-gray-300 h-32 w-full rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dex Veritas Admin
              </h1>
              <p className="text-gray-600 mt-1">
                <span className="font-bold">Admin: </span>
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-bold">Last login: </span>
                <span>
                  {user.lastSignInAt.getHours()}:
                  {user.lastSignInAt.getMinutes()}:
                  {user.lastSignInAt.getSeconds()},{" "}
                  {user.lastSignInAt.toLocaleDateString()}
                </span>
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative flex flex-row items-center gap-4">
              {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div> */}
              <input
                type="text"
                placeholder="Search by ID, email, barcode, text, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-3 w-full md:w-96 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm"
              />
              <UserButton />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Uploads
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {uploads.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Filtered Results
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredUploads.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Active Clerks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(uploads.map((item) => item.clerk_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {uploads.length === 0
                ? "No uploads found"
                : "No matching results"}
            </h3>
            <p className="text-gray-600 mb-6">
              {uploads.length === 0
                ? "There are no uploaded items to display."
                : "Try adjusting your search terms or filters."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map((item, index) => (
              <div
                key={item._id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:bg-white/90"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.clerk_id}
                      </h3>
                      <p className="text-sm text-gray-500">Clerk ID</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm animate-pulse"></div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-xl">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-sm text-gray-800 truncate">
                        {item.clerk_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-xl">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Barcode
                      </p>
                      <p className="text-sm text-gray-800 font-mono">
                        {item.barcode_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gray-50/80 rounded-xl">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        OCR Text
                      </p>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {item.ocr_text}
                      </p>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="flex items-center space-x-3 p-3 bg-blue-50/80 rounded-xl">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Location
                      </p>
                      <p className="text-sm text-gray-800">
                        {item.state && item.city
                          ? `${item.city}, ${item.state}`
                          : item.state || item.city || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Category Information */}
                  <div className="flex items-center space-x-3 p-3 bg-purple-50/80 rounded-xl">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Category
                      </p>
                      <p className="text-sm text-gray-800 capitalize">
                        {item.category
                          ? item.category.replace(/-/g, " ")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barcode Image */}
                {item.barcode_image && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-600">
                        Barcode Image
                      </p>
                    </div>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                      <img
                        src={item.barcode_image}
                        alt="Barcode"
                        className="w-full h-32 object-contain rounded-lg hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deleteLoading === item._id}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl"
                >
                  {deleteLoading === item._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
