'use client';

import { useState, use, useEffect } from 'react';
import { stories, artists, comments as allComments, readers, type Story, type Artist, type Chapter } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, Heart, Star, Share2, Bookmark, Play, Edit, ChevronsDown, MessageSquare, ThumbsUp, AlertTriangle, ArrowDown, ChevronRight, Check, Coins, Lock, Award } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

function HeroSection({ story, artist, collaborators }: { story: Story, artist: Artist, collaborators: any[] }) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié dans le presse-papiers" });
  };
  
  return (
    <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-pattern"></div>
        <div className="hero-deco"></div>

        {/* Particles */}
        <div className="particle" style={{top:'40%',left:'55%', animationDuration:'7s', animationDelay:'0s', '--tx': '20px', '--ty': '-40px', '--tx2': '50px', '--ty2': '-120px'} as React.CSSProperties}></div>
        <div className="particle" style={{top:'60%',left:'48%', animationDuration:'9s', animationDelay:'1.5s', '--tx': '-15px', '--ty': '-30px', '--tx2': '-40px', '--ty2': '-100px'} as React.CSSProperties}></div>
        <div className="particle" style={{top:'35%',left:'62%', animationDuration:'6s', animationDelay:'3s', '--tx': '30px', '--ty': '-50px', '--tx2': '60px', '--ty2': '-140px'} as React.CSSProperties}></div>

        <div className="cover-art-hero">
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" data-ai-hint={story.coverImage.imageHint} priority />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {story.isPremium && <Badge className="cover-badge" variant="outline">NexusHub Pro ✦ Original</Badge>}
        </div>

        <div className="hero-fade"></div>
        <div className="hero-bottom-fade"></div>

        <div className="hero-content">
            <div className="hero-eyebrow">
                <Link href="/stories" className="no-underline">
                    <Badge variant="outline" className="hero-type-badge">Webtoon</Badge>
                </Link>
                <Badge variant="secondary" className="hero-status-badge">
                    <span className="status-dot"></span> En cours
                </Badge>
                {story.isPremium && <Badge className="hero-pro-badge">NexusHub Pro</Badge>}
            </div>

            <h1 className="hero-title">{story.title}</h1>
            <p className="hero-subtitle">La Saga des Dieux Oubliés</p>

            <div className="hero-meta-row">
                 <Link href={`/artists/${artist.id}`} className="author-chip">
                    <Avatar className="author-chip-av">
                        <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="author-chip-name">{artist.name}</div>
                        <div className="author-chip-role">Auteur · Dessinateur</div>
                    </div>
                </Link>
                {collaborators.map(c => (
                     <Link key={c.id} href={`/artists/${c.id}`} className="author-chip">
                        <Avatar className="author-chip-av">
                            <AvatarImage src={c.avatar.imageUrl} alt={c.name} />
                            <AvatarFallback>{c.name.slice(0,1)}</AvatarFallback>
                        </Avatar>
                         <div>
                            <div className="author-chip-name">{c.name}</div>
                            <div className="author-chip-role">{c.role}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="hero-genre-tags">
                {story.tags.map(tag => (
                    <Link key={tag} href={`/stories?genre=${tag}`} className="genre-tag">{tag}</Link>
                ))}
            </div>
            
            <a href="#reviews-section" className="hero-rating no-underline transition-opacity hover:opacity-80">
                <div className="stars-display">
                    {[...Array(4)].map((_, i) => <Star key={i} className="star-icon fill-current" />)}
                    <Star className="star-icon half" />
                </div>
                <span className="rating-val">4.8</span>
                <span className="rating-count">· 3,842 évaluations</span>
            </a>


            <p className="hero-synopsis">{story.description}</p>
            
            <div className="hero-stats">
                <div className="hero-stat">
                    <span className="val">{formatStat(story.views)}</span>
                    <span className="lbl">Lectures</span>
                </div>
                <Separator orientation="vertical" className="stat-sep" />
                <div className="hero-stat">
                    <span className="val">{formatStat(story.likes)}</span>
                    <span className="lbl">Likes</span>
                </div>
                <Separator orientation="vertical" className="stat-sep" />
                <div className="hero-stat">
                    <span className="val">{story.chapters.length}</span>
                    <span className="lbl">Chapitres</span>
                </div>
                <Separator orientation="vertical" className="stat-sep" />
                <div className="hero-stat">
                    <span className="val">{formatStat(story.subscriptions)}</span>
                    <span className="lbl">Abonnés</span>
                </div>
                 <Separator orientation="vertical" className="stat-sep" />
                 <div className="hero-stat">
                    <span className="val">#2</span>
                    <span className="lbl">Tendance</span>
                </div>
            </div>

            <div className="hero-ctas">
                <Button asChild className="cta-primary">
                    <Link href={`/read/${story.id}`}>
                        <Play className="fill-current"/> Commencer la lecture
                    </Link>
                </Button>
                 <Button className="cta-secondary" onClick={() => toast({title: "Fonctionnalité à venir"})}>
                    <Eye /> Reprendre (Chap. 7)
                </Button>
                <Button className="cta-icon-btn" onClick={handleBookmark} title="Sauvegarder">
                    <Bookmark className={cn(isBookmarked && "fill-current")} />
                </Button>
                <Button className="cta-icon-btn" onClick={handleShare} title="Partager">
                    <Share2 />
                </Button>
            </div>
        </div>
    </section>
  );
}

const PremiumBanner = ({ story, artist }: { story: Story, artist: Artist }) => {
    const { toast } = useToast();
    return (
         <div className="premium-banner fade-in">
            <Lock className="premium-icon" />
            <div className="premium-text" style={{flex:1}}>
                <h3>2 chapitres exclusifs disponibles</h3>
                <p>Abonnez-vous à NexusHub Pro pour accéder aux chapitres 8 & 9 en avant-première et soutenir directement {artist.name}.</p>
                <Button className="premium-cta" onClick={() => toast({title: "Redirection vers l'abonnement Pro"})}>Débloquer pour 2,99€/mois</Button>
            </div>
        </div>
    );
};

const ChapterRow = ({ chapter, storyId }: { chapter: Chapter, storyId: string }) => {
    const isNew = chapter.status === 'Programmé'; // Simplified logic
    const isPremium = chapter.id.includes('premium'); // Mock logic
    const isRead = chapter.status === 'Publié'; // Mock logic
    const [viewCount, setViewCount] = useState<number | null>(null);

    useEffect(() => {
        // This runs only on the client, after the initial render, preventing hydration mismatch.
        setViewCount(Math.floor(Math.random() * 50));
    }, []);

    return (
        <Link href={`/read/${storyId}`} className={cn("chapter-row", isNew && "new", isPremium && "premium")}>
            <div className="ch-num">{isPremium ? <Lock size={14}/> : chapter.id.split('-')[1]}</div>
            <div className="ch-info">
                <div className="ch-title">{chapter.title}</div>
                <div className="ch-meta">
                    <span>{chapter.releaseDate}</span>·<span>{chapter.pageCount} pages</span>
                    {isRead && <div className="ch-read-bar"><div className="ch-read-fill" style={{width: '100%'}}></div></div>}
                </div>
            </div>
            <div className="ch-right">
                <span className="ch-views">
                    {viewCount !== null ? `${viewCount}k vues` : `...`}
                </span>
                {isNew && <Badge className="ch-tag tag-new">Nouveau</Badge>}
                {isPremium && <Badge className="ch-tag tag-premium">Premium</Badge>}
                {isRead && !isPremium && !isNew && <Badge className="ch-tag tag-read">Lu</Badge>}
            </div>
        </Link>
    )
}

const ChaptersSection = ({ story }: { story: Story }) => {
    const { toast } = useToast();
    const [activeFilter, setActiveFilter] = useState('Tous');
    const filters = ['Tous', 'Gratuits', 'Premium'];

    return (
         <div className="chapters-block fade-in">
            <div className="section-heading">
                <div className="section-gold-dot"></div>
                <h2>Chapitres</h2>
                <div className="section-line"></div>
                <span className="text-sm text-muted-foreground">{story.chapters.length} chapitres</span>
            </div>

            <div className="chapters-toolbar">
                <div className="chapters-filter">
                    {filters.map(filter => (
                        <Button
                            key={filter}
                            variant="ghost"
                            className={cn("filter-btn", activeFilter === filter && "active")}
                            onClick={() => {
                                setActiveFilter(filter);
                                // toast({ title: `Filtre "${filter}" appliqué` });
                            }}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
                 <Button variant="ghost" className="filter-btn" onClick={() => toast({title: "Fonctionnalité à venir"})}>↕ Ordre</Button>
            </div>
            
             <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="volume-label">
                       <span className="vol-title">Volume I — L'Éveil</span>
                       <span className="vol-meta">Chap. 1–{story.chapters.length}</span>
                       <ChevronRight className="vol-chevron" />
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <div className="chapters-list">
                            {story.chapters.map(chapter => (
                                <ChapterRow key={chapter.id} chapter={chapter} storyId={story.id} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


            <Button variant="outline" className="load-more-chapters" onClick={() => toast({title: "Fonctionnalité à venir"})}>
                <ChevronsDown />
                Voir la liste complète ({story.chapters.length} chapitres)
            </Button>
        </div>
    )
}

const ReviewsSection = ({ storyId }: { storyId: string }) => {
    const { toast } = useToast();
    const storyComments = allComments.filter(c => c.storyId === storyId);

    // Mock data for rating bars
    const ratingDistribution = [
        { star: 5, count: 2766, width: "72%" },
        { star: 4, count: 691, width: "18%" },
        { star: 3, count: 269, width: "7%" },
        { star: 2, count: 77, width: "2%" },
        { star: 1, count: 39, width: "1%" },
    ];
    
    return (
        <div id="reviews-section" className="reviews-block fade-in scroll-mt-20">
             <div className="section-heading">
                <div className="section-gold-dot"></div>
                <h2>Évaluations</h2>
                <div className="section-line"></div>
                <span className="text-sm text-muted-foreground">3,842 avis</span>
            </div>

            <div className="rating-overview">
                 <div className="big-rating">
                    <div className="big-rating-val">4.8</div>
                    <div className="big-stars">
                        {[...Array(4)].map((_, i) => <Star key={i} className="big-star fill-current" />)}
                        <Star className="big-star empty" />
                    </div>
                    <div className="big-rating-count">sur 3,842 évaluations</div>
                </div>
                <div className="rating-bars">
                    {ratingDistribution.map(item => (
                         <div key={item.star} className="rating-bar-row">
                            <span className="bar-label">{item.star}</span>
                            <div className="bar-track"><div className="bar-fill" style={{width: item.width}}></div></div>
                            <span className="bar-count">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {storyComments.slice(0, 2).map(comment => (
                 <div key={comment.id} className="review-card">
                    <div className="review-header">
                        <div className="reviewer-info">
                            <Avatar className="reviewer-av">
                                <AvatarImage src={comment.authorAvatar.imageUrl} />
                                <AvatarFallback>{comment.authorName.slice(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="reviewer-name">
                                    {comment.authorName} <Badge variant="secondary">Supporter</Badge>
                                </p>
                                <p className="reviewer-meta">
                                    <span>Lagos, Nigeria</span>·<span>284 avis</span>
                                </p>
                            </div>
                        </div>
                        <div className="review-stars">
                             {[...Array(5)].map((_, i) => <Star key={i} className="r-star fill-current" />)}
                        </div>
                    </div>
                    <p className="review-title">Une œuvre qui redéfinit la BD africaine</p>
                    <p className="review-body">{comment.content}</p>
                     <div className="review-footer">
                        <Button variant="ghost" className="review-action" onClick={() => toast({title: "Action enregistrée"})}>
                            <ThumbsUp /> Utile ({comment.likes})
                        </Button>
                        <Button variant="ghost" className="review-action" onClick={() => toast({title: "Fonctionnalité à venir"})}>Répondre</Button>
                        <Button variant="ghost" className="review-action" style={{marginLeft:'auto', opacity: 0.5}} onClick={() => toast({title: "Commentaire signalé", variant: "destructive"})}>
                            <AlertTriangle /> Signaler
                        </Button>
                    </div>
                </div>
            ))}
             <Button variant="outline" className="write-review-btn" onClick={() => toast({title: "Fonctionnalité à venir"})}>
                ✦ Écrire un avis · Donner une note
            </Button>
        </div>
    )
}

const SimilarStoryCard = ({ story }: { story: Story }) => (
    <Link href={`/stories/${story.id}`} className="similar-card">
        <Card className="similar-cover">
             <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
             {story.isPremium && <Badge className="similar-premium-badge">PRO</Badge>}
        </Card>
        <div className="similar-title">{story.title}</div>
        <div className="similar-author">{story.artistName}</div>
        <Badge variant="outline" className="similar-genre">{story.genre}</Badge>
    </Link>
);


const SimilarWorksSection = ({ currentStoryId }: { currentStoryId: string }) => {
    const similarStories = stories.filter(s => s.id !== currentStoryId).slice(0, 5);
    return (
        <div className="similar-block fade-in">
             <div className="section-heading">
                <div className="section-gold-dot"></div>
                <h2>Dans le même univers</h2>
                <div className="section-line"></div>
                <Link href="/stories" className="text-sm text-primary">Voir plus ›</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {similarStories.map(s => <SimilarStoryCard key={s.id} story={s} />)}
            </div>
        </div>
    )
}

const RightSidebar = ({ story, artist }: { story: Story, artist: Artist }) => {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    
    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        toast({ title: isFollowing ? `Vous ne suivez plus ${artist.name}` : `Vous suivez maintenant ${artist.name}` });
    };

    const communityActivity = [
        {
            id: 'act-1',
            user: { name: 'Aminata_K', avatar: readers.find(r => r.id === 'reader-1')?.avatar },
            action: 'a laissé un commentaire sur',
            target: 'Chap. 7',
            time: 'il y a 2 minutes',
            link: `/stories/${story.id}#reviews-section`,
            userLink: '/profile/reader-1'
        },
        {
            id: 'act-2',
            user: { name: 'Ola_reads', avatar: readers.find(r => r.id === 'reader-2')?.avatar },
            action: 'a aimé la série',
            target: '',
            time: 'il y a 8 minutes',
            link: '#',
            userLink: '/profile/reader-2'
        },
        {
            id: 'act-3',
            user: { name: 'KofiBD', avatar: readers.find(r => r.id === 'reader-3')?.avatar },
            action: 'a publié une évaluation 5★',
            target: '',
            time: 'il y a 23 minutes',
            link: `#reviews-section`,
            userLink: '/profile/reader-3'
        },
        {
            id: 'act-4',
            user: { name: 'Jelani Adebayo', avatar: artist.avatar },
            action: 'a publié',
            target: 'Chapitre 7 🎉',
            time: 'il y a 3h',
            link: `/read/${story.id}`,
            userLink: `/artists/${artist.id}`
        }
    ];

    return (
        <div className="right-col">
            <div className="sticky-col">
                <Card className="artist-hero-card">
                    <div className="artist-card-banner"></div>
                    <CardContent className="artist-card-body">
                         <Avatar className="artist-av-lg">
                            <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                            <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                             <div className="artist-verified-badge"><Check size={12} /></div>
                        </Avatar>
                        <p className="artist-name">{artist.name}</p>
                        <p className="artist-role">Auteur Principal · Artiste Pro Certifié</p>
                        <div className="artist-stats-row">
                             <div className="art-stat"><span className="v">{formatStat(artist.portfolio.length * 25000)}</span><span className="l">Abonnés</span></div>
                             <div className="art-stat"><span className="v">{formatStat(story.views)}</span><span className="l">Vues</span></div>
                             <div className="art-stat"><span className="v">{artist.portfolio.length}</span><span className="l">Séries</span></div>
                        </div>
                        <p className="artist-bio-sm">"{artist.bio.slice(0,100)}..."</p>
                         <div className="artist-btns">
                            <Button className={cn("artist-follow-btn", isFollowing && "following")} onClick={handleFollow}>
                                {isFollowing ? '✓ Abonné' : '+ Suivre l\'artiste'}
                            </Button>
                            <Button variant="ghost" className="artist-more-btn" onClick={() => toast({title: `Ajouté aux artistes favoris`})}>
                                <Heart />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="afri-widget">
                    <CardHeader className="p-0 mb-2">
                        <CardTitle className="afri-title"><Coins /> Soutenir l'artiste</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <p className="afri-sub">Envoyez des AfriCoins directement à {artist.name} pour ce chapitre ou la série entière.</p>
                        <div className="coin-row">
                            {[10, 50, 100, 500].map(amount => (
                                <Button key={amount} variant="outline" className="coin-opt" onClick={() => toast({title: `${amount} AfriCoins envoyés !`})}>{amount} 🪙</Button>
                            ))}
                        </div>
                        <Button className="coin-send" onClick={() => toast({title: "50 AfriCoins envoyés !"})}>Envoyer des AfriCoins</Button>
                    </CardContent>
                </Card>

                <Card className="side-card">
                    <CardHeader className="side-card-header">Informations</CardHeader>
                    <CardContent className="side-card-body">
                         <div className="info-table">
                            <div className="info-row"><span className="info-key">Type</span><span className="info-val">Webtoon · BD Numérique</span></div>
                            <div className="info-row"><span className="info-key">Statut</span><span className="info-val text-green-400">● En cours</span></div>
                            <div className="info-row"><span className="info-key">Sortie</span><span className="info-val">1er Janvier 2026</span></div>
                            <div className="info-row"><span className="info-key">Mise à jour</span><span className="info-val">Bimensuelle · Vendredi</span></div>
                            <div className="info-row"><span className="info-key">Tags</span>
                                <div className="info-val">
                                    {story.tags.map(tag => (
                                        <Link key={tag} href={`/stories?genre=${tag}`}>
                                            <Badge variant="outline" className="tag-pill cursor-pointer">{tag}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="info-row"><span className="info-key">Licence</span><span className="info-val">© NexusHub Pro · Tous droits réservés</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="side-card">
                    <CardHeader className="side-card-header">
                        <span>Activité récente</span>
                        <span className="text-xs text-muted-foreground/60">En direct</span>
                    </CardHeader>
                    <CardContent className="side-card-body">
                        <div className="flex flex-col">
                            {communityActivity.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <Link href={activity.userLink} className="flex-shrink-0">
                                        <Avatar className="activity-av">
                                            <AvatarImage src={activity.user.avatar?.imageUrl} alt={activity.user.name} />
                                            <AvatarFallback>{activity.user.name.slice(0,1)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="activity-text">
                                        <p>
                                            <Link href={activity.userLink} className="font-semibold text-foreground hover:text-primary">
                                                {activity.user.name}
                                            </Link>
                                            {' '}{activity.action}{' '}
                                            {activity.target && (
                                                <Link href={activity.link} className="font-semibold text-primary hover:underline">
                                                    {activity.target}
                                                </Link>
                                            )}
                                        </p>
                                        <div className="activity-time">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function StoryDetailPage(props: { params: { storyId: string } }) {
  const params = use(props.params);

  const story = stories.find((s) => s.id === params.storyId);

  if (!story) {
    notFound();
  }
  
  const artist = artists.find((a) => a.id === story.artistId);
  if(!artist) {
    notFound();
  }
  
  const collaborators = story.collaborators || [];
  
  return (
    <div>
        <HeroSection story={story} artist={artist} collaborators={collaborators}/>
        <div className="main-body">
            <div className="left-col">
                {story.isPremium && <PremiumBanner story={story} artist={artist} />}
                <ChaptersSection story={story} />
                <ReviewsSection storyId={story.id} />
                <SimilarWorksSection currentStoryId={story.id} />
            </div>
            <RightSidebar story={story} artist={artist} />
        </div>
    </div>
  );
}
