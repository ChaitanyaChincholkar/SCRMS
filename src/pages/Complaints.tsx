import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus } from "lucide-react";
import { motion } from "framer-motion";

const complaintStatusColor: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const Complaints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");

  const { data: complaints } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*, resources(name)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: resources } = useQuery({
    queryKey: ["resources-list"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("id, name");
      return data ?? [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("complaints").insert({
        user_id: user!.id, subject, description,
        resource_id: selectedResource || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      toast({ title: "Complaint submitted" });
      setDialogOpen(false); setSubject(""); setDescription(""); setSelectedResource("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">Complaints</h1>
          <p className="text-sm text-muted-foreground mt-1">Report issues with campus resources</p>
        </motion.div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg border-0 font-semibold"><Plus className="w-4 h-4 mr-2" /> New Complaint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Submit a Complaint</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Related Resource (optional)</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select resource" /></SelectTrigger>
                  <SelectContent>
                    {resources?.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." rows={4} />
              </div>
              <Button onClick={() => submitMutation.mutate()} className="w-full gradient-bg border-0 font-semibold h-11" disabled={!subject || !description}>Submit Complaint</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {complaints && complaints.length > 0 ? (
        <div className="space-y-3">
          {complaints.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="glass-card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{c.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                      {c.resources?.name && <p className="text-xs text-primary mt-1">Resource: {c.resources.name}</p>}
                      {c.admin_response && (
                        <div className="mt-2 p-2.5 rounded-lg bg-muted/50 text-sm">
                          <span className="font-medium text-xs">Admin Response:</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.admin_response}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-[11px] ${complaintStatusColor[c.status]}`}>{c.status.replace("_", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No complaints filed yet.</p>
        </div>
      )}
    </div>
  );
};

export default Complaints;
