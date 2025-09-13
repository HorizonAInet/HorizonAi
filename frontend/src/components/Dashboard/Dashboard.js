import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import LoadingSpinner from "../common/LoadingSpinner";
import APIKeySetup from "../Auth/APIKeySetup";
import FeedbackPopup from "../Feedback/FeedbackPopup";
import { fileAPI, queryAPI } from "../../services/api";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAPIKeyCheck, setShowAPIKeyCheck] = useState(true);
  const [hasAPIKey, setHasAPIKey] = useState(false);

  const [activeView, setActiveView] = useState("upload");

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      if (user?.id) {
        const filesResponse = await fileAPI.getUserFiles(user.id);
        setUploadedFiles(filesResponse.files || []);

        const historyResponse = await queryAPI.getQueryHistory(user.id);
        setQueryHistory(historyResponse.queries || []);

        console.log("Loaded user data for:", user?.email);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file, metadata, preview) => {
    setCurrentFile({ file, metadata, preview });
    setUploadedFiles((prev) => [
      ...prev,
      { file, metadata, preview, uploadDate: new Date() },
    ]);
    setActiveView("query");
  };

  const handleNewQuery = async (query, result, executionTime) => {
    const newQuery = {
      id: Date.now(),
      query,
      result,
      timestamp: new Date(),
      fileName: currentFile?.metadata?.name,
    };
    setQueryHistory((prev) => [newQuery, ...prev]);

    try {
      if (user?.id) {
        const historyResponse = await queryAPI.getQueryHistory(user.id);
        setQueryHistory(historyResponse.queries || []);
      }
    } catch (error) {
      console.error("Error refreshing query history:", error);
    }
  };

  const handleAPIKeyVerified = () => {
    setShowAPIKeyCheck(false);
    setHasAPIKey(true);
    setActiveView("upload");
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-github-dark flex items-center justify-center">
        <LoadingSpinner size="xl" color="logocolor" />
      </div>
    );
  }

  if (showAPIKeyCheck) {
    return <APIKeySetup onAPIKeySet={handleAPIKeyVerified} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-github-dark flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        uploadedFiles={uploadedFiles}
        currentFile={currentFile}
        activeView={activeView}
        onViewChange={setActiveView}
        onFileSelect={setCurrentFile}
        onSignOut={handleSignOut}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <MainContent
          activeView={activeView}
          currentFile={currentFile}
          onFileUpload={handleFileUpload}
          onNewQuery={handleNewQuery}
          queryHistory={queryHistory}
          user={user}
        />
      </div>

      <FeedbackPopup user={user} />
    </div>
  );
};

export default Dashboard;
