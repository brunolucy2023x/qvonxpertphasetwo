"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  // =========================
  // AUTH STATE
  // =========================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know auth state

  // =========================
  // GET CURRENT SESSION
  // =========================
  const getUser = async () => {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (session?.user) {
      setIsAuthenticated(true);
      setAuthUser(session.user);

      // Fetch profile from DB
      await fetchUserProfile(session.user.id);
    } else {
      setIsAuthenticated(false);
      setAuthUser(null);
      setUserProfile(null);
    }

    setLoading(false);
  };

  // =========================
  // FETCH PROFILE FROM DB
  // =========================
  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", userId)
      .maybeSingle();

    if (!error) setUserProfile(data);
  };

  // =========================
  // JOB FORM STATE
  // =========================
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [salary, setSalary] = useState(0);
  const [activeEmploymentTypes, setActiveEmploymentTypes] = useState([]);
  const [salaryType, setSalaryType] = useState("Year");
  const [negotiable, setNegotiable] = useState(false);
  const [tags, setTags] = useState([]);
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState({
    country: "",
    city: "",
    address: "",
  });

  // =========================
  // FORM HANDLERS
  // =========================
  const handleTitleChange = (e) => setJobTitle(e.target.value.trimStart());
  const handleDescriptionChange = (e) =>
    setJobDescription(e.target.value.trimStart());
  const handleSalaryChange = (e) => setSalary(Number(e.target.value));

  const resetJobForm = () => {
    setJobTitle("");
    setJobDescription("");
    setSalary(0);
    setActiveEmploymentTypes([]);
    setSalaryType("Year");
    setNegotiable(false);
    setTags([]);
    setSkills([]);
    setLocation({ country: "", city: "", address: "" });
  };

  // =========================
  // INIT AUTH & LISTENER
  // =========================
  useEffect(() => {
    // Check session on mount
    getUser();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setAuthUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          setIsAuthenticated(false);
          setAuthUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        // Auth
        isAuthenticated,
        authUser,
        userProfile,
        loading,

        // Job form state
        jobTitle,
        jobDescription,
        salary,
        activeEmploymentTypes,
        salaryType,
        negotiable,
        tags,
        skills,
        location,

        // Handlers
        handleTitleChange,
        handleDescriptionChange,
        handleSalaryChange,
        setActiveEmploymentTypes,
        setSalaryType,
        setNegotiable,
        setTags,
        setSkills,
        setLocation,
        resetJobForm,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// =========================
// HOOK
// =========================
export const useGlobalContext = () => useContext(GlobalContext);