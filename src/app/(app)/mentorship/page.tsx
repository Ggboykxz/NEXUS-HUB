'use client';

import { artists } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Award, Mic, Calendar, Trophy, Sparkles } from 'lucide-react';

export default function MentorshipPage() {
  const mentors = artists.filter(artist => artist.isMentor);

  const features = [
    {
      icon: Mic,
      title: 'Masterclass en direct',
      description: 'Apprenez des meilleurs lors de sessions interactives en direct sur des sujets variés comme la narration, le character design ou la publication.'
    },
    {
      icon: Calendar,
      title: 'Ateliers mensuels',
      description: 'Participez à des ateliers pratiques pour développer vos compétences, recevoir des critiques constructives et affiner votre style.'
    },
    {
      icon: Trophy,
      title: 'Défis de création',
      description: 'Relevez des défis stimulants pour booster votre créativité, expérimenter de nouvelles techniques et gagner en visibilité.'
    },
    {
      icon: Award,
      title: 'Concours sponsorisés',
      description: 'Tentez votre chance dans des concours exclusifs avec des prix offerts par nos partenaires et gagnez une reconnaissance professionnelle.'
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-16">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Programme de Mentorat AfriStory</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Un pont entre les talents confirmés et la nouvelle génération. Nos artistes Pro partagent leur expérience pour aider les créateurs Draft à atteindre leur plein potentiel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
         <h2 className="text-3xl font-bold font-display mb-12">Nos Mentors</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 max-w-4xl mx-auto">
            {mentors.map((mentor) => (
              <Link key={mentor.id} href={`/artists/${mentor.id}`} className="group flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4 transition-all duration-300 group-hover:ring-4">
                    <AvatarImage src={mentor.avatar.imageUrl} alt={mentor.name} data-ai-hint={mentor.avatar.imageHint} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{mentor.name}</h3>
              </Link>
            ))}
          </div>
      </div>
    </div>
  );
}
