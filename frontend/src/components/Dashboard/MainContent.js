import React, { useState, useEffect } from "react";
import { FileUpload } from "../FileUpload/FileUpload";
import { QueryInterface } from "../Query/QueryInterface";
import { QueryHistory } from "../Query/QueryHistory";
import APIKeySettings from "../Settings/APIKeySettings";
import { Eye, EyeOff } from "lucide-react";

const MainContent = ({
  activeView,
  currentFile,
  onFileUpload,
  onNewQuery,
  queryHistory,
  user,
}) => {
  const [showDataPreview, setShowDataPreview] = useState(true);
  const [sessionQueryResults, setSessionQueryResults] = useState([]);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(""); // Persist query across tab switches

  // Effect to reset session results when file changes
  useEffect(() => {
    if (currentFile?.metadata?.id !== currentFileId) {
      setSessionQueryResults([]);
      setCurrentQuery(""); // Reset query when file changes
      setCurrentFileId(currentFile?.metadata?.id || null);
    }
  }, [currentFile?.metadata?.id, currentFileId]);

  // Handle new query from QueryInterface
  const handleSessionQuery = (query, result) => {
    setSessionQueryResults((prev) => [result, ...prev]);
    // Also notify parent component for global history
    if (onNewQuery) {
      onNewQuery(query, result);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "upload":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Upload Your Data
              </h1>
              <p className="text-gray-500 dark:text-gray-200 font-normaltext">
                Upload a CSV or Excel file to start analyzing your data with
                natural language queries
              </p>
            </div>
            <FileUpload onFileUpload={onFileUpload} />
          </div>
        );

      case "query":
        if (!currentFile) {
          return (
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-jersey text-gray-900 mb-4">
                No File Selected
              </h1>
              <p className="text-gray-500 font-normaltext mb-8">
                Please upload a file first to start querying your data by
                clicking <b>Upload File</b> in the sidebar.
              </p>
              {/* <button
                onClick={() => (window.location.href = "#upload")}
                className="bg-logocolor text-black px-6 py-3 rounded-lg font-normaltext hover:bg-opacity-90 transition-colors"
              >
                Upload File
              </button> */}
            </div>
          );
        }

        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Query Your Data
              </h1>
              {/* <p className="text-gray-400 font-normaltext">
                Currently analyzing:{" "}
                <span className="text-logocolor">
                  {currentFile.metadata?.name}
                </span>
              </p> */}
            </div>

            {/* Currently Analyzing Panel */}
            {currentFile && (
              <div className="mb-6 bg-white dark:bg-github-dark rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                <h3 className="text-gray-800 dark:text-white font-bold mb-4">
                  Currently analyzing: {currentFile.metadata?.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white">Rows:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{currentFile.metadata?.totalRows || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white">Columns:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{currentFile.metadata?.totalColumns || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white">Size:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{currentFile.metadata?.size || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white">Type:</span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">{currentFile.metadata?.type || "Unknown"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Preview Section */}
            {showDataPreview && (
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-github-dark dark:to-black rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Data Preview
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-black px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                      {currentFile.metadata?.totalRows} rows ×{" "}
                      {currentFile.metadata?.totalColumns} columns
                    </div>
                    <button
                      onClick={() => setShowDataPreview(false)}
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      <EyeOff size={14} />
                      <span>Hide Preview</span>
                    </button>
                  </div>
                </div>

                {/* Display the actual data preview if available */}
                {currentFile.preview && currentFile.preview.rows && (
                  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-github-dark">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-black">
                        <tr>
                          {currentFile.preview.columns?.map((column, index) => (
                            <th
                              key={index}
                              className="text-left py-2 px-3 text-gray-700 dark:text-white font-bold border-b border-gray-200 dark:border-gray-600"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentFile.preview.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={
                              rowIndex % 2 === 0 ? "bg-white dark:bg-github-dark" : "bg-gray-50 dark:bg-black"
                            }
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="py-2 px-3 text-gray-600 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-300 text-center p-2 bg-gray-50 dark:bg-black rounded-b-md border-t border-gray-200 dark:border-gray-600">
                      Showing first {currentFile.preview.rows.length} rows of{" "}
                      {currentFile.metadata?.totalRows} total rows
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show Data Preview Button when hidden */}
            {!showDataPreview && (
              <div className="mb-6">
                <button
                  onClick={() => setShowDataPreview(true)}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-github-dark text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-black border border-gray-200 dark:border-gray-600 transition-colors text-sm"
                >
                  <Eye size={16} />
                  <span>Show Data Preview</span>
                </button>
              </div>
            )}

            <QueryInterface
              currentFile={currentFile}
              onNewQuery={handleSessionQuery}
              user={user}
              sessionResults={sessionQueryResults}
              currentQuery={currentQuery}
              onQueryChange={setCurrentQuery}
            />
          </div>
        );

      case "history":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-jersey text-black mb-2">
                Query History
              </h1>
              <p className="text-gray-500 font-normaltext">
                View and manage your previous queries and results
              </p>
            </div>
            <QueryHistory queries={queryHistory} user={user} />
          </div>
        );

      case "settings":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Settings</h1>
              <p className="text-gray-500 dark:text-gray-200 font-normaltext">
                Manage your API keys and application preferences
              </p>
            </div>
            <APIKeySettings />
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-jersey text-white mb-4">
              Welcome to HorizonAI
            </h1>
            <p className="text-gray-400 font-normaltext">
              Select an option from the sidebar to get started
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-gray-50 dark:bg-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-jersey text-logocolor capitalize">
              {activeView === "upload"
                ? ""
                : activeView === "query"
                ? ""
                : activeView === "history"
                ? ""
                : activeView === "settings"
                ? ""
                : ""}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* {currentFile && (
              <div className="text-sm text-gray-400">
                <span className="font-normaltext">
                  File: {currentFile.metadata?.name} (
                  {currentFile.metadata?.size})
                </span>
              </div>
            )} */}
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <span className="font-normaltext">Welcome, {user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6">{renderContent()}</main>
    </div>
  );
};

export default MainContent;
