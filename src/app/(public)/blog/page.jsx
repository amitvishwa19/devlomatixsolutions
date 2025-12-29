import { Calendar, Clock, ArrowRight, User, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const featuredPost = {
    title: 'Understanding Heart Health: Prevention Tips for a Stronger Heart',
    excerpt: 'Heart disease remains the leading cause of death worldwide. Learn how simple lifestyle changes can dramatically reduce your risk and improve your cardiovascular health.',
    image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2032&auto=format&fit=crop',
    category: 'Cardiology',
    author: 'Dr. James Rodriguez',
    date: 'Dec 20, 2024',
    readTime: '8 min read',
};

const posts = [
    {
        title: 'Mental Health Matters: Breaking the Stigma',
        excerpt: 'Exploring the importance of mental health awareness and resources available for those seeking help.',
        image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=600&auto=format&fit=crop',
        category: 'Mental Health',
        author: 'Dr. Emily Chen',
        date: 'Dec 18, 2024',
        readTime: '6 min read',
        color: 'from-purple-500 to-indigo-500',
    },
    {
        title: 'Pediatric Nutrition: Building Healthy Habits Early',
        excerpt: 'How parents can instill healthy eating habits in children that last a lifetime.',
        image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=600&auto=format&fit=crop',
        category: 'Pediatrics',
        author: 'Dr. Sarah Mitchell',
        date: 'Dec 15, 2024',
        readTime: '5 min read',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'The Future of Telemedicine: Healthcare at Your Fingertips',
        excerpt: 'How digital health solutions are transforming patient care and accessibility.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
        category: 'Technology',
        author: 'Dr. Michael Okonkwo',
        date: 'Dec 12, 2024',
        readTime: '7 min read',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'Managing Diabetes: A Comprehensive Guide',
        excerpt: 'Essential tips for blood sugar management and living well with diabetes.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
        category: 'Endocrinology',
        author: 'Dr. James Rodriguez',
        date: 'Dec 10, 2024',
        readTime: '9 min read',
        color: 'from-orange-500 to-amber-500',
    },
    {
        title: 'Sleep Hygiene: The Key to Better Health',
        excerpt: 'Why quality sleep is crucial for your physical and mental wellbeing.',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=600&auto=format&fit=crop',
        category: 'Wellness',
        author: 'Dr. Emily Chen',
        date: 'Dec 8, 2024',
        readTime: '5 min read',
        color: 'from-indigo-500 to-purple-500',
    },
    {
        title: 'Exercise and Joint Health: What You Need to Know',
        excerpt: 'Balancing physical activity with joint protection for long-term mobility.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
        category: 'Orthopedics',
        author: 'Dr. Sarah Mitchell',
        date: 'Dec 5, 2024',
        readTime: '6 min read',
        color: 'from-pink-500 to-rose-500',
    },
];

const Blog = () => {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                <div className="  relative mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium mb-8">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Our Blog
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                            Health Insights &{' '}
                            <span className=" text-sky-500">Medical News</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Stay informed with the latest healthcare tips, research findings, and wellness advice from our medical experts.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            <section className="relative py-16">
                <div className="  mx-auto px-4">
                    <Card className="group card-hover overflow-hidden border-border/50 bg-card/50 glass animate-slide-up">
                        <div className="grid lg:grid-cols-2">
                            <div className="relative aspect-video lg:aspect-auto overflow-hidden">
                                <div className="absolute inset-0 gradient-primary opacity-20" />
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6">
                                    <Badge className="badge-gradient">{featuredPost.category}</Badge>
                                </div>
                            </div>
                            <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Featured Article
                                </div>
                                <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                                        <User className="h-4 w-4" />
                                        {featuredPost.author}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                                        <Calendar className="h-4 w-4" />
                                        {featuredPost.date}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                                        <Clock className="h-4 w-4" />
                                        {featuredPost.readTime}
                                    </span>
                                </div>
                                <Button className="w-fit group gradient-primary text-primary-foreground border-0 shadow-glow hover:shadow-[0_0_60px_hsl(262_83%_58%/0.4)] transition-all duration-500">
                                    Read Article
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="relative py-16 lg:py-24">
                <div className="blob blob-3" />

                <div className="  relative mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Latest Articles</h2>
                            <p className="text-muted-foreground">Discover insights from our medical experts</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['All', 'Cardiology', 'Wellness', 'Pediatrics'].map((filter, index) => (
                                <Button
                                    key={filter}
                                    variant={filter === 'All' ? 'default' : 'outline'}
                                    size="sm"
                                    className={filter === 'All' ? 'gradient-primary text-primary-foreground border-0' : 'glass border-border/50 hover:border-primary/50'}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <Card
                                key={post.title}
                                className="group card-hover overflow-hidden border-border/50 bg-card/50 glass animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute top-4 left-4">
                                        <Badge className={`bg-gradient-to-r ${post.color} text-white border-0`}>
                                            {post.category}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <Button variant="outline" size="lg" className="glass border-border/50 hover:border-primary/50 px-10">
                            Load More Articles
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="relative py-24">
                <div className="  mx-auto px-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden">
                        <div className="absolute inset-0 gradient-primary" />
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </div>

                        <div className="relative px-8 py-16 md:p-20 text-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-xl mx-auto">
                                Get the latest health tips and medical news delivered straight to your inbox.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 h-14 px-6 rounded-xl border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg h-14 px-8">
                                    Subscribe
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Blog;
