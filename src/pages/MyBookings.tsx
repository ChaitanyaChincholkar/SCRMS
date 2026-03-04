import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, XCircle, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, resources(name, type, location)").eq("user_id", user!.id).order("booking_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast({ title: "Booking cancelled" });
    },
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage your resource bookings</p>
      </motion.div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking: any, i: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="glass-card-hover">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{booking.resources?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.booking_date} · {booking.start_time} - {booking.end_time}
                      </p>
                      {booking.purpose && <p className="text-xs text-muted-foreground mt-0.5">{booking.purpose}</p>}
                      {booking.admin_notes && <p className="text-xs text-primary mt-0.5">Admin: {booking.admin_notes}</p>}
                      {booking.checked_in && (
                        <Badge variant="outline" className="mt-1 bg-success/10 text-success border-success/20 text-[10px]">
                          ✓ Checked In
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[11px] ${statusColor[booking.status]}`}>{booking.status}</Badge>

                    {/* QR Code for approved bookings */}
                    {booking.status === "approved" && booking.qr_code && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <QrCode className="w-3.5 h-3.5 mr-1" /> QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs">
                          <DialogHeader>
                            <DialogTitle className="font-heading text-center">Booking QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-card rounded-xl border">
                              <QRCodeSVG value={booking.qr_code} size={180} level="H" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">{booking.resources?.name}</p>
                              <p className="text-xs text-muted-foreground">{booking.booking_date} · {booking.start_time}</p>
                              <p className="text-[10px] text-muted-foreground mt-2 font-mono">{booking.qr_code}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {booking.status === "pending" && (
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => cancelMutation.mutate(booking.id)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
