import { useEffect } from "react";
import supabase from "../../utils/supabaseClient";

export default function TestSupabase() {
  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching profiles:", error.message);
      } else {
        console.log("Profiles:", data);
      }
    }

    fetchProfiles();
  }, []);

  return <p>Check the console for profiles data</p>;
}
