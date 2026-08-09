import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Compact "Edit profile" entry point for the role dashboard headers.
 * Renders only for signed-in users that actually have a `providers` row.
 */
const EditProfileHeaderButton = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setHasProvider(false);
      return;
    }
    supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setHasProvider(!!data);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!hasProvider) return null;

  return (
    <button
      onClick={() => navigate("/edit-profile")}
      className="flex items-center gap-1 text-xs font-medium bg-white/20 rounded-full px-2.5 py-1"
    >
      <Pencil className="w-3 h-3" />
      {lang === "ar" ? "تعديل الملف" : "Edit profile"}
    </button>
  );
};

export default EditProfileHeaderButton;
