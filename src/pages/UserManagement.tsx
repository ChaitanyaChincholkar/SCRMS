import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

const roleColors: Record<string, string> = {
  student: "bg-primary/10 text-primary border-primary/20",
  faculty: "bg-secondary/10 text-secondary border-secondary/20",
  admin: "bg-accent/10 text-accent border-accent/20",
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
};

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.user_id)?.role ?? "student",
        roleId: roles?.find((r) => r.user_id === p.user_id)?.id,
      }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, roleId, newRole }: { userId: string; roleId?: string; newRole: string }) => {
      if (roleId) {
        const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("id", roleId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "Role updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage user roles and permissions</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Users ({users?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users?.map((u: any, i: number) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={u.role}
                    onValueChange={(v) => updateRole.mutate({ userId: u.user_id, roleId: u.roleId, newRole: v })}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
