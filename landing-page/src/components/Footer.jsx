import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: About */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">YT2Blog</h3>
              <p className="text-gray-400 text-sm">
                Transform YouTube content into well-crafted blog articles with the power of AI.
                Streamline your content creation process.
              </p>
            </div>
            
            {/* Column 2: Open Source */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Open Source</h3>
              <p className="text-gray-400 text-sm mb-4">
                YT2Blog is free and open source software under the MIT License.
              </p>
              <div className="flex space-x-3">
                <a href="https://github.com/lagna360/yt2blog" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {currentYear} YT2Blog. <span className="text-indigo-400">Free and Open Source Software</span> under the MIT License.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
