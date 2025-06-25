import React from "react";
import { Link } from "react-router-dom";
import { Mic, LineChart, Users, Shield, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Mic className="h-6 w-6 text-primary" />,
      title: "Daily Speaking Practice",
      description:
        "Build confidence through consistent daily prompts designed to help you practice speaking.",
    },
    {
      icon: <LineChart className="h-6 w-6 text-primary" />,
      title: "Track Your Progress",
      description:
        "Monitor improvements in tone, confidence, and fluency over time with visual charts.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Supportive Community",
      description:
        "Share your recordings and receive positive feedback from a community of language learners.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Private Journal",
      description:
        "Keep recordings private and maintain a personal journal to reflect on your speaking journey.",
    },
  ];

  const testimonials = [
    {
      quote:
        "VoiceBloom helped me overcome my fear of speaking in meetings. The daily practice made a huge difference!",
      author: "Sarah K.",
      role: "Marketing Professional",
    },
    {
      quote:
        "As someone learning English, this app has been invaluable for improving my pronunciation and confidence.",
      author: "Miguel T.",
      role: "Language Learner",
    },
    {
      quote:
        "I've seen dramatic improvements in my public speaking after just 30 days of consistent practice.",
      author: "Jason W.",
      role: "College Student",
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-20 right-4 sm:top-10 sm:right-6 md:top-20 md:right-10 lg:top-20 lg:right-20 "
      >
        <img
          src="src/public/BoltBadge/BoltNew-black_circle_360x360.png"
          alt="Powered by Bolt"
          className="size-20 sm:size-14 md:size-20 lg:size-24"
        />
      </a>
      <section className="text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold"
        >
          Find Your Voice,{" "}
          <span className="text-primary">Build Your Confidence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          VoiceBloom helps shy people, language learners, and those with hearing
          disabilities build speaking confidence through daily practice and
          supportive community feedback.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth?register=true" className="btn-primary min-w-[180px]">
            Get Started Free
          </Link>
          <Link to="/auth" className="btn-outline min-w-[180px]">
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our simple process helps you build confidence through consistent
            practice and reflection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">1. Record Daily</h3>
            <p className="text-muted-foreground">
              Respond to thoughtful prompts with voice recordings in a safe,
              private environment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">2. Reflect & Track</h3>
            <p className="text-muted-foreground">
              Rate your performance and write reflections to build
              self-awareness.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">3. Share & Grow</h3>
            <p className="text-muted-foreground">
              Optionally share recordings to receive kind feedback from our
              supportive community.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-16 -mx-4 px-4 rounded-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              Features You'll Love
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build speaking confidence at your own pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-sm border flex items-start"
              >
                <div className="mr-4 mt-1">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands who have transformed their speaking confidence with
            VoiceBloom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <p className="italic text-muted-foreground mb-4">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white p-10 rounded-xl text-center space-y-6">
        <h2 className="text-3xl font-semibold">Ready to Find Your Voice?</h2>
        <p className="max-w-2xl mx-auto">
          Join thousands of people who are overcoming their speaking anxiety and
          building confidence one recording at a time.
        </p>
        <Link
          to="/auth?register=true"
          className="inline-block bg-white text-primary font-medium px-8 py-3 rounded-md hover:bg-white/90 transition-colors"
        >
          Start Your Free Account
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
