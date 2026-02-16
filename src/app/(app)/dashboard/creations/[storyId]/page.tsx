'use client';

import { useState } from 'react';
import { stories, artists, type Chapter } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle, ArrowLeft, CalendarIcon, UploadCloud, FilePen, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function ManageStoryPage({ params }: { params: { storyId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const story = stories.find(s => s.id === params.storyId);
  if (!story) {
    notFound();
  }

  const artist = artists.find(a => a.id === story.artistId);

  const getStatusBadge = (status: Chapter['status']) => {
    switch (status) {
      case 'Publié':
        return <Badge variant="default">Publié</Badge>;
      case 'Programmé':
        return <Badge variant="secondary">Programmé</Badge>;
      case 'Brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const handleAddChapter = () => {
    // In a real app, this would handle form submission
    toast({
      title: "Chapitre ajouté (Simulation)",
      description: "Votre nouveau chapitre a été sauvegardé comme brouillon.",
    });
    setOpen(false);
    setScheduledDate(undefined);
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'atelier
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Image
              src={story.coverImage.imageUrl}
              alt={story.title}
              width={200}
              height={300}
              className="rounded-lg object-cover aspect-[2/3] shadow-lg"
            />
            <div className="flex-1">
              <CardTitle className="text-4xl font-display mb-2">{story.title}</CardTitle>
              {artist && <p className="text-lg text-muted-foreground">par {artist.name}</p>}
              <CardDescription className="mt-4 text-base leading-relaxed">{story.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-display">Gestion des chapitres</h2>
             <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un chapitre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Nouveau chapitre</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau chapitre à votre œuvre. Vous pouvez le publier immédiatement ou programmer sa sortie.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter-title">Titre du chapitre</Label>
                    <Input id="chapter-title" placeholder="Ex: Le commencement" />
                  </div>
                  <div className="space-y-2">
                     <Label>Pages du chapitre</Label>
                     <div className="relative border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Glissez-déposez vos images ici, ou</p>
                        <Button variant="outline" asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                Parcourir les fichiers
                            </label>
                        </Button>
                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" />
                        <p className="text-xs text-muted-foreground mt-4">PNG, JPG, GIF jusqu'à 10MB. Les images sont compressées automatiquement.</p>
                     </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="schedule-date">Planifier la sortie (optionnel)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !scheduledDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                  <Button type="button" variant="secondary">
                    Enregistrer le brouillon
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" onClick={handleAddChapter}>
                      Publier le chapitre
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        
        <Card>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[50%]">Titre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de sortie</TableHead>
                        <TableHead className="text-center">Pages</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {story.chapters.length > 0 ? story.chapters.map((chapter) => (
                        <TableRow key={chapter.id}>
                            <TableCell className="font-medium">{chapter.title}</TableCell>
                            <TableCell>{getStatusBadge(chapter.status)}</TableCell>
                            <TableCell>{format(new Date(chapter.releaseDate), 'dd MMMM yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-center">{chapter.pageCount}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Ouvrir le menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem><FilePen className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Aucun chapitre pour l'instant. Commencez par en ajouter un !
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
