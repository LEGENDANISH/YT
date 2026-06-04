import axios from "axios";

export const fetchAboutMe = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get("http://localhost:8000/api/aboutme", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
};
