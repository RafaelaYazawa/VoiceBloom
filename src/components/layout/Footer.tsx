import React from 'react';
import { Mic, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Mic className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">VoiceBloom</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VoiceBloom. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="flex items-center text-sm text-muted-foreground">
              Made with <Heart className="h-3 w-3 mx-1 text-accent" /> for confident voices
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;