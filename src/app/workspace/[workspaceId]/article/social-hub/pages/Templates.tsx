import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Rocket, Lightbulb, Megaphone, Users, Star, Gift,
  BookOpen, TrendingUp, Heart, Briefcase, Copy, ArrowRight,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  topic: string;
  tone: string;
  contentType: string;
  platforms: string[];
  tags: string[];
}

const templates: Template[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Announce a new product with hype and excitement. Highlights features, benefits, and a clear CTA.",
    icon: Rocket,
    category: "Marketing",
    topic: "We're thrilled to announce the launch of [Product Name] — a game-changing solution that [key benefit]. Here's why you'll love it...",
    tone: "inspirational",
    contentType: "post",
    platforms: ["twitter", "linkedin", "instagram"],
    tags: ["launch", "announcement", "product"],
  },
  {
    id: "tips-listicle",
    name: "Tips & Tricks",
    description: "Share actionable tips in a listicle format. Great for engagement and saves.",
    icon: Lightbulb,
    category: "Educational",
    topic: "5 proven tips to [achieve goal] that most people don't know about. Backed by real experience and data.",
    tone: "educational",
    contentType: "thread",
    platforms: ["twitter", "linkedin"],
    tags: ["tips", "how-to", "listicle"],
  },
  {
    id: "sale-promo",
    name: "Sale / Promotion",
    description: "Drive urgency for a limited-time offer or discount campaign.",
    icon: Gift,
    category: "Marketing",
    topic: "🔥 FLASH SALE: Get [X]% off everything for the next 48 hours! Don't miss our biggest discount of the year.",
    tone: "casual",
    contentType: "post",
    platforms: ["instagram", "facebook", "twitter"],
    tags: ["sale", "promo", "discount"],
  },
  {
    id: "behind-scenes",
    name: "Behind the Scenes",
    description: "Show the human side of your brand with a peek behind the curtain.",
    icon: Users,
    category: "Brand",
    topic: "A day in the life at [Company]. Here's what goes on behind the scenes to bring you the products you love.",
    tone: "casual",
    contentType: "caption",
    platforms: ["instagram", "tiktok"],
    tags: ["bts", "culture", "authentic"],
  },
  {
    id: "testimonial",
    name: "Customer Testimonial",
    description: "Amplify social proof by featuring a real customer success story.",
    icon: Star,
    category: "Social Proof",
    topic: "How [Customer Name] achieved [specific result] using our [product/service]. Their story will inspire you.",
    tone: "inspirational",
    contentType: "post",
    platforms: ["linkedin", "facebook"],
    tags: ["testimonial", "case-study", "social-proof"],
  },
  {
    id: "industry-insight",
    name: "Industry Insight",
    description: "Share thought leadership and commentary on industry trends.",
    icon: TrendingUp,
    category: "Thought Leadership",
    topic: "The [industry] landscape is shifting. Here are the 3 biggest trends shaping the future and how to stay ahead.",
    tone: "professional",
    contentType: "thread",
    platforms: ["linkedin", "twitter"],
    tags: ["trends", "insight", "leadership"],
  },
  {
    id: "engagement-question",
    name: "Engagement Question",
    description: "Spark conversations with a compelling question or poll.",
    icon: Megaphone,
    category: "Engagement",
    topic: "What's the one thing you wish you knew before starting [topic]? Drop your answer below 👇",
    tone: "casual",
    contentType: "post",
    platforms: ["twitter", "facebook", "linkedin"],
    tags: ["engagement", "question", "community"],
  },
  {
    id: "how-to-guide",
    name: "How-To Guide",
    description: "Walk your audience through a step-by-step process.",
    icon: BookOpen,
    category: "Educational",
    topic: "Step-by-step guide: How to [achieve specific outcome] in under 30 minutes, even if you're a complete beginner.",
    tone: "educational",
    contentType: "story",
    platforms: ["linkedin", "instagram"],
    tags: ["tutorial", "guide", "step-by-step"],
  },
  {
    id: "brand-values",
    name: "Brand Values",
    description: "Communicate what your brand stands for and connect emotionally.",
    icon: Heart,
    category: "Brand",
    topic: "At [Company], we believe in [core value]. Here's how that belief shapes everything we do — from product to people.",
    tone: "inspirational",
    contentType: "caption",
    platforms: ["instagram", "linkedin"],
    tags: ["values", "mission", "brand-story"],
  },
  {
    id: "hiring-post",
    name: "We're Hiring",
    description: "Attract top talent with an exciting job announcement.",
    icon: Briefcase,
    category: "Recruitment",
    topic: "We're growing! Join our team as a [Role]. We offer [benefits] and a culture that values [values]. Apply now!",
    tone: "professional",
    contentType: "post",
    platforms: ["linkedin", "twitter"],
    tags: ["hiring", "jobs", "careers"],
  },
];

const categories = [...new Set(templates.map((t) => t.category))];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = selectedCategory
    ? templates.filter((t) => t.category === selectedCategory)
    : templates;

  const handleUseTemplate = (template: Template) => {
    sessionStorage.setItem("template", JSON.stringify({
      topic: template.topic,
      platforms: template.platforms,
      tone: template.tone,
      contentType: template.contentType,
    }));
    navigate("/");
    toast({ title: "Template loaded!", description: `"${template.name}" is ready to customize.` });
  };

  const handleCopyPrompt = async (template: Template) => {
    await navigator.clipboard.writeText(template.topic);
    toast({ title: "Prompt copied to clipboard!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <header className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Content Templates</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Jump-start your content with pre-built prompts. Pick a template, customize, and generate.
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <Card key={template.id} className="glass-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <template.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/70 italic line-clamp-2">
                  "{template.topic}"
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleCopyPrompt(template)} className="flex-1">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button size="sm" onClick={() => handleUseTemplate(template)} className="flex-1">
                  <ArrowRight className="w-3 h-3 mr-1" /> Use
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}