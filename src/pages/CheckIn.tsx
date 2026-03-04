import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const CheckIn = () => {
  const [qrInput, setQrInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentCheckins } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, resources(name), profiles!bookings_user_id_fkey(full_name)")
        .eq("checked_in", true)
        .order("checked_in_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (code: string) => {
      // Find booking with this QR code
      const { data: booking, error: findError } = await supabase
        .from("bookings")
        .select("*, resources(name)")
        .eq("qr_code", code)
        .eq("status", "approved")
        .maybeSingle();

      if (findError) throw findError;
      if (!booking) throw new Error("Invalid QR code or booking not approved");
      if ((booking as any).checked_in) throw new Error("Already checked in");

      // Mark as checked in
      const { error } = await supabase
        .from("bookings")
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq("id", booking.id);
      if (error) throw error;

      return booking;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["recent-checkins"] });
      toast({
        title: "Check-in successful!",
        description: `Checked in for ${(booking as any).resources?.name}`,
      });
      setQrInput("");
    },
    onError: (e: any) => {
      toast({ title: "Check-in failed", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">QR Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan or enter QR codes to verify bookings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card max-w-lg">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Verify Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter or paste QR code..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="h-11 font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && qrInput && checkInMutation.mutate(qrInput)}
              />
              <Button
                onClick={() => qrInput && checkInMutation.mutate(qrInput)}
                disabled={!qrInput || checkInMutation.isPending}
                className="gradient-bg border-0 h-11 px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter the QR code value from the student's approved booking to check them in.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-heading">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckins && recentCheckins.length > 0 ? (
              <div className="space-y-2">
                {recentCheckins.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{b.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{b.resources?.name} · {b.booking_date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[11px]">
                        Checked In
                      </Badge>
                      {b.checked_in_at && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(b.checked_in_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No check-ins yet today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckIn;
