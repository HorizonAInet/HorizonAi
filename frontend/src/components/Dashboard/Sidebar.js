import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User,
  Upload,
  MessageSquare,
  History,
  LogOut,
  Settings,
  Database,
  Heart,
  Moon,
  Sun,
} from "lucide-react";
import { fileAPI } from "../../services/api";
import FeedbackModal from "../Feedback/FeedbackModal";
import ThemeToggle from "../common/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";

// Footer with dropup user profile (old style)
const SidebarUserFooter = ({ isOpen, user, onSignOut, onFeedback }) => {
  const [dropupOpen, setDropupOpen] = useState(false);
  const dropupRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropupRef.current && !dropupRef.current.contains(event.target)) {
        setDropupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed left-0 w-64 bottom-0 z-40 border-t border-gray-100 dark:border-black p-2 bg-white dark:bg-github-dark">
      <div ref={dropupRef} className="relative">
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
          onClick={() => setDropupOpen((v) => !v)}
        >
          <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-white dark:text-gray-900" />
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-200">
                Member since{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          )}
        </button>

        {dropupOpen && (
          <div className="absolute bottom-14 left-0 w-full bg-white dark:bg-github-dark border border-gray-200 dark:border-black rounded-lg shadow-lg py-2 animate-fadeInUp">
            {/* Theme Toggle in dropdown - styled exactly like other menu items */}
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-black hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setDropupOpen(false);
                toggleTheme();
              }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="font-normaltext">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-black hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setDropupOpen(false);
                onFeedback();
              }}
            >
              <Heart size={18} />
              <span className="font-normaltext">Feedback</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
              onClick={() => {
                setDropupOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={18} />
              <span className="font-normaltext">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({
  isOpen,
  onToggle,
  user,
  currentFile,
  activeView,
  onViewChange,
  onSignOut,
}) => {
  const [columnDatatypes, setColumnDatatypes] = useState(null);
  const [loadingDatatypes, setLoadingDatatypes] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const loadDatatypes = async () => {
      if (currentFile?.metadata?.id) {
        setLoadingDatatypes(true);
        try {
          const response = await fileAPI.getFileDatatypes(
            currentFile.metadata.id
          );
          if (response.success) {
            setColumnDatatypes(response.datatypes);
          }
        } catch (error) {
          console.error("Failed to load column datatypes:", error);
          setColumnDatatypes(null);
        } finally {
          setLoadingDatatypes(false);
        }
      } else {
        setColumnDatatypes(null);
      }
    };
    loadDatatypes();
  }, [currentFile?.metadata?.id]);

  const menuItems = [
    { id: "upload", label: "New File", icon: Upload },
    { id: "query", label: "Query Data", icon: MessageSquare },
    { id: "history", label: "Query History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-github-dark text-gray-900 dark:text-gray-200 z-30 transition-all duration-300 shadow-md ${
          isOpen ? "w-64" : "w-16"
        } border-r border-gray-200 dark:border-black overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-black">
          {isOpen && (
            <h2 id="horizon" className="text-1xl text-black dark:text-white flex items-center">
              <span>
                <img
                  src="images/logoyashraj1black.svg"
                  alt="Logo"
                  className="w-10 h-10 object-cover dark:hidden"
                />
                <img
                  src="images/logoyashraj1white.svg"
                  alt="Logo"
                  className="w-10 h-10 object-cover hidden dark:block"
                />
              </span>
              Horizon
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black hover:text-gray-900 dark:hover:text-gray-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black hover:text-gray-900 dark:hover:text-gray-100"
                  } ${
                    isOpen
                      ? "w-full px-3 py-2 space-x-3 justify-start"
                      : "w-full h-12 justify-center"
                  }`}
                  title={isOpen ? "" : item.label}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <span className="font-normaltext">{item.label}</span>
                  )}
                </button>
              );
            })}
            
            {/* Theme toggle removed from main navigation - now in dropdown */}
          </div>

          {/* Column Datatypes */}
          {isOpen && currentFile && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Database size={16} className="text-gray-400 dark:text-gray-200" />
                <h3 className="text-sm font-medium text-gray-400 dark:text-gray-200">
                  Column Datatypes
                </h3>
              </div>

              {loadingDatatypes ? (
                <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-200 bg-gray-200 dark:bg-black rounded-lg">
                  Loading datatypes...
                </div>
              ) : columnDatatypes ? (
                <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                  {Object.entries(columnDatatypes).map(
                    ([columnName, datatype]) => (
                      <div
                        key={columnName}
                        className="px-3 py-2 text-xs bg-gray-200 dark:bg-black rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-gray-900 dark:text-gray-200 font-medium truncate flex-1 mr-2">
                            {columnName}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              datatype.type === "Integer"
                                ? "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                                : datatype.type === "Float"
                                ? "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                                : datatype.type === "Text"
                                ? "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                                : datatype.type === "DateTime"
                                ? "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                                : datatype.type === "Boolean"
                                ? "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                                : "border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {datatype.type}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-200 mt-1 text-xs">
                          {datatype.non_null_count} values
                          {datatype.null_count > 0 &&
                            `, ${datatype.null_count} null`}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-200 bg-gray-200 dark:bg-black rounded-lg">
                  No datatype information available
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        {isOpen ? (
          <SidebarUserFooter
            isOpen={isOpen}
            user={user}
            onSignOut={onSignOut}
            onFeedback={() => setShowFeedbackModal(true)}
          />
        ) : (
          <div className="fixed left-0 w-16 bottom-0 z-40 border-t border-gray-100 dark:border-black p-2 flex flex-col items-center justify-center bg-white dark:bg-github-dark">
            <div className="w-full flex justify-center">
              <ThemeToggle isOpen={false} />
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default Sidebar;
