'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Flame, Timer, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

export function RewardedAdModal({ isOpen, onClose, onReward }: RewardedAdModalProps) {
  const [countdown, setCountdown] = useState(6);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setCountdown(6);
      setIsCompleted(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
    }
  }, [isOpen, countdown]);

  const handleClaim = () => {
    onReward();
    toast({
      title: "Récompense obtenue !",
      description: "+1 AfriCoin ajouté à votre solde.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && countdown === 0 && onClose()}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden border-none bg-stone-950 shadow-2xl rounded-[2rem]">
        <div className="relative overflow-hidden aspect-video bg-stone-900">
          <video 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/demo/video/upload/v1/samples/sea_turtle.mp4"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 flex items-center gap-2">
              <Timer className="h-3 w-3 text-primary" /> {countdown}s
            </Badge>
          </div>
        </div>

        <div className="p-8 text-center space-y-6">
          <DialogHeader className="space-y-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-display font-black text-white">Pub Récompensée</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs italic font-light">
              "Regardez cette courte séquence pour soutenir vos artistes et gagner un coin."
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isCompleted ? (
              <div className="space-y-2">
                <Progress value={(6 - countdown) * (100 / 6)} className="h-1.5 bg-white/5" />
                <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest">Génération du AfriCoin...</p>
              </div>
            ) : (
              <Button 
                onClick={handleClaim} 
                className="w-full h-12 rounded-xl bg-primary text-black font-black gold-shimmer animate-in zoom-in-95 duration-300"
              >
                Récupérer mon 🪙
              </Button>
            )}
          </div>

          <div className="flex justify-center items-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-[8px] font-bold text-stone-600 uppercase tracking-widest">
              <ShieldCheck className="h-2.5 w-2.5" /> Ad-Safe
            </div>
            <div className="h-1 w-1 rounded-full bg-stone-800" />
            <div className="flex items-center gap-1 text-[8px] font-bold text-stone-600 uppercase tracking-widest">
              <Flame className="h-2.5 w-2.5" /> +1 Exp
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className }: any) {
  return <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold", className)}>{children}</span>;
}
