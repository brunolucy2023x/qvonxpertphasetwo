import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const GlobalContext = createContext();

// =========================
// AXIOS CONFIG (SAFE)
// =========================
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://qvonxpert.com";

axios.defaults.withCredentials = true;

export const GlobalContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth0User, setAuth0User] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // FORM STATE (UNCHANGED)
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
  // AUTH CHECK (EXISTING BACKEND)
  // =========================
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/v1/check-auth");

        setIsAuthenticated(res.data.isAuthenticated);
        setAuth0User(res.data.user);
      } catch (error) {
        console.log("Error checking auth", error);
        setIsAuthenticated(false);
        setAuth0User(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // =========================
  // USER PROFILE FETCH
  // =========================
  const getUserProfile = async (id) => {
    if (!id) return;

    try {
      const res = await axios.get(`/api/v1/user/${id}`);
      setUserProfile(res.data);
    } catch (error) {
      console.log("Error getting user profile", error);
    }
  };

  // =========================
  // INPUT HANDLERS
  // =========================
  const handleTitleChange = (e) =>
    setJobTitle(e.target.value.trimStart());

  const handleDescriptionChange = (e) =>
    setJobDescription(e.target.value.trimStart());

  const handleSalaryChange = (e) => setSalary(e.target.value);

  // =========================
  // RESET FORM
  // =========================
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
  // AUTO PROFILE LOAD
  // =========================
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      getUserProfile(auth0User.sub);
    }
  }, [isAuthenticated, auth0User]);

  // =========================
  // CONTEXT VALUE
  // =========================
  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated,
        auth0User,
        userProfile,
        getUserProfile,
        loading,

        // form
        jobTitle,
        jobDescription,
        salary,
        activeEmploymentTypes,
        salaryType,
        negotiable,
        tags,
        skills,
        location,

        // setters
        handleTitleChange,
        handleDescriptionChange,
        handleSalaryChange,
        setActiveEmploymentTypes,
        setJobDescription,
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

export const useGlobalContext = () => useContext(GlobalContext);