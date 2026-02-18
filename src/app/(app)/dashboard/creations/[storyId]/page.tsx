'use client';

import { useState } from 'react';
import { stories, artists, type Chapter } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PlusCircle, ArrowLeft, CalendarIcon, UploadCloud, FilePen, Trash2, MoreHorizontal, Users, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';


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
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Publié</Badge>;
      case 'Programmé':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Programmé</Badge>;
      case 'Brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const handleAddChapter = () => {
    toast({
      title: "Chapitre ajouté (Simulation)",
      description: "Votre nouveau chapitre a été sauvegardé comme brouillon.",
    });
    setOpen(false);
    setScheduledDate(undefined);
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 group">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour à l'atelier
      </Button>

      <Card className="border-none bg-muted/30">
        <CardHeader className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group">
                <Image
                src={story.coverImage.imageUrl}
                alt={story.title}
                width={200}
                height={300}
                className="rounded-xl object-cover aspect-[2/3] shadow-2xl transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/20">{story.format}</Badge>
                </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-display font-bold">{story.title}</h1>
                    {story.isPremium && <Badge className="bg-primary text-primary-foreground">PREMIUM</Badge>}
                </div>
                {artist && <p className="text-lg text-muted-foreground">Créé par <Link className="text-primary hover:underline font-semibold" href={`/artiste/${artist.slug}`}>{artist.name}</Link></p>}
              </div>
              <p className="text-base leading-relaxed text-foreground/80 max-w-2xl">{story.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/read/${story.id}`}>Voir comme un lecteur</Link>
                </Button>
                <Button variant="outline" size="sm">Éditer les infos</Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold font-display flex items-center gap-3">
                    <History className="text-primary h-8 w-8" />
                    Chapitres & Versions
                </h2>
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouveau Chapitre
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                    <DialogTitle>Ajouter un chapitre</DialogTitle>
                    <DialogDescription>
                        Préparez la sortie de votre prochain épisode.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="chapter-title">Titre du chapitre</Label>
                                <Input id="chapter-title" placeholder="Ex: L'Éveil" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chapter-version">Version (Versioning)</Label>
                                <Input id="chapter-version" placeholder="Ex: v1.0 ou Révisé" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Pages du chapitre</Label>
                            <div className="relative border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all group">
                                <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
                                <p className="text-muted-foreground mb-2 font-medium">Glissez vos planches ici</p>
                                <Button variant="secondary" size="sm" asChild>
                                    <label htmlFor="file-upload" className="cursor-pointer">Parcourir les fichiers</label>
                                </Button>
                                <input id="file-upload" type="file" multiple className="sr-only" />
                                <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold">Optimisation automatique des images active</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revision-note">Note de révision (Interne)</Label>
                            <Textarea id="revision-note" placeholder="Modifications apportées par rapport à la version précédente..." className="h-20" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schedule-date">Programmer la sortie (Optionnel)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {scheduledDate ? format(scheduledDate, 'PPP', { locale: fr }) : <span>Choisir une date de publication</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="ghost">Brouillon</Button>
                        <Button type="button" onClick={handleAddChapter}>Publier le chapitre</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>
            
            <Card className="border-none shadow-xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40%] pl-6 uppercase text-[10px] font-bold tracking-widest">Titre & Note</TableHead>
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest">Statut</TableHead>
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest">Version</TableHead>
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest">Date</TableHead>
                                <TableHead className="text-right pr-6 uppercase text-[10px] font-bold tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {story.chapters.length > 0 ? story.chapters.map((chapter) => (
                            <TableRow key={chapter.id} className="group">
                                <TableCell className="pl-6 py-4">
                                    <div className="font-bold text-base">{chapter.title}</div>
                                    {chapter.revisionNote && (
                                        <p className="text-[10px] text-muted-foreground italic flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-3 w-3" /> {chapter.revisionNote}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>{getStatusBadge(chapter.status)}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono text-[10px]">{chapter.version || 'v1.0'}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">{format(new Date(chapter.releaseDate), 'dd/MM/yy')}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem><FilePen className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                            <DropdownMenuItem><History className="mr-2 h-4 w-4" />Historique versions</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                        Aucun chapitre publié pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <aside className="space-y-8">
            <Card className="border-none shadow-xl bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Équipe Créative
                    </CardTitle>
                    <CardDescription>Gérez les accès de vos collaborateurs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary">
                                <AvatarImage src={artist?.avatar.imageUrl} />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-sm">Vous</p>
                                <p className="text-[10px] uppercase font-bold text-primary">Auteur Principal</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Propriétaire</Badge>
                    </div>

                    {story.collaborators?.map(collab => (
                        <div key={collab.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border group">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={collab.avatar.imageUrl} />
                                    <AvatarFallback>{collab.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-xs">{collab.name}</p>
                                    <p className="text-[9px] uppercase font-medium text-muted-foreground">{collab.role}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="pt-0">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all">
                                <PlusCircle className="mr-2 h-4 w-4" /> Inviter un membre
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Inviter un collaborateur</DialogTitle>
                                <DialogDescription>Assignez un rôle et envoyez une invitation.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input placeholder="artist@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rôle</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="writer">Scénariste</SelectItem>
                                            <SelectItem value="artist">Dessinateur</SelectItem>
                                            <SelectItem value="colorist">Coloriste</SelectItem>
                                            <SelectItem value="illustrator">Illustrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button className="w-full">Envoyer l'invitation</Button>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Card className="border-none shadow-xl bg-primary/5 border-primary/10">
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest font-bold">Aide à la publication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className="bg-primary/20 p-2 rounded-lg"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                        <p className="text-xs leading-relaxed">Utilisez le <strong>Versioning</strong> pour garder une trace de vos corrections visuelles.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                        <div className="bg-primary/20 p-2 rounded-lg"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                        <p className="text-xs leading-relaxed">Les chapitres <strong>Programmés</strong> sont publiés automatiquement à minuit le jour J.</p>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  )
}
