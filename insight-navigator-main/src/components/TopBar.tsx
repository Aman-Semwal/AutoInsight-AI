import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import NotificationsPopover from "./NotificationsPopover";

const TopBar = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search datasets, projects..." className="pl-10 bg-secondary/50 border-border/50 h-9 text-sm placeholder:text-muted-foreground/50" />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPopover />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
