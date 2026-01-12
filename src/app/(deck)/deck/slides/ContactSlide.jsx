import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSlide = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Message Sent!", description: "We'll get back to you as soon as possible." });
    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, label: "Email", value: "info@devlomatix.in" },
    { icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+91 9712340450" },
    { icon: <MapPin className="w-5 h-5" />, label: "Location", value: "India" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-bold font-display text-center mb-2">Get in <span className="text-gradient-primary">Touch</span></motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-muted-foreground text-center mb-8 max-w-md">Have questions? We'd love to hear from you.</motion.p>
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <motion.form initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} onSubmit={handleSubmit} className="glass-effect rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required className="bg-background/50" />
            <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="bg-background/50" />
          </div>
          <Input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="bg-background/50" />
          <Textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleChange} required rows={4} className="bg-background/50 resize-none" />
          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-primary hover:opacity-90">{isSubmitting ? "Sending..." : <>Send Message<Send className="w-4 h-4 ml-2" /></>}</Button>
        </motion.form>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col justify-center space-y-6">
          {contactInfo.map((info, index) => (
            <motion.div key={info.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }} className="glass-effect rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">{info.icon}</div>
              <div><p className="text-sm text-muted-foreground">{info.label}</p><p className="font-medium text-foreground">{info.value}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ContactSlide;
